import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/* POST /api/store/products/[productId]/images                               */
/* -------------------------------------------------------------------------- */

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ productId: string }>;
  }
) {
  try {
    const { productId } = await params;

    /* ---------------------------------------------------------------------- */
    /* Validate Product ID                                                    */
    /* ---------------------------------------------------------------------- */

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Check Product                                                          */
    /* ---------------------------------------------------------------------- */

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Parse Request                                                          */
    /* ---------------------------------------------------------------------- */

    const body = await request.json();

    const {
      url,
      alt,
      sortOrder,
    } = body;

    /* ---------------------------------------------------------------------- */
    /* Validate URL                                                           */
    /* ---------------------------------------------------------------------- */

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Image URL is required.",
        },
        { status: 400 }
      );
    }

    const normalizedUrl = url.trim();

    if (!normalizedUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Image URL cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (normalizedUrl.length > 2048) {
      return NextResponse.json(
        {
          success: false,
          message: "Image URL cannot exceed 2048 characters.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate URL Format                                                    */
    /* ---------------------------------------------------------------------- */

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid image URL.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Alt Text                                                      */
    /* ---------------------------------------------------------------------- */

    let normalizedAlt: string | null = null;

    if (alt !== undefined && alt !== null) {
      if (typeof alt !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Alt text must be a string.",
          },
          { status: 400 }
        );
      }

      normalizedAlt = alt.trim() || null;

      if (normalizedAlt && normalizedAlt.length > 255) {
        return NextResponse.json(
          {
            success: false,
            message: "Alt text cannot exceed 255 characters.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Sort Order                                                    */
    /* ---------------------------------------------------------------------- */

    const parsedSortOrder =
      sortOrder === undefined ||
      sortOrder === null ||
      sortOrder === ""
        ? 0
        : Number(sortOrder);

    if (
      !Number.isInteger(parsedSortOrder) ||
      parsedSortOrder < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Sort order must be a non-negative integer.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Create Product Image                                                   */
    /* ---------------------------------------------------------------------- */

    const image = await prisma.productImage.create({
      data: {
        url: normalizedUrl,
        alt: normalizedAlt,
        productId,
        sortOrder: parsedSortOrder,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product image added successfully.",
        image,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/store/products/[productId]/images error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product image.",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* GET /api/store/products/[productId]/images                                */
/* -------------------------------------------------------------------------- */

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ productId: string }>;
  }
) {
  try {
    const { productId } = await params;

    /* ---------------------------------------------------------------------- */
    /* Validate Product ID                                                    */
    /* ---------------------------------------------------------------------- */

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Check Product                                                          */
    /* ---------------------------------------------------------------------- */

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Get Product Images                                                     */
    /* ---------------------------------------------------------------------- */

    const images = await prisma.productImage.findMany({
      where: {
        productId,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
      select: {
        id: true,
        url: true,
        alt: true,
        productId: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error(
      "GET /api/store/products/[productId]/images error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product images.",
      },
      { status: 500 }
    );
  }
}