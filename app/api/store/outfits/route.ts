import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const collectionSlug =
      searchParams.get("collection")?.trim() || "";

    const search =
      searchParams.get("search")?.trim() || "";

    const sort =
      searchParams.get("sort")?.trim() || "featured";

    const pageParam = Number(searchParams.get("page") || "1");
    const limitParam = Number(
      searchParams.get("limit") || DEFAULT_LIMIT
    );

    const page =
      Number.isFinite(pageParam) && pageParam > 0
        ? Math.floor(pageParam)
        : 1;

    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.floor(limitParam), MAX_LIMIT)
        : DEFAULT_LIMIT;

    const where = {
      isActive: true,

      ...(collectionSlug
        ? {
            collection: {
              slug: collectionSlug,
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
            ],
          }
        : {}),
    };

    const orderBy =
      sort === "newest"
        ? { createdAt: "desc" as const }
        : { createdAt: "desc" as const };

    const [outfits, count] = await prisma.$transaction([
      prisma.outfit.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,

        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          longDescription: true,
          featuredImage: true,
          isActive: true,
          collectionId: true,
          createdAt: true,
          updatedAt: true,

          collection: {
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

          products: {
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
                  featuredImage: true,
                  isActive: true,
                },
              },
            },
          },

          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),

      prisma.outfit.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      outfits,
      count,
      pagination: {
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(count / limit)),
        hasNextPage: page * limit < count,
        hasPreviousPage: page > 1,
      },
      filters: {
        collection: collectionSlug || null,
        search: search || null,
        sort,
      },
    });
  } catch (error) {
    console.error("GET /api/store/outfits error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch outfits.",
      },
      { status: 500 }
    );
  }
}
