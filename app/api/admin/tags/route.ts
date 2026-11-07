import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      include: {
        _count: {
          select: {
            products: true,
            outfits: true,
          },
        },
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/admin/tags error:", error);

    return NextResponse.json(
      { error: "Failed to fetch tags" },
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
      sortOrder,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "A tag with this slug already exists" },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/tags error:", error);

    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}