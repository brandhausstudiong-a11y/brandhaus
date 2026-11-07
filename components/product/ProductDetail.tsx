"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import ProductGallery from "./ProductGallery";
import ProductDescription from "./ProductDescription";
import MobileProductGallery from "./MobileProductGallery";
// import { ProductItem } from "@/types/product";
import ProductInfo from "./ProductInfo";

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


interface ProductDetailProps {
  product : Product;
}

export default function ProductDetail({product}: ProductDetailProps) {
  return (
    <div className="w-full">

      <div className="md:grid lg:grid-cols-[1fr_420px]">

        {/* LEFT */}
        <div className="hidden md:block pl-4 md:pl-6 lg:pl-10">
            <ProductGallery
                images={product.images}
            />
        </div>

        <div className="md:hidden">
            <MobileProductGallery
                images={product.images}
            />
        </div>

        {/* RIGHT */}

        <aside className="mt-5 md:mt-5 pl-4 md:pl-6 lg:pl-10 pr-4 md:pr-6 lg:pr-10">
          <ScrollArea className="lg:sticky lg:top-0">
            <ProductInfo product={product}/>
          </ScrollArea>
        </aside>

      </div>

      {/* Description */}
        {/* <div className="md:grid lg:grid-cols-[1fr_420px] mt-10 md:mt-10">
            <ProductDescription />
        </div> */}

    </div>
  );
}