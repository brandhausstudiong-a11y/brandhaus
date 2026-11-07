import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import ProductDetail from "@/components/product/ProductDetail";
// import RecommendedStylesSection from "@/components/styles/RecommendedStylesSection";
// import RecommendedStylesSkeleton from "@/components/styles/RecommendedStylesSkeleton";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ProductResponse = {
  success: boolean;
  product?: Product;
  message?: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;

  shortDescription: string | null;
  longDescription: string | null;

  featuredImage: string | null;

  isActive: boolean;

  category: {
    id: string;
    name: string;
    slug: string;
  } | null;

  images: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }[];

  variants: {
    id: string;
    sku: string;
    price: number;
    percentageDiscount: number;
    stock: number;

    color: {
      id: string;
      name: string;
      label: string;
      hex: string;
    } | null;

    size: {
      id: string;
      name: string;
      label: string;
    } | null;
  }[];

  price: number | null;
  oldPrice: number | null;
  discount: number;
  priceVariantId: string | null;

  inStock: boolean;
};

/* ============================================================
   FETCH PRODUCT FROM PUBLIC API
============================================================ */

async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://outfitzbytoju.com";

  const response = await fetch(
    `${baseUrl}/api/store/products/slug/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error(
      `Failed to fetch product: ${response.status}`
    );

    return null;
  }

  const data: ProductResponse =
    await response.json();

  if (!data.success || !data.product) {
    return null;
  }

  return data.product;
}

/* ============================================================
   METADATA
============================================================ */

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  const currency =
    process.env.CURRENCY_SYMBOL || "₦";

  if (!product) {
    return {
      title: "Product Not Found",
      description:
        "The requested product could not be found.",
    };
  }

  const categoryName =
    product.category?.name || "Fashion";

  const price =
    product.price !== null
      ? `${currency}${product.price.toLocaleString()}`
      : "Price unavailable";

  const stockStatus = product.inStock
    ? "In Stock"
    : "Out of Stock";

  const description =
    `${product.shortDescription || `Shop ${product.name} at OUTFITZ.`} ` +
    `Price: ${price}. ${stockStatus}.`;

  return {
    title: `${product.name} - ${categoryName} | OUTFITZ | Made for Men on a Mission`,

    description,

    keywords: [
      categoryName,
      product.name.toLowerCase(),
    ],

    openGraph: {
      title: `${product.name} - ${categoryName} | OUTFITZ | Made for Men on a Mission`,

      description,

      url: `https://outfitzbytoju.com/products/${product.slug}`,

      siteName: "OUTFITZ",

      images: product.featuredImage
        ? [
            {
              url: product.featuredImage,
              width: 630,
              height: 630,
              alt: product.name,
            },
          ]
        : [],

      locale: "en_US",
      type: "website",
    },
  };
}

/* ============================================================
   PAGE
============================================================ */

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }
  console.log(product);

  return (
    <div className="mb-20">
      <ProductDetail product={product} />

      <section className="mt-15 px-4 md:p-6 lg:p-10">
        {/* <Suspense
          fallback={<RecommendedStylesSkeleton />}
        >
          <RecommendedStylesSection />
        </Suspense> */}
      </section>
    </div>
  );
}