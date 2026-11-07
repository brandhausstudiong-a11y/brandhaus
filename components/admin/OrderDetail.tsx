"use client";

import Image from "next/image";

import {
  CalendarDays,
  Mail,
  User,
} from "lucide-react";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus =
  | "Pending"
  | "Successful"
  | "Failed"
  | "Refunded";

type OrderProduct = {
  id: string;
  featuredImage: string;
  name: string;
  sku: string;
  color: string;
  size: string;
  originalPrice: number;
  finalUnitPrice: number;
  discount: number;
  quantity: number;
};

export type OrderDetailData = {
  orderNo: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  cartTotalAmount: number;
  deliveryFee: number;
  date: string;

  customer: {
    name: string;
    email: string;
    note?: string;
  };

  products: OrderProduct[];
};

interface OrderDetailProps {
  order: OrderDetailData;
}

/* =========================================================
   HELPERS
========================================================= */

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/* =========================================================
   STATUS
========================================================= */

function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const styles: Record<OrderStatus, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-violet-100 text-violet-700",
    Delivered: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const styles: Record<PaymentStatus, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Successful: "bg-emerald-100 text-emerald-700",
    Failed: "bg-red-100 text-red-600",
    Refunded: "bg-violet-100 text-violet-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-neutral-500">
        {label}
      </p>

      <div className="text-base font-medium text-neutral-900">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function OrderDetail({
  order,
}: OrderDetailProps) {
  return (
    <section className="w-full space-y-8">
      {/* =====================================================
          ORDER DETAIL
      ====================================================== */}

      <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8">
          <h2 className="text-xl font-medium tracking-tight text-neutral-950">
            Order Detail
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {/* Order Number */}

          <DetailItem label="Order Number">
            {order.orderNo}
          </DetailItem>

          {/* Order Status */}

          <DetailItem label="Order Status">
            <OrderStatusBadge
              status={order.orderStatus}
            />
          </DetailItem>

          {/* Payment Status */}

          <DetailItem label="Payment Status">
            <PaymentStatusBadge
              status={order.paymentStatus}
            />
          </DetailItem>

          {/* Amount Paid */}

          <DetailItem label="Amount Paid">
            <span className="text-emerald-600">
              {formatAmount(
                order.amountPaid
              )}
            </span>
          </DetailItem>

          {/* Cart Total */}

          <DetailItem label="Cart Total Amount">
            {formatAmount(
              order.cartTotalAmount
            )}
          </DetailItem>

          {/* Delivery Fee */}

          <DetailItem label="Delivery Fee">
            {formatAmount(
              order.deliveryFee
            )}
          </DetailItem>

          {/* Date */}

          <DetailItem label="Date">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-neutral-400" />

              {formatDate(order.date)}
            </div>
          </DetailItem>
        </div>
      </section>

      {/* =====================================================
          CUSTOMER DETAIL
      ====================================================== */}

      <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8">
          <h2 className="text-xl font-medium tracking-tight text-neutral-950">
            Customer Detail
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-7 md:grid-cols-2">
          {/* Customer Name */}

          <DetailItem label="Name">
            <div className="flex items-center gap-2">
              <User className="size-4 text-neutral-400" />

              {order.customer.name}
            </div>
          </DetailItem>

          {/* Email */}

          <DetailItem label="Email">
            <div className="flex items-center gap-2 break-all">
              <Mail className="size-4 shrink-0 text-neutral-400" />

              {order.customer.email}
            </div>
          </DetailItem>

          {/* Note */}

          <div className="space-y-1.5 md:col-span-2">
            <p className="text-sm font-medium text-neutral-500">
              Note
            </p>

            <div className="rounded-md bg-neutral-100 px-5 py-4 text-sm leading-6 text-neutral-700">
              {order.customer.note ||
                "No note provided."}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT ITEMS
      ====================================================== */}

      <section className="rounded-xl bg-white shadow-sm">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-xl font-medium tracking-tight text-neutral-950">
              Product Items
            </h2>
          </div>

          {/* Table */}

          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-100">
                    <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-600">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-600">
                      SKU
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-600">
                      Color
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-600">
                      Size
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-600">
                      Original Price
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-600">
                      Discount
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-600">
                      Quantity
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {order.products.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className="border-b border-neutral-200 last:border-b-0"
                      >
                        {/* Product */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                              <Image
                                src={
                                  product.featuredImage
                                }
                                alt={
                                  product.name
                                }
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>

                            <span className="max-w-[220px] text-sm font-medium text-neutral-900">
                              {product.name}
                            </span>
                          </div>
                        </td>

                        {/* SKU */}

                        <td className="px-5 py-4">
                          <span className="text-sm text-neutral-600">
                            {product.sku}
                          </span>
                        </td>

                        {/* Color */}

                        <td className="px-5 py-4">
                          <span className="text-sm text-neutral-700">
                            {product.color}
                          </span>
                        </td>

                        {/* Size */}

                        <td className="px-5 py-4">
                          <span className="text-sm text-neutral-700">
                            {product.size}
                          </span>
                        </td>

                        {/* Original Price */}

                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-neutral-900">
                            {formatAmount(
                              product.originalPrice
                            )}
                          </span>
                        </td>

                        {/* Discount */}

                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-emerald-600">
                            {product.discount}%
                          </span>
                        </td>

                        {/* Quantity */}

                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-neutral-900">
                            {product.quantity}
                          </span>
                        </td>
                      </tr>
                    )
                  )}

                  {order.products.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="h-32 text-center text-sm text-neutral-500"
                      >
                        No products in this
                        order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}