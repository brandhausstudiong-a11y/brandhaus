import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      image,
      isActive = true,
      sortOrder = 0,
    } = body;

    // Validate required fields
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Category group name is required.",
        },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Category group slug is required.",
        },
        { status: 400 }
      );
    }

    // Check for existing slug
    const existingCategoryGroup =
      await prisma.categoryGroup.findUnique({
        where: {
          slug: slug.trim(),
        },
      });

    if (existingCategoryGroup) {
      return NextResponse.json(
        {
          success: false,
          message: "A category group with this slug already exists.",
        },
        { status: 409 }
      );
    }

    // Create category group
    const categoryGroup = await prisma.categoryGroup.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description:
          typeof description === "string"
            ? description.trim()
            : null,
        image:
          typeof image === "string"
            ? image.trim()
            : null,
        isActive: Boolean(isActive),
        sortOrder:
          typeof sortOrder === "number"
            ? sortOrder
            : 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category group created successfully.",
        data: categoryGroup,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE_CATEGORY_GROUP_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create category group.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const groups = await prisma.categoryGroup.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });

    return NextResponse.json({
      groups,
    });
  } catch (error) {
    console.error("Failed to fetch category groups:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch category groups.",
      },
      {
        status: 500,
      }
    );
  }
}