import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

const IMAGEKIT_PRODUCT_FOLDER = "/products";
const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type IncomingVariant = {
  id?: string;
  sku: string;
  colorId?: string | null;
  sizeId?: string | null;
  price: number;
  percentageDiscount?: number;
  stock: number;
  isActive?: boolean;
};

type IncomingImage = {
  id?: string;
  url?: string;
  alt?: string | null;
  sortOrder?: number;
  imageKitFileId?: string | null;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function getProduct(productId: string) {
  return prisma.product.findUnique({
    where: {
      id: productId,
    },

    include: {
      category: true,

      brand: true,

      tags: {
        orderBy: {
          sortOrder: "asc",
        },
      },

      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },

      variants: {
        orderBy: {
          createdAt: "asc",
        },

        include: {
          color: true,
          size: true,
        },
      },
    },
  });
}

/* -------------------------------------------------------------------------- */
/* GET                                                                        */
/* GET /api/admin/products/[productId]                                        */
/* -------------------------------------------------------------------------- */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
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

    const product = await getProduct(productId);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/products/[productId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product.",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PATCH                                                                      */
/* PATCH /api/admin/products/[productId]                                      */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  // Keep this outside the try block so the catch block can clean up uploads.
  let uploadedFileIds: string[] = [];

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

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        images: true,
        variants: true,
      },
    });

    if (!existingProduct) {
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

    const contentType =
      request.headers.get("content-type") || "";

    let name: string | undefined;
    let shortDescription: string | null | undefined;
    let longDescription: string | null | undefined;
    let categoryId: string | null | undefined;
    let brandId: string | null | undefined;
    let isActive: boolean | undefined;

    let tagIds: string[] | undefined;
    let variants: IncomingVariant[] | undefined;
    let images: IncomingImage[] | undefined;
    let imageFiles: File[] = [];

    if (contentType.includes("application/json")) {
      const body = await request.json();

      name =
        body.name !== undefined
          ? String(body.name).trim()
          : undefined;

      shortDescription =
        body.shortDescription !== undefined
          ? String(body.shortDescription).trim() || null
          : undefined;

      longDescription =
        body.longDescription !== undefined
          ? String(body.longDescription).trim() || null
          : undefined;

      categoryId =
        body.categoryId !== undefined
          ? String(body.categoryId).trim() || null
          : undefined;

      brandId =
        body.brandId !== undefined
          ? String(body.brandId).trim() || null
          : undefined;

      isActive =
        body.isActive !== undefined
          ? Boolean(body.isActive)
          : undefined;

      tagIds =
        body.tagIds !== undefined
          ? body.tagIds
          : undefined;

      variants =
        body.variants !== undefined
          ? body.variants
          : undefined;

      images =
        body.images !== undefined
          ? body.images
          : undefined;
    } else {
      const formData = await request.formData();

      if (formData.has("name")) {
        name = String(formData.get("name") ?? "").trim();
      }

      if (formData.has("shortDescription")) {
        shortDescription =
          String(formData.get("shortDescription") ?? "").trim() || null;
      }

      if (formData.has("longDescription")) {
        longDescription =
          String(formData.get("longDescription") ?? "").trim() || null;
      }

      if (formData.has("categoryId")) {
        categoryId =
          String(formData.get("categoryId") ?? "").trim() || null;
      }

      if (formData.has("brandId")) {
        brandId =
          String(formData.get("brandId") ?? "").trim() || null;
      }

      if (formData.has("isActive")) {
        isActive =
          String(formData.get("isActive")) !== "false";
      }

      if (formData.has("tags")) {
        try {
          tagIds = JSON.parse(
            String(formData.get("tags") ?? "[]")
          );
        } catch {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid tags data.",
            },
            { status: 400 }
          );
        }
      }

      if (formData.has("variants")) {
        try {
          variants = JSON.parse(
            String(formData.get("variants") ?? "[]")
          );
        } catch {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid variants data.",
            },
            { status: 400 }
          );
        }
      }

      /*
       * Existing images are sent separately from new image files.
       */
      if (formData.has("existingImages")) {
        try {
          images = JSON.parse(
            String(formData.get("existingImages") ?? "[]")
          );
        } catch {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid existing images data.",
            },
            { status: 400 }
          );
        }
      }

      /*
       * New files use the "images" field.
       */
      imageFiles = formData
        .getAll("images")
        .filter(
          (entry): entry is File =>
            entry instanceof File && entry.size > 0
        );
    }
    /* ---------------------------------------------------------------------- */
    /* Validate Name                                                          */
    /* ---------------------------------------------------------------------- */

    if (name !== undefined) {
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
            message:
              "Product name must be at least 2 characters.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Category                                                      */
    /* ---------------------------------------------------------------------- */

    if (
      categoryId !== undefined &&
      categoryId !== null
    ) {
      const category =
        await prisma.category.findUnique({
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
            message:
              "Selected category does not exist.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Brand                                                         */
    /* ---------------------------------------------------------------------- */

    if (brandId === null) {
      return NextResponse.json(
        {
          success: false,
          message: "A product must have a brand.",
        },
        { status: 400 }
      );
    }

    if (brandId !== undefined) {
      const brand =
        await prisma.brand.findUnique({
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
            message:
              "Selected brand does not exist.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Tags                                                          */
    /* ---------------------------------------------------------------------- */

    if (tagIds !== undefined) {
      if (!Array.isArray(tagIds)) {
        return NextResponse.json(
          {
            success: false,
            message: "Tags must be an array.",
          },
          { status: 400 }
        );
      }

      tagIds = [
        ...new Set(
          tagIds
            .map((tagId) => String(tagId).trim())
            .filter(Boolean)
        ),
      ];

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
              message:
                "One or more selected tags do not exist.",
            },
            { status: 400 }
          );
        }
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Variants                                                      */
    /* ---------------------------------------------------------------------- */

    if (variants !== undefined) {
      if (!Array.isArray(variants)) {
        return NextResponse.json(
          {
            success: false,
            message: "Variants must be an array.",
          },
          { status: 400 }
        );
      }

      const skuSet = new Set<string>();

      for (const variant of variants) {
        const sku = String(
          variant.sku ?? ""
        ).trim();

        if (!sku) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Every variant must have a SKU.",
            },
            { status: 400 }
          );
        }

        const normalizedSku =
          sku.toLowerCase();

        if (skuSet.has(normalizedSku)) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Duplicate variant SKUs are not allowed.",
            },
            { status: 409 }
          );
        }

        skuSet.add(normalizedSku);

        const price = Number(
          variant.price
        );

        const discount = Number(
          variant.percentageDiscount ?? 0
        );

        const stock = Number(
          variant.stock
        );

        if (
          !Number.isFinite(price) ||
          price < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `Invalid price for SKU ${sku}.`,
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
              message:
                `Invalid discount for SKU ${sku}.`,
            },
            { status: 400 }
          );
        }

        if (
          !Number.isInteger(stock) ||
          stock < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `Invalid stock for SKU ${sku}.`,
            },
            { status: 400 }
          );
        }
      }

      /* -------------------------------------------------------------------- */
      /* Check SKU Conflicts                                                  */
      /* -------------------------------------------------------------------- */

      const incomingSkus =
        variants.map((variant) =>
          String(variant.sku).trim()
        );

      const existingSkus =
        await prisma.productVariant.findMany({
          where: {
            sku: {
              in: incomingSkus,
            },
            productId: {
              not: productId,
            },
          },
          select: {
            sku: true,
          },
        });

      if (existingSkus.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              `SKU already exists: ${existingSkus[0].sku}`,
          },
          { status: 409 }
        );
      }

      /* -------------------------------------------------------------------- */
      /* Validate Colors                                                      */
      /* -------------------------------------------------------------------- */

      const colorIds = [
        ...new Set(
          variants
            .map((variant) =>
              variant.colorId
                ? String(variant.colorId)
                : null
            )
            .filter(Boolean) as string[]
        ),
      ];

      const sizeIds = [
        ...new Set(
          variants
            .map((variant) =>
              variant.sizeId
                ? String(variant.sizeId)
                : null
            )
            .filter(Boolean) as string[]
        ),
      ];

      if (colorIds.length > 0) {
        const colors =
          await prisma.productColor.findMany({
            where: {
              id: {
                in: colorIds,
              },
            },
            select: {
              id: true,
            },
          });

        if (
          colors.length !==
          colorIds.length
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "One or more selected colors do not exist.",
            },
            { status: 400 }
          );
        }
      }

      /* -------------------------------------------------------------------- */
      /* Validate Sizes                                                       */
      /* -------------------------------------------------------------------- */

      if (sizeIds.length > 0) {
        const sizes =
          await prisma.productSize.findMany({
            where: {
              id: {
                in: sizeIds,
              },
            },
            select: {
              id: true,
            },
          });

        if (
          sizes.length !== sizeIds.length
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "One or more selected sizes do not exist.",
            },
            { status: 400 }
          );
        }
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Validate / Prepare New Images                                          */
    /* ---------------------------------------------------------------------- */

    const retainedImageCount = images?.length ?? existingProduct.images.length;
    const totalImageCount =
      retainedImageCount + imageFiles.length;

    if (totalImageCount > MAX_IMAGES) {
      return NextResponse.json(
        {
          success: false,
          message: `You can have a maximum of ${MAX_IMAGES} product images.`,
        },
        { status: 400 }
      );
    }

    if (totalImageCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one product image is required.",
        },
        { status: 400 }
      );
    }

    for (const file of imageFiles) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            success: false,
            message: `${file.name} is not a valid image file.`,
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

    let slug: string | undefined;

    if (name !== undefined) {
      slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to generate a valid product slug.",
          },
          { status: 400 }
        );
      }

      const existingSlug =
        await prisma.product.findFirst({
          where: {
            slug,
            NOT: {
              id: productId,
            },
          },
          select: {
            id: true,
          },
        });

      if (existingSlug) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another product with this name already exists.",
          },
          { status: 409 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Update Product                                                          */
    /* ---------------------------------------------------------------------- */

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(longDescription !== undefined && { longDescription }),

        // Use relation fields to avoid mixing checked and unchecked inputs.
        ...(categoryId !== undefined && {
          category: categoryId
            ? { connect: { id: categoryId } }
            : { disconnect: true },
        }),

        // Product.brandId is required, so a brand cannot be disconnected.
        ...(brandId !== undefined && brandId !== null && {
          brand: { connect: { id: brandId } },
        }),

        ...(isActive !== undefined && { isActive }),

        ...(tagIds !== undefined && {
          tags: {
            set: tagIds.map((tagId) => ({ id: tagId })),
          },
        }),
      },
    });

    /* ---------------------------------------------------------------------- */
    /* Update Images + ImageKit                                               */
    /* ---------------------------------------------------------------------- */

    /*
     * If "images" is omitted, retain all existing images.
     * If it is supplied, it represents the existing images the user kept.
     */
    const retainedImages =
      images !== undefined
        ? images
        : existingProduct.images.map((image, index) => ({
            id: image.id,
            alt: image.alt,
            sortOrder: index,
          }));

    const existingImageIds =
      existingProduct.images.map((image) => image.id);

    const retainedExistingImageIds =
      retainedImages
        .map((image) => image.id)
        .filter(
          (imageId): imageId is string =>
            typeof imageId === "string" &&
            existingImageIds.includes(imageId)
        );

    /*
     * Remove images that were deleted from the edit form.
     * Also remove their remote ImageKit files when a file ID is available.
     */
    const imagesToDelete =
      existingProduct.images.filter(
        (image) =>
          !retainedExistingImageIds.includes(image.id)
      );

    for (const image of imagesToDelete) {
      if (image.imageKitFileId) {
        try {
          await imagekit.files.delete(
            image.imageKitFileId
          );
        } catch (cleanupError) {
          console.error(
            `ImageKit delete failed for ${image.imageKitFileId}:`,
            cleanupError
          );
        }
      }
    }

    if (imagesToDelete.length > 0) {
      await prisma.productImage.deleteMany({
        where: {
          id: {
            in: imagesToDelete.map((image) => image.id),
          },
          productId,
        },
      });
    }

    /*
     * Upload new files to:
     * /products/{productId}
     */
    const newProductImages: {
      url: string;
      alt: string;
      imageKitFileId: string | null;
      productId: string;
      sortOrder: number;
    }[] = [];

    for (
      let index = 0;
      index < imageFiles.length;
      index++
    ) {
      const imageFile = imageFiles[index];

      const buffer = Buffer.from(
        await imageFile.arrayBuffer()
      );

      const base64File =
        buffer.toString("base64");

      const originalExtension =
        imageFile.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const safeExtension =
        originalExtension.replace(
          /[^a-z0-9]/g,
          ""
        ) || "jpg";

      const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;

      const uploadResponse =
        await imagekit.files.upload({
          file: base64File,
          fileName,
          folder:
            `${IMAGEKIT_PRODUCT_FOLDER}/${productId}`,
          useUniqueFileName: false,
          overwriteFile: false,
          isPrivateFile: false,
        });

      if (!uploadResponse.url) {
        throw new Error(
          `ImageKit failed to upload ${imageFile.name}.`
        );
      }

      if (uploadResponse.fileId) {
        uploadedFileIds.push(
          uploadResponse.fileId
        );
      }

      newProductImages.push({
        url: uploadResponse.url,
        alt:
          `${name ?? existingProduct.name} image`,
        imageKitFileId:
          uploadResponse.fileId ?? null,
        productId,
        sortOrder:
          retainedImages.length + index,
      });
    }

    if (newProductImages.length > 0) {
      await prisma.productImage.createMany({
        data: newProductImages,
      });
    }

    /*
     * Re-number all retained images and newly uploaded images.
     */
    const currentImages =
      await prisma.productImage.findMany({
        where: {
          productId,
        },
        orderBy: {
          sortOrder: "asc",
        },
      });

    /*
     * Preserve the order submitted by the client for existing images,
     * followed by newly uploaded images.
     */
    const existingById = new Map(
      currentImages.map((image) => [
        image.id,
        image,
      ])
    );

    const orderedImageIds = [
      ...retainedImages
        .map((image) => image.id)
        .filter(
          (id): id is string =>
            typeof id === "string" &&
            existingById.has(id)
        ),
      ...newProductImages.map(
        (_, index) =>
          currentImages.find(
            (image) =>
              image.url ===
              newProductImages[index]?.url
          )?.id
      ),
    ].filter(
      (id): id is string =>
        typeof id === "string"
    );

    for (
      let index = 0;
      index < orderedImageIds.length;
      index++
    ) {
      await prisma.productImage.update({
        where: {
          id: orderedImageIds[index],
        },
        data: {
          sortOrder: index,
        },
      });
    }

    /*
     * At least one image must remain after editing.
     */
    const firstImage =
      await prisma.productImage.findFirst({
        where: {
          productId,
        },
        orderBy: {
          sortOrder: "asc",
        },
      });

    if (!firstImage) {
      throw new Error(
        "At least one product image is required."
      );
    }

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        featuredImage: firstImage.url,
      },
    });
    /* ---------------------------------------------------------------------- */
    /* Update Variants                                                        */
    /* ---------------------------------------------------------------------- */

    if (variants !== undefined) {
      const existingVariantIds =
        existingProduct.variants.map(
          (variant) => variant.id
        );

      const incomingVariantIds =
        variants
          .map((variant) => variant.id)
          .filter(
            (
              variantId
            ): variantId is string =>
              typeof variantId === "string" &&
              existingVariantIds.includes(
                variantId
              )
          );

      /*
       * Delete variants removed from the edit form.
       */

      const variantsToDelete =
        existingVariantIds.filter(
          (variantId) =>
            !incomingVariantIds.includes(
              variantId
            )
        );

      if (variantsToDelete.length > 0) {
        await prisma.productVariant.deleteMany({
          where: {
            id: {
              in: variantsToDelete,
            },
            productId,
          },
        });
      }

      /* -------------------------------------------------------------------- */
      /* Update Existing / Create New Variants                                */
      /* -------------------------------------------------------------------- */

      for (const variant of variants) {
        const sku = String(
          variant.sku
        ).trim();

        const variantData = {
          sku,

          colorId:
            variant.colorId || null,

          sizeId:
            variant.sizeId || null,

          price: Number(
            variant.price
          ),

          percentageDiscount:
            Number(
              variant.percentageDiscount ?? 0
            ),

          stock: Number(
            variant.stock
          ),

          isActive:
            typeof variant.isActive ===
            "boolean"
              ? variant.isActive
              : true,
        };

        if (
          variant.id &&
          existingVariantIds.includes(
            variant.id
          )
        ) {
          await prisma.productVariant.update({
            where: {
              id: variant.id,
            },
            data: variantData,
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId,
              ...variantData,
            },
          });
        }
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Return Updated Product                                                 */
    /* ---------------------------------------------------------------------- */

    const updatedProduct =
      await getProduct(productId);

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    /*
     * If the database update fails after ImageKit uploads,
     * remove the newly uploaded files so they do not become orphans.
     */
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

    console.error(
      "PATCH /api/admin/products/[productId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update product.",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE                                                                     */
/* DELETE /api/admin/products/[productId]                                     */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
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

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          name: true,
          images: {
            select: {
              imageKitFileId: true,
            },
          },
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
    /* Delete Product                                                         */
    /* ---------------------------------------------------------------------- */

    /*
     * Remove product images from ImageKit before deleting
     * the database records.
     */
    for (const image of product.images) {
      if (!image.imageKitFileId) continue;

      try {
        await imagekit.files.delete(
          image.imageKitFileId
        );
      } catch (cleanupError) {
        console.error(
          `ImageKit delete failed for ${image.imageKitFileId}:`,
          cleanupError
        );
      }
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/products/[productId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete product.",
      },
      { status: 500 }
    );
  }
}