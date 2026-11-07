import type { CartItem } from "@/lib/features/cart/cartSlice";
import type { CheckoutFormData } from "@/components/CheckoutDetail";

interface CreateOrderResponse {
  success: boolean;
  message: string;
  data?: {
    order: {
      id: string;
      orderNumber: string;
      subtotal: string;
      deliveryFee: string;
      total: string;
      status: string;
      payment: {
        id: string;
        reference: string;
        amount: string;
        currency: string;
        status: string;
      } | null;
    };
  };
}

export async function CreateOrder(
  cartItems: CartItem[],
  formData: CheckoutFormData
): Promise<CreateOrderResponse> {
  const response = await fetch(
    "/api/store/orders",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        cartItems: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),

        formData,
      }),
    }
  );

  const result =
    (await response.json()) as CreateOrderResponse;

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to create order."
    );
  }

  return result;
}