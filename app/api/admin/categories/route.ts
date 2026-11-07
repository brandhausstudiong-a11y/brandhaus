import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

/**
 * GET /api/store/categories
 *
 * Returns all categories.
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        categoryGroup: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        categories,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("GET /api/store/categories error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch categories.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST /api/store/categories
 *
 * Creates a new category.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      image,
      isActive,
      sortOrder,
      categoryGroupId,
    } = body;

    // -----------------------------
    // Validate name
    // -----------------------------

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          message: "Category name is required.",
          errors: {
            name: "Category name is required.",
          },
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Validate slug
    // -----------------------------

    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return NextResponse.json(
        {
          message: "Category slug is required.",
          errors: {
            slug: "Category slug is required.",
          },
        },
        {
          status: 400,
        }
      );
    }

    // Normalize slug
    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (!normalizedSlug) {
      return NextResponse.json(
        {
          message: "Invalid category slug.",
          errors: {
            slug: "Please provide a valid slug.",
          },
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Validate description
    // -----------------------------

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return NextResponse.json(
        {
          message: "Invalid description.",
          errors: {
            description: "Description must be a string.",
          },
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Validate image
    // -----------------------------

    if (
      image !== undefined &&
      image !== null &&
      typeof image !== "string"
    ) {
      return NextResponse.json(
        {
          message: "Invalid image value.",
          errors: {
            image: "Image must be a string.",
          },
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Validate isActive
    // -----------------------------

    if (
      isActive !== undefined &&
      typeof isActive !== "boolean"
    ) {
      return NextResponse.json(
        {
          message: "Invalid active status.",
          errors: {
            isActive: "isActive must be a boolean.",
          },
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Validate sortOrder
    // -----------------------------

    if (
      sortOrder !== undefined &&
      (!Number.isInteger(sortOrder) || sortOrder < 0)
    ) {
      return NextResponse.json(
        {
          message: "Invalid sort order.",
          errors: {
            sortOrder:
              "sortOrder must be a non-negative integer.",
          },
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Validate category group
    // -----------------------------

    if (
      categoryGroupId !== undefined &&
      categoryGroupId !== null &&
      typeof categoryGroupId !== "string"
    ) {
      return NextResponse.json(
        {
          message: "Invalid category group.",
          errors: {
            categoryGroupId:
              "categoryGroupId must be a valid ID.",
          },
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Create category
    // -----------------------------

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: normalizedSlug,
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
        image:
          typeof image === "string"
            ? image.trim() || null
            : null,
        isActive:
          typeof isActive === "boolean"
            ? isActive
            : true,
        sortOrder:
          Number.isInteger(sortOrder)
            ? sortOrder
            : 0,
        categoryGroupId:
          typeof categoryGroupId === "string" &&
          categoryGroupId.trim()
            ? categoryGroupId.trim()
            : null,
      },
      include: {
        categoryGroup: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Category created successfully.",
        category,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/store/categories error:", error);

    // Prisma unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "A category with this slug already exists.",
          errors: {
            slug: "This slug is already in use.",
          },
        },
        {
          status: 409,
        }
      );
    }

    // Category group does not exist
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        {
          message: "The selected category group does not exist.",
          errors: {
            categoryGroupId:
              "Please select a valid category group.",
          },
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to create category.",
      },
      {
        status: 500,
      }
    );
  }
}