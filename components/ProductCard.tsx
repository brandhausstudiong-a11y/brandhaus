"use client";

import { calculateDiscount } from "@/lib/utils";
import { ProductItem } from "@/types/product";
import Image from "next/image";
import Link from "next/link";

export interface ProductCardProps {
  product: ProductItem;

}

export default function ProductCard({
  product,
}: ProductCardProps) {

  const currency = process.env.CURRENCY_SYMBOL || '₦';
  //const discount = calculateDiscount(product.price, product.percentageDiscount);

  return (
    <Link
      href={`/product/${product.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full"
    >
      {/* IMAGE */}

      <div className="relative aspect-[3/5] overflow-hidden bg-neutral-100">

        {/* Discount */}

        {product.discount > 0 && (
          <span className="absolute right-3 top-3 z-20 rounded-md bg-white px-2 py-1 text-xs font-medium text-emerald-600 shadow-sm">
            %{product.discount} off
          </span>
        )}

        {/* Default Image */}

        <Image
          src={product.featuredImage}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-0"
        />

        {/* Hover Image */}

        <Image
          src={product.images[1] ? product.images[1].url : product.images[0].url}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover opacity-0 scale-105 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
        />
      </div>

      {/* CONTENT */}

      <div className="mt-4 space-y-1">

        <h3 className="line-clamp-2 font-medium text-sm text-sidebar-foreground/60 uppercase">
          {product.name}
        </h3>

        <div className="flex items-center gap-3">


          <span className="text-sm font-medium text-sidebar-foreground">
            {currency}{product.price.toLocaleString()}
          </span>

          { product.discount > 0 && (
            <span className="text-sm text-sidebar-foreground/40 line-through">
              {currency}{product.oldPrice.toLocaleString()}
            </span>
          )}

        </div>

        {/* <p className="text-neutral-500 text-sm">
          {product.category}
        </p> */}

      </div>
    </Link>
  );
}