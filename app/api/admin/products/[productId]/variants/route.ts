import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { Prisma } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/* POST /api/store/products/[productId]/variants                             */
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

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      sku,
      colorId,
      sizeId,
      price,
      percentageDiscount,
      stock,
      isActive,
    } = body;

    /* ---------------------------------------------------------------------- */
    /* Validate Product                                                       */
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
    /* Validate SKU                                                           */
    /* ---------------------------------------------------------------------- */

    if (!sku || typeof sku !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "SKU is required.",
        },
        { status: 400 }
      );
    }

    const normalizedSku = sku.trim();

    if (!normalizedSku) {
      return NextResponse.json(
        {
          success: false,
          message: "SKU cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (normalizedSku.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "SKU cannot exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Price                                                         */
    /* ---------------------------------------------------------------------- */

    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Price is required.",
        },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a valid non-negative number.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Discount                                                      */
    /* ---------------------------------------------------------------------- */

    const parsedDiscount =
      percentageDiscount === undefined ||
      percentageDiscount === null ||
      percentageDiscount === ""
        ? 0
        : Number(percentageDiscount);

    if (
      !Number.isFinite(parsedDiscount) ||
      parsedDiscount < 0 ||
      parsedDiscount > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Percentage discount must be between 0 and 100.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Stock                                                         */
    /* ---------------------------------------------------------------------- */

    const parsedStock =
      stock === undefined ||
      stock === null ||
      stock === ""
        ? 0
        : Number(stock);

    if (
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock must be a non-negative integer.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Color                                                         */
    /* ---------------------------------------------------------------------- */

    if (colorId !== undefined && colorId !== null && colorId !== "") {
      const color = await prisma.productColor.findUnique({
        where: {
          id: colorId,
        },
        select: {
          id: true,
        },
      });

      if (!color) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected color does not exist.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Size                                                          */
    /* ---------------------------------------------------------------------- */

    if (sizeId !== undefined && sizeId !== null && sizeId !== "") {
      const size = await prisma.productSize.findUnique({
        where: {
          id: sizeId,
        },
        select: {
          id: true,
        },
      });

      if (!size) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected size does not exist.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Check Duplicate SKU                                                    */
    /* ---------------------------------------------------------------------- */

    const existingVariant = await prisma.productVariant.findUnique({
      where: {
        sku: normalizedSku,
      },
      select: {
        id: true,
      },
    });

    if (existingVariant) {
      return NextResponse.json(
        {
          success: false,
          message: "A product variant with this SKU already exists.",
        },
        { status: 409 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Create Variant                                                         */
    /* ---------------------------------------------------------------------- */

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        sku: normalizedSku,
        colorId:
          colorId && colorId !== ""
            ? colorId
            : null,
        sizeId:
          sizeId && sizeId !== ""
            ? sizeId
            : null,
        price: parsedPrice,
        percentageDiscount: parsedDiscount,
        stock: parsedStock,
        isActive:
          typeof isActive === "boolean"
            ? isActive
            : true,
      },
      include: {
        color: {
          select: {
            id: true,
            name: true,
            label: true,
            hex: true,
          },
        },
        size: {
          select: {
            id: true,
            name: true,
            label: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product variant created successfully.",
        variant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/store/products/[productId]/variants error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product variant.",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* GET /api/store/products/[productId]/variants                              */
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
    /* Get Variants                                                            */
    /* ---------------------------------------------------------------------- */

    const variants = await prisma.productVariant.findMany({
      where: {
        productId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        color: {
          select: {
            id: true,
            name: true,
            label: true,
            hex: true,
          },
        },
        size: {
          select: {
            id: true,
            name: true,
            label: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      variants,
    });
  } catch (error) {
    console.error(
      "GET /api/store/products/[productId]/variants error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product variants.",
      },
      { status: 500 }
    );
  }
}