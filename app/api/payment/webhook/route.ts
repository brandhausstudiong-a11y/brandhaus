
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import {
  OrderStatus,
  PaymentStatus,
} from "@/lib/generated/prisma/enums";

export const runtime = "nodejs";

interface PaystackWebhookEvent {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
  };
}

function isValidPaystackSignature(
  rawBody: string,
  signature: string,
  secretKey: string
): boolean {
  const expectedSignature = createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  // Reject malformed signatures before comparing them.
  if (!/^[a-f0-9]{128}$/i.test(signature)) {
    return false;
  }

  const received = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY is not configured.");

    return NextResponse.json(
      { success: false, message: "Server configuration error." },
      { status: 500 }
    );
  }

  // IMPORTANT: Verify the exact raw body before parsing JSON.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (
    !signature ||
    !isValidPaystackSignature(rawBody, signature, secretKey)
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid webhook signature." },
      { status: 401 }
    );
  }

  let event: PaystackWebhookEvent;

  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  // This handler only processes successful charges.
  // Acknowledge unrelated events so they aren't retried.
  if (
    event.event !== "charge.success" ||
    event.data?.status !== "success"
  ) {
    return NextResponse.json({
      success: true,
      message: "Event acknowledged.",
    });
  }

  const reference = event.data.reference;
  const amountInKobo = event.data.amount;
  const currency = event.data.currency;

  if (
    !reference ||
    typeof amountInKobo !== "number" ||
    !Number.isSafeInteger(amountInKobo) ||
    amountInKobo <= 0 ||
    !currency
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid payment data." },
      { status: 400 }
    );
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: {
        order: true,
      },
    });

    // A valid event may arrive before the local payment record
    // becomes visible. Return a non-2xx response so Paystack retries.
    if (!payment) {
      console.error("Payment record not found for reference:", reference);

      return NextResponse.json(
        { success: false, message: "Payment record not found." },
        { status: 404 }
      );
    }

    // Paystack reports amounts in the smallest currency unit (kobo).
    const expectedPaymentKobo = Math.round(
      payment.amount.toNumber() * 100
    );

    const expectedOrderKobo = Math.round(
      payment.order.total.toNumber() * 100
    );

    // Never trust the webhook amount alone.
    if (
      currency !== payment.currency ||
      currency !== "NGN" ||
      amountInKobo !== expectedPaymentKobo ||
      amountInKobo !== expectedOrderKobo
    ) {
      console.error("Webhook payment mismatch:", {
        reference,
        currency,
        amountInKobo,
        expectedPaymentKobo,
        expectedOrderKobo,
      });

      // Acknowledge but do not mark this order as paid.
      // Investigate the mismatch in your server logs.
      return NextResponse.json({
        success: true,
        message: "Payment mismatch recorded for investigation.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Re-read inside the transaction for idempotency.
      const currentPayment = await tx.payment.findUnique({
        where: { reference },
        include: { order: true },
      });

      if (!currentPayment) {
        throw new Error("Payment disappeared during processing.");
      }

      // Paystack may deliver the same event more than once.
      if (currentPayment.status === PaymentStatus.SUCCESS) {
        return { alreadyProcessed: true };
      }

      // Recheck persisted amounts before changing the database.
      const paymentAmountKobo = Math.round(
        currentPayment.amount.toNumber() * 100
      );

      const orderAmountKobo = Math.round(
        currentPayment.order.total.toNumber() * 100
      );

      if (
        amountInKobo !== paymentAmountKobo ||
        amountInKobo !== orderAmountKobo ||
        currency !== currentPayment.currency
      ) {
        throw new Error("Payment details changed during processing.");
      }

      await tx.payment.update({
        where: { reference },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
        },
      });

      // Don't overwrite a later order status such as SHIPPED
      // or DELIVERED.
      if (currentPayment.order.status === OrderStatus.PENDING) {
        await tx.order.update({
          where: { id: currentPayment.orderId },
          data: { status: OrderStatus.PROCESSING },
        });
      }

      return { alreadyProcessed: false };
    });

    console.info("Paystack webhook processed:", {
      reference,
      alreadyProcessed: result.alreadyProcessed,
    });

    return NextResponse.json({
      success: true,
      message: result.alreadyProcessed
        ? "Payment was already processed."
        : "Payment confirmed successfully.",
    });
  } catch (error) {
    console.error("PAYSTACK WEBHOOK ERROR:", error);

    // A 5xx response allows Paystack to retry.
    return NextResponse.json(
      { success: false, message: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
