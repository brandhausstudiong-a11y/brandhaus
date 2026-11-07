import { notFound } from "next/navigation";
import { getAllProductCategories } from "@/lib/products";
import Header from "./Header";
import ProductGrid from "./ProductGrid";
import { Metadata } from "next";

type ShopPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    sku?: string;
    sort?: string;
    limit?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Shop | OUTFITZ | Made for Men on a Mission",

  description:
    "Discover curated men's outfits designed for ambitious men building wealth, influence, and confidence. OUTFITZ helps you dress with purpose for every occasion, from business meetings to weekend escapes.",

  keywords: [
    "men's fashion",
    "men's outfits",
    "men's style",
    "smart casual",
    "business casual",
    "men's clothing",
    "curated outfits",
    "fashion for men",
    "OUTFITZ by Toju",
  ],

  openGraph: {
    title: "Shop | OUTFITZ | Made for Men on a Mission",

    description:
      "Curated men's outfits for ambitious men who value quality, confidence, and presentation. Discover complete looks designed for business, lifestyle, and every important moment.",

    url: "https://outfitzbytoju.com",

    siteName: "OUTFITZ",

    images: [
      {
        url: "/images/og/home-og.jpg",
        width: 1200,
        height: 630,
        alt: "OUTFITZ - Made for Men on a Mission",
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "OUTFITZ | Made for Men on a Mission",

    description:
      "Complete men's outfits curated for ambitious men who want to dress with confidence, purpose, and style.",

    creator: "@pedrotech",

    images: ["/images/og/home-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,

    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;

  const subCategories = await getAllProductCategories();

  if (!subCategories) {
    notFound();
  }

  return (
    <div className="min-h-[70vh] mx-4 md:mx-6 lg:mx-10 py-6 mb-20">
      <Header category={params.category} />

      <ProductGrid
        subCategories={subCategories}
        categorySlug={params.category}
        page={params.page}
        search={params.search}
        sort={params.sort}
        limit={params.limit}
      />
    </div>
  );
}