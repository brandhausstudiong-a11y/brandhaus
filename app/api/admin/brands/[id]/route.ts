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

    const brand = await prisma.brand.findUnique({
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
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("GET /api/admin/brands/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to fetch brand" },
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
      shortDescription,
      longDescription,
      featuredImage,
      sortOrder,
      isActive,
    } = body;

    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    if (slug && slug !== existingBrand.slug) {
      const slugExists = await prisma.brand.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A brand with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(shortDescription !== undefined && {
          shortDescription: shortDescription || null,
        }),
        ...(longDescription !== undefined && {
          longDescription: longDescription || null,
        }),
        ...(featuredImage !== undefined && {
          featuredImage: featuredImage || null,
        }),
        ...(sortOrder !== undefined && {
          sortOrder: Number(sortOrder) || 0,
        }),
        ...(isActive !== undefined && {
          isActive: Boolean(isActive),
        }),
      },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error("PATCH /api/admin/brands/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to update brand" },
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

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    if (brand._count.products > 0) {
      return NextResponse.json(
        {
          error:
            "This brand cannot be deleted because it has products assigned to it.",
        },
        { status: 409 }
      );
    }

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/brands/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}