import OrderDetail, {
  type OrderDetailData,
  type OrderStatus,
  type PaymentStatus,
} from "@/components/admin/OrderDetail";
import { buttonVariants } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ order_number: string }>;
};

const orderStatusLabels: Record<string, OrderStatus> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const paymentStatusLabels: Record<string, PaymentStatus> = {
  PENDING: "Pending",
  SUCCESS: "Successful",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps) {
  const { order_number } = await params;

  const record = await prisma.order.findUnique({
    where: { orderNumber: decodeURIComponent(order_number) },
    include: {
      customer: true,
      payment: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!record) notFound();

  const order: OrderDetailData = {
    orderNo: record.orderNumber,
    orderStatus: orderStatusLabels[record.status] ?? "Pending",
    paymentStatus: paymentStatusLabels[record.payment?.status ?? "PENDING"] ?? "Pending",
    amountPaid:
      record.payment?.status === "SUCCESS"
        ? Number(record.payment.amount)
        : 0,
    cartTotalAmount: Number(record.subtotal),
    deliveryFee: Number(record.deliveryFee),
    date: record.createdAt.toISOString(),
    customer: {
      name:
        record.customerName ||
        record.customer?.name ||
        "Unknown customer",
      email:
        record.customerEmail ||
        record.customer?.email ||
        "No email provided",
      note: "No note provided.",
    },
    products: record.items.map((item) => ({
      id: item.id,
      featuredImage: item.featuredImage || "/placeholder.svg",
      name: item.productName,
      sku: item.sku || "—",
      color: item.color || "—",
      size: item.size || "—",
      originalPrice: Number(item.price),
      finalUnitPrice: Number(item.finalUnitPrice),
      discount: Number(item.percentageDiscount),
      quantity: item.quantity,
    })),
  };

  return (
    <main className="grid grid-cols-1 gap-4">
      <div className="mb-4 flex items-end justify-between">
        <h3 className="text-lg font-medium capitalize">Order Detail</h3>
        <Link href="/admin/orders" className={buttonVariants()}>
          <ArrowLeft className="size-4" />
          All Orders
        </Link>
      </div>

      <OrderDetail order={order} />
    </main>
  );
}
