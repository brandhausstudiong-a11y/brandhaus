import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import {
  OrderStatus,
  PaymentStatus,
} from "@/lib/generated/prisma/enums";

export async function POST(
  request: NextRequest
) {
  try {
    const { reference } =
      await request.json();

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Find our payment first.
     */
    const payment =
      await prisma.payment.findUnique({
        where: {
          reference,
        },

        include: {
          order: true,
        },
      });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Idempotency:
     *
     * If we've already verified this payment,
     * don't process it again.
     */
    if (
      payment.status ===
      PaymentStatus.SUCCESS
    ) {
      return NextResponse.json({
        success: true,

        data: {
          orderNumber:
            payment.order.orderNumber,

          reference:
            payment.reference,
        },
      });
    }

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        "PAYSTACK_SECRET_KEY is not configured."
      );
    }

    /*
     * Ask Paystack for the authoritative
     * transaction status.
     */
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        headers: {
          Authorization:
            `Bearer ${secretKey}`,
        },

        cache: "no-store",
      }
    );

    const paystack =
      await response.json();

    if (
      !response.ok ||
      !paystack.status
    ) {
      throw new Error(
        paystack.message ||
          "Unable to verify payment."
      );
    }

    /*
     * Paystack returns amount in kobo.
     */
    const expectedAmount =
      payment.amount
        .mul(100)
        .toNumber();

    const paidAmount =
      Number(paystack.data.amount);

    /*
     * Validate BOTH status and amount.
     */
    if (
      paystack.data.status !==
        "success" ||
      paidAmount !== expectedAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment could not be confirmed.",
        },
        { status: 400 }
      );
    }

    /*
     * Update Payment + Order atomically.
     */
    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status:
            PaymentStatus.SUCCESS,

          paidAt: new Date(),
        },
      }),

      prisma.order.update({
        where: {
          id: payment.orderId,
        },

        data: {
          status:
            OrderStatus.PROCESSING,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,

      message:
        "Payment verified successfully.",

      data: {
        orderNumber:
          payment.order.orderNumber,

        reference,
      },
    });
  } catch (error) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}