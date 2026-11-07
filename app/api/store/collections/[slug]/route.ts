import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
          message: "Collection slug is required.",
        },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,

        outfits: {
          where: {
            isActive: true,
          },
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
                    shortDescription: true,
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
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        {
          success: false,
          message: "Collection not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: collection,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch collection:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch collection.",
      },
      { status: 500 }
    );
  }
}