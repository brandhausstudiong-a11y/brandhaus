import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/store/category-groups/[id]
 *
 * Update an existing Category Group.
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
          message: "Category group ID is required.",
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
      isActive,
      sortOrder,
    } = body;

    /*
     * Check that the Category Group exists.
     */
    const existingCategoryGroup =
      await prisma.categoryGroup.findUnique({
        where: {
          id,
        },
      });

    if (!existingCategoryGroup) {
      return NextResponse.json(
        {
          success: false,
          message: "Category group not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Build update data dynamically.
     *
     * This allows PATCH requests to update
     * only the fields supplied by the client.
     */
    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
      image?: string | null;
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
            message:
              "Category group name is required.",
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
              "Category group name must be at least 3 characters.",
          },
          { status: 400 }
        );
      }

      if (trimmedName.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Category group name must not exceed 100 characters.",
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
       * Make sure another Category Group
       * isn't already using this slug.
       */
      const duplicateSlug =
        await prisma.categoryGroup.findFirst({
          where: {
            slug: trimmedSlug,
            NOT: {
              id,
            },
          },
          select: {
            id: true,
          },
        });

      if (duplicateSlug) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A category group with this slug already exists.",
          },
          { status: 409 }
        );
      }

      updateData.slug = trimmedSlug;
    }

    /*
     * Description validation
     */
    if (description !== undefined) {
      if (
        description !== null &&
        typeof description !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid description.",
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
     * Image validation
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
     * Active status validation
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
     * Sort order validation
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
     * Prevent an empty PATCH request.
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
     * Update Category Group.
     */
    const categoryGroup =
      await prisma.categoryGroup.update({
        where: {
          id,
        },
        data: updateData,
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Category group updated successfully.",
        data: categoryGroup,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "UPDATE_CATEGORY_GROUP_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update category group.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/store/category-groups/[id]
 *
 * Delete an existing Category Group.
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
          message: "Category group ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Check that the Category Group exists.
     */
    const existingCategoryGroup =
      await prisma.categoryGroup.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
        },
      });

    if (!existingCategoryGroup) {
      return NextResponse.json(
        {
          success: false,
          message: "Category group not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Check whether categories are
     * currently assigned to this group.
     */
    const categoryCount =
      await prisma.category.count({
        where: {
          categoryGroupId: id,
        },
      });

    if (categoryCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This category group cannot be deleted because it contains categories.",
          data: {
            categoryCount,
          },
        },
        { status: 409 }
      );
    }

    /*
     * Delete Category Group.
     */
    await prisma.categoryGroup.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Category group deleted successfully.",
        data: {
          id: existingCategoryGroup.id,
          name: existingCategoryGroup.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "DELETE_CATEGORY_GROUP_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete category group.",
      },
      { status: 500 }
    );
  }
}