"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  Tag,
  Truck,
  Check,
  Circle,
} from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ProductItem } from "@/types/product";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { toast } from "sonner";

import QuantitySelector from "../QuantitySelector";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

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

interface ProductInfoProps {
  product: Product;
}

type Variant = Product["variants"][number];

export default function ProductInfo({ product }: ProductInfoProps) {
  const currency = process.env.CURRENCY_SYMBOL || "₦";

  const dispatch = useAppDispatch();

  const [quantity, setQuantity] = useState(1);

  // Selected color
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    null
  );

  // Selected variant
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    null
  );

  // Size dialog
  const [isSizeDialogOpen, setIsSizeDialogOpen] = useState(false);

  /**
   * Get unique colors from product variants.
   */
  const colors = useMemo(() => {
    const colorMap = new Map<string, NonNullable<Variant["color"]>>();

    product.variants.forEach((variant) => {
      if (!variant.color) return;

      if (!colorMap.has(variant.color.id)) {
        colorMap.set(variant.color.id, variant.color);
      }
    });

    return Array.from(colorMap.values());
  }, [product.variants]);

  /**
   * Get variants available for the selected color.
   */
  const selectedColorVariants = useMemo(() => {
    if (!selectedColorId) return [];

    return product.variants.filter(
      (variant) =>
        variant.color?.id === selectedColorId &&
        variant.stock > 0
    );
  }, [product.variants, selectedColorId]);

  /**
   * Calculate the displayed price for a variant.
   */
  const getVariantPricing = (variant: Variant) => {
    const originalPrice = Number(variant.price);
    const discount = Number(variant.percentageDiscount);

    if (discount > 0) {
      const discountedPrice =
        originalPrice - (originalPrice * discount) / 100;

      return {
        price: discountedPrice,
        oldPrice: originalPrice,
        discount,
      };
    }

    return {
      price: originalPrice,
      oldPrice: null,
      discount: 0,
    };
  };

  /**
   * Handle selecting a color.
   *
   * Selecting a color does NOT immediately select a variant.
   * Instead, it opens the size selection dialog.
   */
  const handleColorSelect = (colorId: string) => {
    setSelectedColorId(colorId);

    // Clear previous variant because the color has changed.
    setSelectedVariant(null);

    setIsSizeDialogOpen(true);
  };

  /**
   * Handle selecting a size/variant.
   */
  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    setSelectedColorId(variant.color?.id ?? null);
    setIsSizeDialogOpen(false);
  };

  /**
   * Add selected variant to cart.
   */
  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a color and size.", {
        position: "top-center",
      });

      return;
    }

    if (selectedVariant.stock <= 0) {
      toast.error("This variant is currently out of stock.", {
        position: "top-center",
      });

      return;
    }

    const pricing = getVariantPricing(selectedVariant);

    dispatch(
      addToCart({
        productId: product.id,

        // Use the selected variant's ID
        variantId: selectedVariant.id,

        category: product.category?.name ?? "",
        sku: selectedVariant.sku,
        slug: product.slug,
        name: product.name,
        quantity,

        price: pricing.price,
        percentageDiscount: pricing.discount,

        color: selectedVariant.color?.name ?? "",
        size: selectedVariant.size?.name ?? "",

        featuredImage: product.featuredImage ?? "",
      })
    );

    toast.success("Item is added to your bag", {
      position: "top-center",
    });
  };

  /**
   * Selected variant pricing.
   */
  const selectedPricing = selectedVariant
    ? getVariantPricing(selectedVariant)
    : null;

  return (
    <div className="w-full">
      {/* Category */}
      <h5 className="text-sm capitalize text-sidebar-foreground/40">
        {product.category?.name}
      </h5>

      {/* Product Name */}
      <h1 className="text-3xl md:text-5xl font-bold text-sidebar-foreground mt-2 capitalize">
        {product.name}
      </h1>

      {/* Product Price */}
      {product.discount > 0 ? (
        <div className="flex items-end gap-5 text-sm mt-5">
          <h3 className="text-2xl font-medium text-sidebar-foreground">
            {currency}
            {product.price?.toLocaleString()}
          </h3>

          <h4 className="text-xl text-sidebar-foreground/40 line-through">
            {currency}
            {product.oldPrice?.toLocaleString()}
          </h4>
        </div>
      ) : (
        <div className="flex items-end gap-5 text-sm mt-5">
          <h3 className="text-2xl font-medium text-sidebar-foreground">
            {currency}
            {product.price?.toLocaleString()}
          </h3>
        </div>
      )}

      {/* Discount */}
      {product.discount > 0 && (
        <div className="flex items-center gap-2 text-md text-emerald-600 mt-5">
          <Tag size={16} />
          <span>Save %{product.discount} right now</span>
        </div>
      )}

      {/* Short Description */}
      <div className="mt-5">
        <p className="text-sm text-sidebar-foreground/60">
          {product.shortDescription}
        </p>
      </div>

      {/* =========================================================
          SELECT COLOR
      ========================================================= */}
      {colors.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm text-sidebar-foreground/60 mb-4">
            Select Option
          </h3>

          <div className="flex items-center gap-3">
            {colors.map((color) => {
              const isSelected =
                selectedColorId === color.id;

              const hasAvailableVariant = product.variants.some(
                (variant) =>
                  variant.color?.id === color.id &&
                  variant.stock > 0
              );

              return (
                <button
                  key={color.id}
                  type="button"
                  disabled={!hasAvailableVariant}
                  onClick={() => handleColorSelect(color.id)}
                  aria-label={`Select ${color.name}`}
                  className={`
                    relative
                    px-2
                    py-1
                    rounded-md
                    border
                    transition-all
                    duration-200
                    flex
                    items-center
                    justify-center
                    ${
                      isSelected
                        ? "ring-2 ring-sidebar-foreground ring-offset-2"
                        : "border-sidebar-foreground/10"
                    }
                    ${
                      !hasAvailableVariant
                        ? "opacity-30 cursor-not-allowed"
                        : "cursor-pointer hover:scale-105"
                    }
                  `}
                  style={{
                    backgroundColor: color.hex,
                  }}
                >
                  {color.label}
                  {isSelected && (
                    <Check
                      size={16}
                      className={
                        isLightColor(color.hex)
                          ? "text-black"
                          : "text-white"
                      }
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* =====================================================
              SELECTED VARIANT
          ===================================================== */}
          {selectedVariant && selectedPricing && (
            <div className="mt-5 bg-sidebar-foreground/5 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Color */}
                <span className="rounded-md border bg-background px-2 py-1 text-sm">
                  {selectedVariant.color?.name}
                </span>

                {/* Size */}
                <span className="rounded-md border bg-background px-2 py-1 text-sm">
                  {selectedVariant.size?.label ??
                    selectedVariant.size?.name ??
                    "One Size"}
                </span>

                {/* Price */}
                <span className="text-base font-medium ml-1">
                  {currency}
                  {selectedPricing.price.toLocaleString()}
                </span>

                {/* Old Price */}
                {selectedPricing.oldPrice && (
                  <span className="text-sm text-sidebar-foreground/40 line-through">
                    {currency}
                    {selectedPricing.oldPrice.toLocaleString()}
                  </span>
                )}

                {/* Discount */}
                {selectedPricing.discount > 0 && (
                  <span className="rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
                    {selectedPricing.discount}% off
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          SIZE DIALOG
      ========================================================= */}
      {isSizeDialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="select-size-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsSizeDialogOpen(false);
            }
          }}
        >
          <div className="w-full max-w-[460px] overflow-hidden rounded-xl bg-background shadow-2xl">
            {/* Header */}
            <div className="border-b px-7 py-6">
              <h2
                id="select-size-title"
                className="text-lg font-medium"
              >
                Select Size
              </h2>
            </div>

            {/* Content */}
            <div className="px-7 py-5">
              <p className="text-sm text-sidebar-foreground/50 mb-5">
                Choose a size. prices and discount may vary.
              </p>

              <div className="space-y-2">
                {selectedColorVariants.length > 0 ? (
                  selectedColorVariants.map((variant) => {
                    const pricing =
                      getVariantPricing(variant);

                    const isSelected =
                      selectedVariant?.id === variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() =>
                          handleVariantSelect(variant)
                        }
                        className={`
                          w-full
                          min-h-[54px]
                          rounded-lg
                          border
                          px-4
                          flex
                          items-center
                          gap-3
                          text-left
                          transition-all
                          ${
                            isSelected
                              ? "border-sidebar-foreground bg-sidebar-foreground/[0.03]"
                              : "border-sidebar-foreground/15 hover:border-sidebar-foreground/40"
                          }
                        `}
                      >
                        {/* Size */}
                        <span className="rounded-md border bg-background px-2 py-1 text-sm">
                          {variant.size?.label ??
                            variant.size?.name ??
                            "One Size"}
                        </span>

                        {/* Price */}
                        <span className="text-base font-medium">
                          {currency}
                          {pricing.price.toLocaleString()}
                        </span>

                        {/* Old Price */}
                        {pricing.oldPrice && (
                          <span className="text-xs text-sidebar-foreground/40 line-through">
                            {currency}
                            {pricing.oldPrice.toLocaleString()}
                          </span>
                        )}

                        {/* Discount */}
                        {pricing.discount > 0 && (
                          <span className="text-xs font-medium text-emerald-600">
                            {pricing.discount}% off
                          </span>
                        )}

                        {/* Radio */}
                        <span
                          className={`
                            ml-auto
                            h-4
                            w-4
                            rounded-full
                            border
                            flex
                            items-center
                            justify-center
                            ${
                              isSelected
                                ? "border-black"
                                : "border-sidebar-foreground/20"
                            }
                          `}
                        >
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-black" />
                          )}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-sm text-sidebar-foreground/50">
                    No sizes are currently available for this color.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t px-7 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSizeDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={!selectedVariant}
                onClick={() => setIsSizeDialogOpen(false)}
              >
                Ok
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          QUANTITY + ADD TO BAG
      ========================================================= */}
      <div className="mt-10 mb-15">
        <h3 className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
          Quantity
        </h3>

        <div className="mt-2 flex items-center gap-4">
          <QuantitySelector
            onChange={(quantity) => setQuantity(quantity)}
          />

          <Button
            className="h-12 flex-1"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? "Add To Bag" : "Out of Stock"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* =========================================================
          DELIVERY / RETURNS
      ========================================================= */}
      <div className="mt-15">
        <div>
          <Sheet>
            <SheetTrigger
              render={
                <button className="flex w-full items-start justify-between text-md text-sidebar-foreground/60 gap-2 cursor-pointer">
                  <span className="text-left">
                    Delivery Within 2 Working Days
                  </span>

                  <div className="w-[20px]">
                    <ChevronDown className="text-sidebar-foreground/60 size-6 shrink-0" />
                  </div>
                </button>
              }
            />

            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  Delivery Within 2 Working Days
                </SheetTitle>
{/* 
                <SheetDescription>
                  Style should come with convenience.
                </SheetDescription> */}
              </SheetHeader>

              <div className="no-scrollbar overflow-y-auto px-4">
                <p className="mb-2 leading-relaxed">
                  Sit back and relax! Your order will be delivered to you within 2 working days after confirmation.
                </p>
              </div>

              <SheetFooter>
                {/* <Button type="submit">
                  Become a Member
                </Button> */}

                <SheetClose
                  render={
                    <Button variant="outline">
                      Close
                    </Button>
                  }
                />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-5">
          <Sheet>
            <SheetTrigger
              render={
                <button className="flex w-full items-start justify-between text-md text-sidebar-foreground/60 gap-2 cursor-pointer">
                  <span className="text-left inline-block">
                    Free 30 day return
                  </span>

                  <div className="w-[20px]">
                    <ChevronDown className="text-sidebar-foreground/60 size-6 shrink-0" />
                  </div>
                </button>
              }
            />

            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  Free 30 day return
                </SheetTitle>

                <SheetDescription>
                  Shop with Confidence.
                </SheetDescription>
              </SheetHeader>

              <div className="no-scrollbar overflow-y-auto px-4">
                <p className="mb-2 leading-relaxed">
                  Finding the right fit should be effortless. If
                  your purchase isn't quite right, you have 30
                  days to return eligible items for an exchange
                  or refund.
                </p>

                <p className="mb-2 leading-relaxed">
                  Whether it's the size, fit, or style, we've
                  made returns simple so you can shop with
                  confidence.
                </p>
              </div>

              <SheetFooter>
                {/* <Button type="submit">
                  Start a Return
                </Button> */}

                <SheetClose
                  render={
                    <Button variant="outline">
                      Close
                    </Button>
                  }
                />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

/**
 * Determines whether a hex color is light enough
 * to display a dark check icon.
 */
function isLightColor(hex: string) {
  const cleanHex = hex.replace("#", "");

  if (cleanHex.length !== 6) {
    return false;
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  const brightness =
    (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 160;
}
