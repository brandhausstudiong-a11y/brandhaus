import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/* POST /api/store/sizes                                                      */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, label } = body;

    // Validate name
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Size name is required.",
        },
        { status: 400 }
      );
    }

    // Validate label
    if (!label || typeof label !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Size label is required.",
        },
        { status: 400 }
      );
    }

    const normalizedName = name.trim();
    const normalizedLabel = label.trim();

    if (!normalizedName) {
      return NextResponse.json(
        {
          success: false,
          message: "Size name cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (!normalizedLabel) {
      return NextResponse.json(
        {
          success: false,
          message: "Size label cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (normalizedName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Size name cannot exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    if (normalizedLabel.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Size label cannot exceed 50 characters.",
        },
        { status: 400 }
      );
    }

    // Check for duplicate size name
    const existingName = await prisma.productSize.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
      },
    });

    if (existingName) {
      return NextResponse.json(
        {
          success: false,
          message: "A size with this name already exists.",
        },
        { status: 409 }
      );
    }

    // Check for duplicate label
    const existingLabel = await prisma.productSize.findFirst({
      where: {
        label: {
          equals: normalizedLabel,
          mode: "insensitive",
        },
      },
    });

    if (existingLabel) {
      return NextResponse.json(
        {
          success: false,
          message: "A size with this label already exists.",
        },
        { status: 409 }
      );
    }

    // Create size
    const size = await prisma.productSize.create({
      data: {
        name: normalizedName,
        label: normalizedLabel,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product size created successfully.",
        size,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/store/sizes error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product size.",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* GET /api/store/sizes                                                       */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const sizes = await prisma.productSize.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        label: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      sizes,
    });
  } catch (error) {
    console.error("GET /api/store/sizes error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product sizes.",
      },
      { status: 500 }
    );
  }
}