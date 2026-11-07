import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ImageKit from "@imagekit/nodejs";

/* -------------------------------------------------------------------------- */
/* ImageKit                                                                   */
/* -------------------------------------------------------------------------- */

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

const IMAGEKIT_PRODUCT_FOLDER = "/products";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type IncomingTag = string;

type IncomingVariant = {
  sku: string;
  colorId?: string | null;
  sizeId?: string | null;
  price: number;
  percentageDiscount?: number;
  stock: number;
  isActive?: boolean;
};

/* -------------------------------------------------------------------------- */
/* POST /api/store/products                                                   */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  let createdProductId: string | null = null;

  // Keep track of uploaded ImageKit files so they can be deleted
  // if a later database operation fails.
  const uploadedFileIds: string[] = [];

  try {
    /* ---------------------------------------------------------------------- */
    /* Form Data                                                              */
    /* ---------------------------------------------------------------------- */

    const formData = await request.formData();

    /* ---------------------------------------------------------------------- */
    /* Product Fields                                                         */
    /* ---------------------------------------------------------------------- */

    const name = String(formData.get("name") ?? "").trim();

    const shortDescription =
      String(formData.get("shortDescription") ?? "").trim() || null;

    const longDescription =
      String(formData.get("longDescription") ?? "").trim() || null;

    const categoryId =
      String(formData.get("categoryId") ?? "").trim() || null;

    const brandId =
      String(formData.get("brandId") ?? "").trim();

    if (!brandId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product brand is required.",
        },
        { status: 400 }
      );
    }

    const tagsValue = String(formData.get("tags") ?? "[]");

    let tagIds: IncomingTag[] = [];

    try {
      const parsedTags = JSON.parse(tagsValue);

      if (!Array.isArray(parsedTags)) {
        throw new Error("Tags must be an array.");
      }

      tagIds = [
        ...new Set(
          parsedTags
            .map((tagId) => String(tagId).trim())
            .filter(Boolean)
        ),
      ];
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tags data.",
        },
        { status: 400 }
      );
    }

    const isActiveValue = String(formData.get("isActive") ?? "true");

    const isActive = isActiveValue !== "false";

    /* ---------------------------------------------------------------------- */
    /* Validate Product Name                                                  */
    /* ---------------------------------------------------------------------- */

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name must be at least 2 characters.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Category                                                      */
    /* ---------------------------------------------------------------------- */

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product category is required.",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected category does not exist.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Brand                                                         */
    /* ---------------------------------------------------------------------- */

    if (brandId) {
      const brand = await prisma.brand.findUnique({
        where: {
          id: brandId,
        },
        select: {
          id: true,
        },
      });

      if (!brand) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected brand does not exist.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Tags                                                          */
    /* ---------------------------------------------------------------------- */

    if (tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: {
          id: {
            in: tagIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (tags.length !== tagIds.length) {
        return NextResponse.json(
          {
            success: false,
            message: "One or more selected tags do not exist.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Parse Variants                                                         */
    /* ---------------------------------------------------------------------- */

    const variantsValue = String(formData.get("variants") ?? "[]");

    let variants: IncomingVariant[];

    try {
      variants = JSON.parse(variantsValue);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid variants data.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one product variant is required.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Variant SKUs                                                  */
    /* ---------------------------------------------------------------------- */

    const skuSet = new Set<string>();

    for (const variant of variants) {
      const sku = String(variant.sku ?? "")
        .trim()
        .toLowerCase();

      if (!sku) {
        return NextResponse.json(
          {
            success: false,
            message: "Every variant must have a SKU.",
          },
          { status: 400 }
        );
      }

      if (skuSet.has(sku)) {
        return NextResponse.json(
          {
            success: false,
            message: "Duplicate variant SKUs are not allowed.",
          },
          { status: 409 }
        );
      }

      skuSet.add(sku);
    }

    /* ---------------------------------------------------------------------- */
    /* Check Existing SKUs                                                    */
    /* ---------------------------------------------------------------------- */

    const skuValues = variants.map((variant) =>
      String(variant.sku).trim()
    );

    const existingVariants = await prisma.productVariant.findMany({
      where: {
        sku: {
          in: skuValues,
        },
      },
      select: {
        sku: true,
      },
    });

    if (existingVariants.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `SKU already exists: ${existingVariants[0].sku}`,
        },
        { status: 409 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Variants                                                      */
    /* ---------------------------------------------------------------------- */

    for (const variant of variants) {
      const price = Number(variant.price);

      const discount = Number(variant.percentageDiscount ?? 0);

      const stock = Number(variant.stock);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid price for SKU ${variant.sku}.`,
          },
          { status: 400 }
        );
      }

      if (
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > 100
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid discount for SKU ${variant.sku}.`,
          },
          { status: 400 }
        );
      }

      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid stock for SKU ${variant.sku}.`,
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Colors & Sizes                                                */
    /* ---------------------------------------------------------------------- */

    const colorIds = [
      ...new Set(
        variants
          .map((variant) =>
            variant.colorId ? String(variant.colorId) : null
          )
          .filter(Boolean) as string[]
      ),
    ];

    const sizeIds = [
      ...new Set(
        variants
          .map((variant) =>
            variant.sizeId ? String(variant.sizeId) : null
          )
          .filter(Boolean) as string[]
      ),
    ];

    /* ---------------------------------------------------------------------- */
    /* Validate Colors                                                        */
    /* ---------------------------------------------------------------------- */

    if (colorIds.length > 0) {
      const colors = await prisma.productColor.findMany({
        where: {
          id: {
            in: colorIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (colors.length !== colorIds.length) {
        return NextResponse.json(
          {
            success: false,
            message: "One or more selected colors do not exist.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Sizes                                                         */
    /* ---------------------------------------------------------------------- */

    if (sizeIds.length > 0) {
      const sizes = await prisma.productSize.findMany({
        where: {
          id: {
            in: sizeIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (sizes.length !== sizeIds.length) {
        return NextResponse.json(
          {
            success: false,
            message: "One or more selected sizes do not exist.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Get Image Files                                                        */
    /* ---------------------------------------------------------------------- */

    const imageEntries = formData.getAll("images");

    const imageFiles = imageEntries.filter(
      (entry): entry is File =>
        entry instanceof File && entry.size > 0
    );

    if (imageFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one product image is required.",
        },
        { status: 400 }
      );
    }

    if (imageFiles.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          success: false,
          message: `You can upload a maximum of ${MAX_IMAGES} images.`,
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Image Files                                                   */
    /* ---------------------------------------------------------------------- */

    for (const file of imageFiles) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            success: false,
            message: `${file.name} is not a valid image.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: `${file.name} exceeds the 10MB limit.`,
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Generate Slug                                                          */
    /* ---------------------------------------------------------------------- */

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to generate a valid product slug.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Check Existing Product                                                 */
    /* ---------------------------------------------------------------------- */

    const existingProduct = await prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with this name already exists.",
        },
        { status: 409 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Create Product                                                         */
    /* ---------------------------------------------------------------------- */

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        shortDescription,
        longDescription,
        categoryId,
        brandId,
        isActive,

        ...(tagIds.length > 0 && {
          tags: {
            connect: tagIds.map((tagId) => ({
              id: tagId,
            })),
          },
        }),
      },
    });

    createdProductId = product.id;

    /* ---------------------------------------------------------------------- */
    /* Upload Images to ImageKit                                              */
    /* ---------------------------------------------------------------------- */

    const productImages: {
      url: string;
      alt: string;
      productId: string;
      sortOrder: number;
    }[] = [];

    for (let index = 0; index < imageFiles.length; index++) {
      const imageFile = imageFiles[index];

      if (!imageFile) {
        continue;
      }

      /* -------------------------------------------------------------------- */
      /* Convert File → Buffer → Base64                                       */
      /* -------------------------------------------------------------------- */

      const buffer = Buffer.from(
        await imageFile.arrayBuffer()
      );

      const base64File = buffer.toString("base64");

      /* -------------------------------------------------------------------- */
      /* Create Safe File Name                                                */
      /* -------------------------------------------------------------------- */

      const originalExtension =
        imageFile.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const safeExtension =
        originalExtension.replace(/[^a-z0-9]/g, "") || "jpg";

      const fileName =
        `${index}-${crypto.randomUUID()}.${safeExtension}`;

      /* -------------------------------------------------------------------- */
      /* Upload to ImageKit                                                   */
      /* -------------------------------------------------------------------- */

      const uploadResponse = await imagekit.files.upload({
        file: base64File,
        fileName,
        folder: `${IMAGEKIT_PRODUCT_FOLDER}/${product.id}`,
        useUniqueFileName: false,
        overwriteFile: false,
        isPrivateFile: false,
      });

      if (!uploadResponse.url) {
        throw new Error(
          `ImageKit failed to upload ${imageFile.name}.`
        );
      }

      /* -------------------------------------------------------------------- */
      /* Track ImageKit File ID                                               */
      /* -------------------------------------------------------------------- */

      if (uploadResponse.fileId) {
        uploadedFileIds.push(uploadResponse.fileId);
      }

      /* -------------------------------------------------------------------- */
      /* Prepare Product Image                                                */
      /* -------------------------------------------------------------------- */

      productImages.push({
        url: uploadResponse.url,
        alt: `${name} image ${index + 1}`,
        productId: product.id,
        sortOrder: index,
      });
    }

    /* ---------------------------------------------------------------------- */
    /* Make Sure Images Were Uploaded                                         */
    /* ---------------------------------------------------------------------- */

    if (productImages.length === 0) {
      throw new Error("No product images were uploaded.");
    }

    /* ---------------------------------------------------------------------- */
    /* Create Product Images                                                  */
    /* ---------------------------------------------------------------------- */

    await prisma.productImage.createMany({
      data: productImages,
    });

    /* ---------------------------------------------------------------------- */
    /* Set Featured Image                                                     */
    /* ---------------------------------------------------------------------- */

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        featuredImage: productImages[0]?.url ?? null,
      },
    });

    /* ---------------------------------------------------------------------- */
    /* Create Product Variants                                                */
    /* ---------------------------------------------------------------------- */

    await prisma.productVariant.createMany({
      data: variants.map((variant) => ({
        productId: product.id,

        sku: String(variant.sku).trim(),

        colorId: variant.colorId || null,

        sizeId: variant.sizeId || null,

        price: Number(variant.price),

        percentageDiscount: Number(
          variant.percentageDiscount ?? 0
        ),

        stock: Number(variant.stock),

        isActive:
          typeof variant.isActive === "boolean"
            ? variant.isActive
            : true,
      })),
    });

    /* ---------------------------------------------------------------------- */
    /* Return Complete Product                                                */
    /* ---------------------------------------------------------------------- */

    const createdProduct =
      await prisma.product.findUnique({
        where: {
          id: product.id,
        },
        include: {
          category: true,
          brand: true,
          tags: true,

          images: {
            orderBy: {
              sortOrder: "asc",
            },
          },

          variants: {
            include: {
              color: true,
              size: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        product: createdProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/store/products error:",
      error
    );

    /* ---------------------------------------------------------------------- */
    /* Cleanup ImageKit Uploads                                               */
    /* ---------------------------------------------------------------------- */

    if (uploadedFileIds.length > 0) {
      for (const fileId of uploadedFileIds) {
        try {
          await imagekit.files.delete(fileId);
        } catch (cleanupError) {
          console.error(
            `ImageKit cleanup failed for ${fileId}:`,
            cleanupError
          );
        }
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Cleanup Product                                                        */
    /* ---------------------------------------------------------------------- */

    if (createdProductId) {
      try {
        await prisma.product.delete({
          where: {
            id: createdProductId,
          },
        });
      } catch (cleanupError) {
        console.error(
          "Product cleanup error:",
          cleanupError
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Error Response                                                         */
    /* ---------------------------------------------------------------------- */

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create product.",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* GET /api/store/products                                                    */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        category: true,
        brand: true,
        tags: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        variants: {
          include: {
            color: true,
            size: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "GET /api/store/products error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products.",
      },
      { status: 500 }
    );
  }
}