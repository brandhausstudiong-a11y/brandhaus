import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: {
        createdAt: "desc",
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
            featuredImage: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: collections,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch collections:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch collections.",
      },
      { status: 500 }
    );
  }
}