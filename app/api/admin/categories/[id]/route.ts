import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/store/categories/[id]
 *
 * Update an existing product category.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      name,
      slug,
      description,
      image,
      categoryGroupId,
      isActive,
      sortOrder,
    } = body;

    /*
     * Check that the category exists.
     */
    const existingCategory =
      await prisma.category.findUnique({
        where: {
          id,
        },
      });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Build update data dynamically.
     *
     * This allows PATCH requests to update
     * only the fields that were supplied.
     */
    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
      image?: string | null;
      categoryGroupId?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    } = {};

    /*
     * Name validation
     */
    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Category name is required.",
          },
          { status: 400 }
        );
      }

      const trimmedName = name.trim();

      if (trimmedName.length < 3) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Category name must be at least 3 characters.",
          },
          { status: 400 }
        );
      }

      if (trimmedName.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Category name must not exceed 100 characters.",
          },
          { status: 400 }
        );
      }

      updateData.name = trimmedName;
    }

    /*
     * Slug validation
     */
    if (slug !== undefined) {
      if (
        typeof slug !== "string" ||
        !slug.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Slug is required.",
          },
          { status: 400 }
        );
      }

      const trimmedSlug = slug.trim();

      if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
          trimmedSlug
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Slug can only contain lowercase letters, numbers, and hyphens.",
          },
          { status: 400 }
        );
      }

      if (trimmedSlug.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Slug must not exceed 100 characters.",
          },
          { status: 400 }
        );
      }

      /*
       * Make sure another category isn't
       * already using this slug.
       */
      const duplicateSlug =
        await prisma.category.findFirst({
          where: {
            slug: trimmedSlug,
            NOT: {
              id,
            },
          },
        });

      if (duplicateSlug) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A category with this slug already exists.",
          },
          { status: 409 }
        );
      }

      updateData.slug = trimmedSlug;
    }

    /*
     * Category Group validation
     */
    if (categoryGroupId !== undefined) {
      if (
        categoryGroupId !== null &&
        typeof categoryGroupId !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid category group ID.",
          },
          { status: 400 }
        );
      }

      if (categoryGroupId) {
        const categoryGroup =
          await prisma.categoryGroup.findUnique({
            where: {
              id: categoryGroupId,
            },
            select: {
              id: true,
            },
          });

        if (!categoryGroup) {
          return NextResponse.json(
            {
              success: false,
              message:
                "The selected category group does not exist.",
            },
            { status: 400 }
          );
        }
      }

      updateData.categoryGroupId =
        categoryGroupId || null;
    }

    /*
     * Description
     */
    if (description !== undefined) {
      if (
        description !== null &&
        typeof description !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid description.",
          },
          { status: 400 }
        );
      }

      if (
        typeof description === "string" &&
        description.trim().length > 500
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Description must not exceed 500 characters.",
          },
          { status: 400 }
        );
      }

      updateData.description =
        typeof description === "string"
          ? description.trim() || null
          : null;
    }

    /*
     * Image
     */
    if (image !== undefined) {
      if (
        image !== null &&
        typeof image !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid image value.",
          },
          { status: 400 }
        );
      }

      updateData.image =
        typeof image === "string"
          ? image.trim() || null
          : null;
    }

    /*
     * Active status
     */
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message:
              "isActive must be a boolean.",
          },
          { status: 400 }
        );
      }

      updateData.isActive = isActive;
    }

    /*
     * Sort order
     */
    if (sortOrder !== undefined) {
      if (
        typeof sortOrder !== "number" ||
        !Number.isInteger(sortOrder)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "sortOrder must be an integer.",
          },
          { status: 400 }
        );
      }

      updateData.sortOrder = sortOrder;
    }

    /*
     * Prevent empty PATCH requests.
     */
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No fields were provided for update.",
        },
        { status: 400 }
      );
    }

    /*
     * Update category.
     */
    const category =
      await prisma.category.update({
        where: {
          id,
        },
        data: updateData,
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Category updated successfully.",
        data: category,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "UPDATE_CATEGORY_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update category.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/store/categories/[id]
 *
 * Delete an existing product category.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Check that the category exists.
     */
    const existingCategory =
      await prisma.category.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
        },
      });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Delete category.
     */
    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully.",
        data: {
          id: existingCategory.id,
          name: existingCategory.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "DELETE_CATEGORY_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete category.",
      },
      { status: 500 }
    );
  }
}