"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";

interface PaymentFailedProps {
  reference?: string;
  message?: string;
}

export default function PaymentFailed({
  reference,
  message = "We were unable to complete your payment.",
}: PaymentFailedProps) {
  return (
    <section className="section-wrapper">
      <div className="mx-auto max-w-[760px] text-center">
        {/* Status Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black">
          <span className="text-[28px] leading-none font-light">
            ×
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-8 text-[32px] leading-[1.1] tracking-[-0.03em] sm:text-[42px]">
          Payment Unsuccessful
        </h1>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.5] text-black/55">
          {message} No payment has been charged to your
          account.
        </p>

        {/* Reference */}
        {reference && (
          <div className="mt-7">
            <p className="text-[13px] uppercase tracking-[0.12em] text-black/40">
              Payment Reference
            </p>

            <p className="mt-2 text-[15px]">
              {reference}
            </p>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="mx-auto mt-16 max-w-[760px] border-y border-black/20 py-8">
        <h2 className="text-[20px] tracking-[-0.02em]">
          What happened?
        </h2>

        <p className="mt-4 text-[15px] leading-[1.6] text-black/55">
          Your payment could not be completed. This can
          happen if the transaction was cancelled, declined,
          timed out, or there was a temporary issue with the
          payment provider.
        </p>

        <p className="mt-4 text-[15px] leading-[1.6] text-black/55">
          Your cart has not been cleared, so you can return
          to checkout and try again.
        </p>
      </div>

      {/* Actions */}
      <div className="mx-auto mt-12 flex max-w-[760px] flex-col gap-4 sm:flex-row">
        <Link
          href="/checkout"
          className="
            flex
            h-[64px]
            flex-1
            items-center
            justify-center
            gap-3
            bg-black
            text-[15px]
            text-white
            transition-opacity
            hover:opacity-80
          "
        >
          <RefreshCcw size={18} strokeWidth={1.5} />
          Try Payment Again
        </Link>

        <Link
          href="/shop"
          className="
            flex
            h-[64px]
            flex-1
            items-center
            justify-center
            gap-3
            border
            border-black
            text-[15px]
            transition-colors
            hover:bg-black
            hover:text-white
          "
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Return to Shop
        </Link>
      </div>

      {/* Support */}
      <p className="mx-auto mt-10 max-w-[520px] text-center text-[14px] leading-[1.5] text-black/40">
        If money was deducted from your account despite
        this message, please allow some time for the
        transaction to be reversed. If the issue persists,
        contact our support team.
      </p>
    </section>
  );
}