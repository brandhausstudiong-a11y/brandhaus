import PaymentFailed from "@/components/checkout/PaymentFailed";

interface PaymentFailedPageProps {
  searchParams: Promise<{
    reference?: string;
    message?: string;
  }>;
}

export const metadata = {
  title: "Payment Unsuccessful",
  description: "Your payment could not be completed.",
};

export default async function PaymentFailedPage({
  searchParams,
}: PaymentFailedPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-white">
      <PaymentFailed
        reference={params.reference}
        message={params.message}
      />
    </main>
  );
}