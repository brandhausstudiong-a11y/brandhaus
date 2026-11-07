import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { PaymentStatus } from "@/lib/generated/prisma/enums";

interface InitializePaymentInput {
  orderId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } =
      (await request.json()) as InitializePaymentInput;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Get the order from the database.
     *
     * IMPORTANT:
     * Amount/email/reference all come from Neon,
     * not the browser.
     */
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    if (!order.payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment record not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Don't initialize an already successful payment.
     */
    if (
      order.payment.status ===
      PaymentStatus.SUCCESS
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Order has already been paid.",
        },
        { status: 409 }
      );
    }

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        "PAYSTACK_SECRET_KEY is not configured."
      );
    }

    /*
     * Paystack expects amount in kobo.
     *
     * ₦93,500
     *      ↓
     * 9,350,000 kobo
     */
    const amountInKobo = order.total
      .mul(100)
      .toFixed(0);

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      throw new Error(
        "NEXT_PUBLIC_APP_URL is not configured."
      );
    }

    /*
     * Initialize Paystack transaction.
     */
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: order.customerEmail,

          amount: amountInKobo,

          currency: "NGN",

          reference:
            order.payment.reference,

          callback_url:
            `${appUrl}/checkout/verify`,

          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        }),

        cache: "no-store",
      }
    );

    const paystackData =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData.status
    ) {
      console.error(
        "PAYSTACK INITIALIZATION ERROR:",
        paystackData
      );

      return NextResponse.json(
        {
          success: false,
          message:
            paystackData.message ??
            "Unable to initialize payment.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,

      message: "Payment initialized.",

      data: {
        authorizationUrl:
          paystackData.data.authorization_url,

        accessCode:
          paystackData.data.access_code,

        reference:
          paystackData.data.reference,
      },
    });
  } catch (error) {
    console.error(
      "INITIALIZE PAYMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to initialize payment.",
      },
      { status: 500 }
    );
  }
}