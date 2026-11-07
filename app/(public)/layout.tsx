import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "BrandHaus Studio | Stickers, Labels & Packaging in Lagos",
  description:
    "Custom stickers, product labels, packaging and print for brands in Lagos and across Nigeria. Brand production for businesses that care how they show up.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
        <Navbar />
        {children}
        <Footer />
    </>
  )
}
