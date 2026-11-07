import prisma from "@/lib/prisma";

export async function getOrderByOrderNumber(
  orderNumber: string
) {
  const order = await prisma.order.findUnique({
    where: {
      orderNumber,
    },
    include: {
      customer: true,
      items: true,
      payment: true,
    },
  });

  if (!order) {
    return null;
  }

  return {
    orderNumber: order.orderNumber,

    paymentReference: order.payment?.reference ?? "",

    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),

    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone ?? "",
    },

    shippingAddress: {
      address: order.shippingAddress,
      city: order.shippingCity,
      state: order.shippingState,
      country: order.shippingCountry,
    },

    items: order.items.map((item) => ({
      id: item.id,
      name: item.productName,
      quantity: item.quantity,

      // Price actually paid after discount
      price: Number(item.finalUnitPrice),

      variant: [
        item.color,
        item.size,
      ]
        .filter(Boolean)
        .join(" / "),
    })),

    payment: order.payment
      ? {
          reference: order.payment.reference,
          status: order.payment.status,
          amount: Number(order.payment.amount),
          currency: order.payment.currency,
          paidAt: order.payment.paidAt,
        }
      : null,
  };
}