import CheckoutDetail from "@/components/CheckoutDetail";

export const metadata = {
  title: "Checkout",
  description: "Complete your order.",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-white">
      <CheckoutDetail />
    </main>
  );
}