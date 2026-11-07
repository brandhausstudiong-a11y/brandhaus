import Link from "next/link";
import {
  Check,
  ArrowRight,
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface Order {
  orderNumber: string;
  paymentReference: string;
  subtotal: number;
  deliveryFee: number;
  total: number;

  customer: {
    name: string;
    email: string;
    phone: string;
  };

  shippingAddress: {
    address: string;
    city: string;
    state: string;
    country: string;
  };

  items: OrderItem[];
}

interface PaymentConfirmationProps {
  order: Order;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function PaymentConfirmation({
  order,
}: PaymentConfirmationProps) {
  return (
    <section className="section-wrapper py-16 sm:py-20 lg:py-24">
      {/* SUCCESS HEADER */}

      <div className="mx-auto max-w-[760px] text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black">
          <Check
            size={28}
            strokeWidth={1.5}
          />
        </div>

        <h1 className="mt-8 text-[32px] leading-[1.1] tracking-[-0.03em] sm:text-[42px]">
          Order Confirmed
        </h1>

        <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.5] text-black/55">
          Thank you for your order, {order.customer.name}.
          Your payment has been received and your order is
          now being processed.
        </p>

        <p className="mt-6 text-[14px] uppercase tracking-[0.12em] text-black/50">
          Order #{order.orderNumber}
        </p>
      </div>

      {/* CONTENT */}

      <div className="mx-auto mt-16 grid max-w-[1100px] grid-cols-1 gap-16 lg:grid-cols-[1.3fr_0.7fr] lg:gap-24">
        {/* ORDER */}

        <div>
          <h2 className="text-[24px] tracking-[-0.02em]">
            Order Summary
          </h2>

          <div className="mt-8 border-t border-black">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-8 border-b border-black/20 py-6"
              >
                <div>
                  <p className="text-[16px]">
                    {item.name}
                  </p>

                  {item.variant && (
                    <p className="mt-1 text-[14px] text-black/50">
                      {item.variant}
                    </p>
                  )}

                  <p className="mt-1 text-[14px] text-black/50">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="shrink-0 text-[16px]">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* TOTALS */}

          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                {formatCurrency(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span>
                {formatCurrency(order.deliveryFee)}
              </span>
            </div>

            <div className="my-5 border-t border-black" />

            <div className="flex justify-between text-[18px] font-medium">
              <span>Total</span>
              <span>
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* DELIVERY */}

        <div>
          <h2 className="text-[24px] tracking-[-0.02em]">
            Delivery Information
          </h2>

          <div className="mt-8 bg-[#eeece9] p-7">
            <p className="text-[16px] font-medium">
              {order.customer.name}
            </p>

            <p className="mt-5 text-[15px] leading-[1.6] text-black/65">
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.city}
              <br />
              {order.shippingAddress.state}
              <br />
              {order.shippingAddress.country}
            </p>

            <div className="mt-7 border-t border-black/20 pt-6">
              <p className="text-[14px] text-black/50">
                Email
              </p>

              <p className="mt-1 text-[15px]">
                {order.customer.email}
              </p>

              <p className="mt-5 text-[14px] text-black/50">
                Phone
              </p>

              <p className="mt-1 text-[15px]">
                {order.customer.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="mx-auto mt-16 flex max-w-[1100px] flex-col gap-4 sm:flex-row">
        {/* <Link
          href={`/account/orders/${order.orderNumber}`}
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
          View Order
          <ArrowRight size={18} />
        </Link> */}

        <Link
          href="/shop"
          className="
            flex
            h-[64px]
            flex-1
            items-center
            justify-center
            border
            border-black
            text-[15px]
            transition-colors
            hover:bg-black
            hover:text-white
          "
        >
          Continue Shopping
        </Link>
      </div>

      <p className="mx-auto mt-8 max-w-[600px] text-center text-[14px] leading-[1.5] text-black/45">
        A confirmation email containing your order details
        has been sent to {order.customer.email}.
      </p>
    </section>
  );
}