interface InitializePaymentResponse {
  success: boolean;
  message: string;

  data?: {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  };
}

export async function InitializePayment(
  orderId: string
): Promise<InitializePaymentResponse> {
  const response = await fetch(
    "/api/payment/initialize",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        orderId,
      }),
    }
  );

  const result =
    (await response.json()) as InitializePaymentResponse;

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Unable to initialize payment."
    );
  }

  return result;
}