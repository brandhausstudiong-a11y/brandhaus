import PaymentConfirmation from "@/components/checkout/PaymentConfirmation";
import { getOrderByOrderNumber } from "@/lib/orders";

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    order?: string;
  }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams;

  const orderNumber = params.order;

  if (!orderNumber) {
    return (
      <main className="section-wrapper py-24">
        <div className="mx-auto max-w-[760px] text-center">
          <h1 className="text-3xl">
            Order information unavailable
          </h1>

          <p className="mt-4 text-black/55">
            We could not determine the order associated with
            this payment.
          </p>
        </div>
      </main>
    );
  }

  const order = await getOrderByOrderNumber(orderNumber);

  if (!order) {
    return (
      <main className="section-wrapper py-24">
        <div className="mx-auto max-w-[760px] text-center">
          <h1 className="text-3xl">
            Order not found
          </h1>

          <p className="mt-4 text-black/55">
            We could not find an order with the number{" "}
            <strong>{orderNumber}</strong>.
          </p>
        </div>
      </main>
    );
  }

  /*
   * Only show the confirmation page if payment
   * has actually been confirmed.
   */
  if (order.payment?.status !== "SUCCESS") {
    return (
      <main className="section-wrapper py-24">
        <div className="mx-auto max-w-[760px] text-center">
          <h1 className="text-3xl">
            Payment not confirmed
          </h1>

          <p className="mt-4 text-black/55">
            We could not confirm payment for this order yet.
            Please try again shortly.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <PaymentConfirmation order={order} />
    </main>
  );
}