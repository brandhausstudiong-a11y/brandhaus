import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireAdminApi();
  if (access instanceof Response) return access;

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        payment: true,
        items: { orderBy: { createdAt: "asc" } },
      },
    });

    const orderStatusLabels: Record<string, string> = {
      PENDING: "Pending",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };

    const paymentStatusLabels: Record<string, string> = {
      PENDING: "Pending",
      SUCCESS: "Successful",
      FAILED: "Failed",
      REFUNDED: "Refunded",
    };

    const data = orders.map((order) => {
      const paymentStatus = order.payment?.status ?? "PENDING";

      return {
        id: order.id,
        orderNo: order.orderNumber,
        customerEmail: order.customerEmail || order.customer.email,
        customerName: order.customerName || order.customer.name,
        customerPhone: order.customerPhone ?? order.customer.phone,
        orderStatus: orderStatusLabels[order.status] ?? order.status,
        paymentStatus: paymentStatusLabels[paymentStatus] ?? paymentStatus,
        amountPaid:
          paymentStatus === "SUCCESS" && order.payment
            ? Number(order.payment.amount)
            : 0,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        date: order.createdAt.toISOString().slice(0, 10),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        shippingAddress: {
          address: order.shippingAddress,
          city: order.shippingCity,
          state: order.shippingState,
          country: order.shippingCountry,
        },
        payment: order.payment
          ? {
              id: order.payment.id,
              reference: order.payment.reference,
              gateway: order.payment.gateway,
              amount: Number(order.payment.amount),
              currency: order.payment.currency,
              status: order.payment.status,
              paidAt: order.payment.paidAt?.toISOString() ?? null,
              createdAt: order.payment.createdAt.toISOString(),
            }
          : null,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          featuredImage: item.featuredImage,
          slug: item.slug,
          category: item.category,
          sku: item.sku,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          price: Number(item.price),
          percentageDiscount: Number(item.percentageDiscount),
          finalUnitPrice: Number(item.finalUnitPrice),
          totalPrice: Number(item.totalPrice),
          createdAt: item.createdAt.toISOString(),
        })),
      };
    });

    return NextResponse.json(
      { success: true, data },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("ADMIN ORDERS GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to retrieve orders." },
      { status: 500 },
    );
  }
}
