import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            featuredImage: true,
            isActive: true,
          },
        },
        outfits: {
          select: {
            id: true,
            name: true,
            slug: true,
            featuredImage: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
            outfits: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error("GET /api/admin/tags/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to fetch tag" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      slug,
      sortOrder,
    } = body;

    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    if (slug && slug !== existingTag.slug) {
      const slugExists = await prisma.tag.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A tag with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(sortOrder !== undefined && {
          sortOrder: Number(sortOrder) || 0,
        }),
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("PATCH /api/admin/tags/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            outfits: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/tags/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}