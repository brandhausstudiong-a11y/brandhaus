import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    /*
     * URL parameters
     *
     * /api/store/products
     * /api/store/products?category=shirts
     * /api/store/products?category=shirts&page=2
     * /api/store/products?search=linen
     * /api/store/products?sort=price-asc
     */
    const categorySlug =
      searchParams.get("category")?.trim() || null;

    const search =
      searchParams.get("search")?.trim() || null;

    const sort =
      searchParams.get("sort") || "newest";

    const pageParam =
      searchParams.get("page");

    const limitParam =
      searchParams.get("limit");

    /*
     * Pagination
     */
    const page = Math.max(
      Number(pageParam) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(limitParam) || 20, 1),
      100
    );

    /*
     * Build the Prisma WHERE clause.
     *
     * Without a category:
     *
     * {
     *   isActive: true
     * }
     *
     * With a category:
     *
     * {
     *   isActive: true,
     *   category: {
     *     slug: "shirts",
     *     isActive: true
     *   }
     * }
     */
    const where = {
      isActive: true,

      ...(categorySlug
        ? {
            category: {
              slug: categorySlug,
              isActive: true,
            },
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                shortDescription: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                longDescription: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    /*
     * Fetch matching products.
     *
     * We intentionally do not paginate at the Prisma level because
     * price sorting depends on ProductVariant data.
     */
    const products = await prisma.product.findMany({
      where,

      orderBy: {
        createdAt: "desc",
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

    /*
     * Format products and calculate the display price.
     */
    const formattedProducts = products.map(
      (product) => {
        const variants = product.variants;

        /*
         * Find variants that have an active discount.
         */
        const discountedVariants =
          variants.filter(
            (variant) =>
              Number(
                variant.percentageDiscount
              ) > 0
          );

        /*
         * If discounted variants exist,
         * use the discounted variant with
         * the highest original price.
         */
        const highestDiscountedVariant =
          discountedVariants.length > 0
            ? discountedVariants.reduce(
                (highest, current) => {
                  return Number(current.price) >
                    Number(highest.price)
                    ? current
                    : highest;
                }
              )
            : null;

        /*
         * If there are no discounted variants,
         * use the first active variant.
         */
        const selectedVariant =
          highestDiscountedVariant ??
          variants[0] ??
          null;

        let price: number | null = null;
        let oldPrice: number | null = null;
        let discount = 0;
        let priceVariantId: string | null =
          null;

        if (selectedVariant) {
          const originalPrice = Number(
            selectedVariant.price
          );

          const percentageDiscount =
            Number(
              selectedVariant.percentageDiscount
            );

          priceVariantId =
            selectedVariant.id;

          if (percentageDiscount > 0) {
            price =
              originalPrice -
              (originalPrice *
                percentageDiscount) /
                100;

            oldPrice = originalPrice;
            discount = percentageDiscount;
          } else {
            price = originalPrice;
          }
        }

        return {
          ...product,

          variants: variants.map(
            (variant) => ({
              ...variant,

              price: Number(
                variant.price
              ),

              percentageDiscount:
                Number(
                  variant.percentageDiscount
                ),
            })
          ),

          /*
           * Values used by ProductCard
           */
          price,
          oldPrice,
          discount,
          priceVariantId,
        };
      }
    );

    /*
     * Sort products.
     *
     * newest
     * price-asc
     * price-desc
     */
    const sortedProducts = [
      ...formattedProducts,
    ];

    switch (sort) {
      case "price-asc":
        sortedProducts.sort(
          (a, b) =>
            Number(a.price ?? 0) -
            Number(b.price ?? 0)
        );
        break;

      case "price-desc":
        sortedProducts.sort(
          (a, b) =>
            Number(b.price ?? 0) -
            Number(a.price ?? 0)
        );
        break;

      case "newest":
      default:
        sortedProducts.sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );
        break;
    }

    /*
     * Total number of products BEFORE pagination.
     */
    const total = sortedProducts.length;

    /*
     * Calculate total pages.
     */
    const totalPages = Math.ceil(
      total / limit
    );

    /*
     * If a page is greater than the available
     * pages, return an empty list.
     */
    const startIndex =
      (page - 1) * limit;

    const endIndex =
      startIndex + limit;

    const paginatedProducts =
      sortedProducts.slice(
        startIndex,
        endIndex
      );

    /*
     * Return response.
     */
    return NextResponse.json(
      {
        success: true,

        products: paginatedProducts,

        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage:
            page < totalPages,
          hasPreviousPage:
            page > 1,
        },

        filters: {
          category: categorySlug,
          search,
          sort,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Get public products error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch products.",

        products: [],

        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      {
        status: 500,
      }
    );
  }
}