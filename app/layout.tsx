import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from "next";
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "BrandHaus Studio | Stickers, Labels & Packaging in Lagos",
  description:
    "Custom stickers, product labels, packaging and print for brands in Lagos and across Nigeria. Brand production for businesses that care how they show up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <Navbar />
            {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
