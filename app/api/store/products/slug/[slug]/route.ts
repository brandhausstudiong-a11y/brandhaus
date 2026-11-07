import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Product slug is required.",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        longDescription: true,
        featuredImage: true,
        isActive: true,

        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        images: {
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
            url: true,
            alt: true,
            sortOrder: true,
          },
        },

        variants: {
          where: {
            isActive: true,
          },

          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            sku: true,
            price: true,
            percentageDiscount: true,
            stock: true,

            color: {
              select: {
                id: true,
                name: true,
                label: true,
                hex: true,
              },
            },

            size: {
              select: {
                id: true,
                name: true,
                label: true,
              },
            },
          },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    /* ============================================================
       FORMAT VARIANTS
    ============================================================ */

    const variants = product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price),
      percentageDiscount: Number(
        variant.percentageDiscount
      ),
    }));

    /* ============================================================
       DETERMINE DISPLAY PRICE

       If there are discounted variants:
       use the highest-priced discounted variant.

       Otherwise:
       use the first active variant.
    ============================================================ */

    const discountedVariants = variants.filter(
      (variant) => variant.percentageDiscount > 0
    );

    const selectedVariant =
      discountedVariants.length > 0
        ? discountedVariants.reduce(
            (highest, current) =>
              current.price > highest.price
                ? current
                : highest
          )
        : variants[0] ?? null;

    /* ============================================================
       CALCULATE PRICE
    ============================================================ */

    let price: number | null = null;
    let oldPrice: number | null = null;
    let discount = 0;
    let priceVariantId: string | null = null;

    if (selectedVariant) {
      const originalPrice = selectedVariant.price;
      const percentageDiscount =
        selectedVariant.percentageDiscount;

      priceVariantId = selectedVariant.id;

      if (percentageDiscount > 0) {
        price =
          originalPrice -
          (originalPrice * percentageDiscount) / 100;

        oldPrice = originalPrice;
        discount = percentageDiscount;
      } else {
        price = originalPrice;
      }
    }

    /* ============================================================
       STOCK
    ============================================================ */

    const inStock = variants.some(
      (variant) => variant.stock > 0
    );

    /* ============================================================
       RESPONSE
    ============================================================ */

    return NextResponse.json({
      success: true,

      product: {
        ...product,

        variants,

        price,
        oldPrice,
        discount,
        priceVariantId,

        inStock,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/store/products/slug/[slug] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch product.",
      },
      { status: 500 }
    );
  }
}