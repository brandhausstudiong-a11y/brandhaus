"use client";

import Image from "next/image";
import { Plus } from "lucide-react";

import type { StyleProduct } from "@/types/style";

type SidebarProductItemProps = {
  item: StyleProduct;
  onClick?: (item: StyleProduct) => void;
};

export function SidebarProductItem({
  item,
  onClick,
}: SidebarProductItemProps) {
  const currency = "₦";

  const image =
    item.featuredImage ||
    item.images?.[0]?.url ||
    "/images/placeholder.jpg";

  const hasDiscount = item.discount > 0;

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className="
        group
        flex
        min-h-[104px]
        w-full
        items-center
        gap-4
        rounded-[18px]
        border
        border-border
        bg-background
        p-3
        text-left
        transition-all
        duration-200
        hover:border-foreground/20
        hover:bg-muted/30
      "
    >
      {/* ============================================================
          PRODUCT IMAGE
      ============================================================ */}

      <div
        className="
          relative
          h-[76px]
          w-[76px]
          shrink-0
          overflow-hidden
          rounded-[9px]
          bg-muted
        "
      >
        <Image
          src={image}
          alt={item.name}
          fill
          sizes="76px"
          className="
            object-cover
            transition-transform
            duration-300
            group-hover:scale-[1.03]
          "
        />
      </div>

      {/* ============================================================
          PRODUCT INFORMATION
      ============================================================ */}

      <div className="min-w-0 flex-1">
        {/* Product name */}
        <h3
          className="
            truncate
            text-[15px]
            font-medium
            leading-5
            text-foreground
            capitalize
          "
        >
          {item.name}
        </h3>

        {/* Price + Discount */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          {/* Current price */}
          <span className="text-[16px] font-normal leading-5 text-foreground">
            {currency}
            {item.price.toLocaleString("en-NG")}
          </span>

          {/* Old price */}
          {hasDiscount && item.oldPrice !== null && (
            <span
              className="
                text-[12px]
                leading-4
                text-muted-foreground
                line-through
              "
            >
              {currency}
              {item.oldPrice.toLocaleString("en-NG")}
            </span>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span
              className="
                rounded-full
                bg-emerald-500
                px-2
                py-[3px]
                text-[11px]
                font-medium
                leading-3
                text-white
              "
            >
              {item.discount}% off
            </span>
          )}
        </div>
      </div>

      {/* ============================================================
          ADD BUTTON
      ============================================================ */}

      <span
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          text-muted-foreground
          transition-colors
          group-hover:bg-muted
          group-hover:text-foreground
        "
      >
        <Plus
          className="h-5 w-5"
          strokeWidth={1.8}
        />
      </span>
    </button>
  );
}

export default SidebarProductItem;