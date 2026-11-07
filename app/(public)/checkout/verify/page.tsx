"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { useAppDispatch } from "@/lib/hooks";
import { clearCart } from "@/lib/features/cart/cartSlice";

/* =========================================================
   TYPES
========================================================= */

interface VerifyPaymentResponse {
  success: boolean;
  message: string;

  data?: {
    orderNumber: string;
    reference: string;
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function VerifyCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dispatch = useAppDispatch();

  const reference =
    searchParams.get("reference");

  const [status, setStatus] = React.useState<
    "verifying" | "success" | "failed"
  >("verifying");

  const [message, setMessage] =
    React.useState(
      "Verifying your payment..."
    );

  const hasVerified =
    React.useRef(false);

  React.useEffect(() => {
    /*
     * Prevent duplicate verification.
     *
     * This is particularly useful in development
     * where React Strict Mode can run effects twice.
     */
    if (hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    const verifyPayment = async () => {
      /*
       * No reference was returned by Paystack.
       */
      if (!reference) {
        setStatus("failed");
        setMessage(
          "No payment reference was provided."
        );

        setTimeout(() => {
          router.replace(
            "/checkout/failed"
          );
        }, 1500);

        return;
      }

      try {
        setStatus("verifying");
        setMessage(
          "Verifying your payment..."
        );

        const response = await fetch(
          "/api/payment/verify",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              reference,
            }),
          }
        );

        const result =
          (await response.json()) as VerifyPaymentResponse;

        /*
         * Verification failed.
         */
        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Payment verification failed."
          );
        }

        /*
         * Payment is confirmed by the server.
         *
         * Only NOW should we clear Redux.
         */
        dispatch(clearCart());

        setStatus("success");

        setMessage(
          "Payment successful. Your order has been confirmed."
        );

        /*
         * Give the customer a moment to see
         * the success state before redirecting.
         */
        setTimeout(() => {
          const orderNumber =
            result.data?.orderNumber;

          if (orderNumber) {
            router.replace(
              `/checkout/success?order=${encodeURIComponent(
                orderNumber
              )}`
            );
          } else {
            router.replace(
              "/checkout/success"
            );
          }
        }, 1200);
      } catch (error) {
        console.error(
          "PAYMENT VERIFICATION ERROR:",
          error
        );

        setStatus("failed");

        setMessage(
          error instanceof Error
            ? error.message
            : "We could not verify your payment."
        );

        setTimeout(() => {
          router.replace(
            `/checkout/failed?reference=${encodeURIComponent(
              reference
            )}`
          );
        }, 1800);
      }
    };

    verifyPayment();
  }, [reference, router, dispatch]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-5 py-20 text-neutral-950 sm:px-8">
      <div className="flex w-full max-w-[520px] flex-col items-center text-center">
        {/* -----------------------------------------------
            VERIFYING
        ------------------------------------------------ */}

        {status === "verifying" && (
          <>
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <Loader2
                className="animate-spin"
                size={36}
                strokeWidth={1.5}
              />
            </div>

            <h1 className="text-[30px] leading-tight tracking-[-0.02em]">
              Verifying Payment
            </h1>

            <p className="mt-4 max-w-[420px] text-[16px] leading-[1.6] text-black/55">
              Please wait while we confirm your
              payment. Do not close this page.
            </p>
          </>
        )}

        {/* -----------------------------------------------
            SUCCESS
        ------------------------------------------------ */}

        {status === "success" && (
          <>
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <CheckCircle2
                size={38}
                strokeWidth={1.5}
              />
            </div>

            <h1 className="text-[30px] leading-tight tracking-[-0.02em]">
              Payment Successful
            </h1>

            <p className="mt-4 max-w-[420px] text-[16px] leading-[1.6] text-black/55">
              {message}
            </p>
          </>
        )}

        {/* -----------------------------------------------
            FAILED
        ------------------------------------------------ */}

        {status === "failed" && (
          <>
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <XCircle
                size={38}
                strokeWidth={1.5}
              />
            </div>

            <h1 className="text-[30px] leading-tight tracking-[-0.02em]">
              Payment Verification Failed
            </h1>

            <p className="mt-4 max-w-[420px] text-[16px] leading-[1.6] text-black/55">
              {message}
            </p>

            <p className="mt-6 text-[14px] text-black/40">
              Redirecting you...
            </p>
          </>
        )}
      </div>
    </main>
  );
}