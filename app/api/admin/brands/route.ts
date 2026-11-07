import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error("GET /api/admin/brands error:", error);

    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      shortDescription,
      longDescription,
      featuredImage,
      sortOrder,
      isActive,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const existingBrand = await prisma.brand.findUnique({
      where: { slug },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "A brand with this slug already exists" },
        { status: 409 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        shortDescription: shortDescription || null,
        longDescription: longDescription || null,
        featuredImage: featuredImage || null,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/brands error:", error);

    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}