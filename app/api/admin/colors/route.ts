import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/store/colors
 *
 * Create a new product color.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      label,
      hex,
    } = body;

    /*
     * Validate name
     */
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Color name is required.",
        },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Color name must be at least 2 characters.",
        },
        { status: 400 }
      );
    }

    if (trimmedName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Color name must not exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    /*
     * Validate label
     */
    if (!label || typeof label !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Color label is required.",
        },
        { status: 400 }
      );
    }

    const trimmedLabel = label.trim();

    if (trimmedLabel.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Color label must be at least 2 characters.",
        },
        { status: 400 }
      );
    }

    if (trimmedLabel.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Color label must not exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    /*
     * Validate HEX color
     *
     * Supports:
     * #FFF
     * #FFFFFF
     */
    if (!hex || typeof hex !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Hex color is required.",
        },
        { status: 400 }
      );
    }

    const normalizedHex = hex
      .trim()
      .toUpperCase();

    if (
      !/^#([A-F0-9]{3}|[A-F0-9]{6})$/.test(
        normalizedHex
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid HEX color. Use formats such as #FFF or #FFFFFF.",
        },
        { status: 400 }
      );
    }

    /*
     * Check for an existing color.
     *
     * Name, label and hex are treated as unique
     * values to prevent duplicate colors.
     */
    const existingColor =
      await prisma.productColor.findFirst({
        where: {
          OR: [
            {
              name: {
                equals: trimmedName,
                mode: "insensitive",
              },
            },
            {
              label: {
                equals: trimmedLabel,
                mode: "insensitive",
              },
            },
            {
              hex: {
                equals: normalizedHex,
                mode: "insensitive",
              },
            },
          ],
        },
      });

    if (existingColor) {
      let message =
        "A color with these details already exists.";

      if (
        existingColor.name.toLowerCase() ===
        trimmedName.toLowerCase()
      ) {
        message =
          "A color with this name already exists.";
      } else if (
        existingColor.label.toLowerCase() ===
        trimmedLabel.toLowerCase()
      ) {
        message =
          "A color with this label already exists.";
      } else if (
        existingColor.hex.toUpperCase() ===
        normalizedHex
      ) {
        message =
          "A color with this HEX value already exists.";
      }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 409 }
      );
    }

    /*
     * Create Product Color
     */
    const color =
      await prisma.productColor.create({
        data: {
          name: trimmedName,
          label: trimmedLabel,
          hex: normalizedHex,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Product color created successfully.",
        data: color,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE_PRODUCT_COLOR_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product color.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/store/colors
 *
 * Get all product colors.
 */
export async function GET() {
  try {
    const colors =
      await prisma.productColor.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          label: true,
          hex: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        colors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET_PRODUCT_COLORS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product colors.",
      },
      { status: 500 }
    );
  }
}