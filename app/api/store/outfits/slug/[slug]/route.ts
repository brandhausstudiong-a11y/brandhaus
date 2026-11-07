import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

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
          message: "Outfit slug is required.",
        },
        { status: 400 }
      );
    }

    const outfit = await prisma.outfit.findFirst({
      where: {
        slug,
        isActive: true,
      },

      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        longDescription: true,
        featuredImage: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,

        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverImage: true,
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

        products: {
          where: {
            product: {
              isActive: true,
            },
          },
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            sortOrder: true,

            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                shortDescription: true,
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
            },
          },
        },
      },
    });

    if (!outfit) {
      return NextResponse.json(
        {
          success: false,
          message: "Outfit not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Convert Prisma Decimal values to numbers
     * and calculate the display price for each product.
     */
    const formattedProducts = outfit.products.map((item) => {
      const product = item.product;

      const variants = product.variants.map((variant) => ({
        ...variant,
        price: Number(variant.price),
        percentageDiscount: Number(variant.percentageDiscount),
      }));

      const discountedVariants = variants.filter(
        (variant) => variant.percentageDiscount > 0
      );

      const selectedVariant =
        discountedVariants.length > 0
          ? discountedVariants.reduce((highest, current) =>
              current.price > highest.price ? current : highest
            )
          : variants[0] ?? null;

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

      const inStock = variants.some(
        (variant) => variant.stock > 0
      );

      return {
        sortOrder: item.sortOrder,

        product: {
          ...product,
          variants,
          price,
          oldPrice,
          discount,
          priceVariantId,
          inStock,
        },
      };
    });

    return NextResponse.json(
      {
        success: true,

        outfit: {
          ...outfit,
          products: formattedProducts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/store/outfits/slug/[slug] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch outfit.",
      },
      { status: 500 }
    );
  }
}