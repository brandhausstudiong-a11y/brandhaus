import { NextRequest, NextResponse } from "next/server";
import ImageKit from "@imagekit/nodejs";

import prisma from "@/lib/prisma";

/* ============================================================
   IMAGEKIT
============================================================ */

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

const IMAGEKIT_OUTFIT_FOLDER = "/outfits";

const MAX_IMAGES = 20;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

/* ============================================================
   TYPES
============================================================ */

type ProductInput = {
  productId: string;
  sortOrder?: number;
};

type UploadedImage = {
  url: string;
  fileId: string | null;
  alt: string | null;
  sortOrder: number;
};

/* ============================================================
   HELPERS
============================================================ */

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFileExtension(file: File) {
  const originalExtension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  return originalExtension &&
    /^[a-z0-9]+$/.test(originalExtension)
    ? originalExtension
    : "jpg";
}

/* ============================================================
   POST
   Create Outfit
============================================================ */

export async function POST(request: NextRequest) {
  let createdOutfitId: string | null = null;

  /*
   * Keep track of ImageKit file IDs so that if something
   * fails after uploading, we can remove the uploaded files.
   */
  const uploadedFileIds: string[] = [];

  try {
    /* ==========================================================
       READ MULTIPART FORM DATA
    ========================================================== */

    const formData = await request.formData();

    const nameValue = formData.get("name");

    const slugValue = formData.get("slug");

    const shortDescriptionValue =
      formData.get("shortDescription");

    const longDescriptionValue =
      formData.get("longDescription");

    const collectionIdValue =
      formData.get("collectionId");

    const isActiveValue =
      formData.get("isActive");

    const productsValue =
      formData.get("products");

    const tagsValue =
      formData.get("tags");

    const featuredImageValue =
      formData.get("featuredImage");

    /* ==========================================================
       NAME
    ========================================================== */

    if (
      typeof nameValue !== "string" ||
      !nameValue.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Outfit name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const name = nameValue.trim();

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Outfit name must be at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Outfit name cannot exceed 100 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================================================
       SLUG
    ========================================================== */

    const slug =
      typeof slugValue === "string" &&
      slugValue.trim()
        ? generateSlug(slugValue)
        : generateSlug(name);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid slug could not be generated.",
        },
        {
          status: 400,
        }
      );
    }

    if (slug.length > 120) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug cannot exceed 120 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================================================
       DESCRIPTIONS
    ========================================================== */

    let shortDescription: string | null = null;

    let longDescription: string | null = null;

    if (
      typeof shortDescriptionValue === "string" &&
      shortDescriptionValue.trim()
    ) {
      shortDescription =
        shortDescriptionValue.trim();

      if (shortDescription.length > 500) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Short description cannot exceed 500 characters.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (
      typeof longDescriptionValue === "string" &&
      longDescriptionValue.trim()
    ) {
      longDescription =
        longDescriptionValue.trim();

      if (longDescription.length > 5000) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Long description cannot exceed 5000 characters.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* ==========================================================
       ACTIVE STATUS
    ========================================================== */

    let isActive = true;

    if (typeof isActiveValue === "string") {
      isActive = isActiveValue === "true";
    }

    /* ==========================================================
       COLLECTION
    ========================================================== */

    let collectionId: string | null = null;

    if (
      typeof collectionIdValue === "string" &&
      collectionIdValue.trim()
    ) {
      collectionId =
        collectionIdValue.trim();

      const collection =
        await prisma.collection.findUnique({
          where: {
            id: collectionId,
          },

          select: {
            id: true,
          },
        });

      if (!collection) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected collection does not exist.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* ==========================================================
       CHECK DUPLICATE SLUG
    ========================================================== */

    const existingOutfit =
      await prisma.outfit.findUnique({
        where: {
          slug,
        },

        select: {
          id: true,
        },
      });

    if (existingOutfit) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An outfit with this slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /* ==========================================================
       TAGS
    ========================================================== */

    let tagIds: string[] = [];

    if (
      typeof tagsValue === "string" &&
      tagsValue.trim()
    ) {
      try {
        const parsedTags = JSON.parse(tagsValue);

        if (!Array.isArray(parsedTags)) {
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
            parsedTags.map((id) => String(id))
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
    }

    if (tagIds.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: {
          id: {
            in: tagIds,
          },
        },
        select: {
          id: true,
        },
      });

      const existingTagIds = new Set(
        existingTags.map((tag) => tag.id)
      );

      const missingTagIds = tagIds.filter(
        (id) => !existingTagIds.has(id)
      );

      if (missingTagIds.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "One or more selected tags do not exist.",
            missingTagIds,
          },
          { status: 400 }
        );
      }
    }

    /* ==========================================================
       PRODUCTS
    ========================================================== */

    let products: ProductInput[] = [];

    if (
      typeof productsValue === "string" &&
      productsValue.trim()
    ) {
      try {
        const parsed =
          JSON.parse(productsValue);

        if (!Array.isArray(parsed)) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Products must be an array.",
            },
            {
              status: 400,
            }
          );
        }

        products = parsed.map(
          (product, index) => ({
            productId: String(
              product.productId
            ),

            sortOrder:
              typeof product.sortOrder ===
              "number"
                ? product.sortOrder
                : index,
          })
        );
      } catch {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid products data.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* ==========================================================
       REMOVE DUPLICATE PRODUCT IDs
    ========================================================== */

    const uniqueProductIds = [
      ...new Set(
        products.map(
          (product) => product.productId
        )
      ),
    ];

    if (
      uniqueProductIds.length !==
      products.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An outfit cannot contain the same product more than once.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================================================
       VERIFY PRODUCTS
    ========================================================== */

    if (uniqueProductIds.length > 0) {
      const existingProducts =
        await prisma.product.findMany({
          where: {
            id: {
              in: uniqueProductIds,
            },
          },

          select: {
            id: true,
          },
        });

      const existingProductIds =
        new Set(
          existingProducts.map(
            (product) => product.id
          )
        );

      const missingProductIds =
        uniqueProductIds.filter(
          (id) =>
            !existingProductIds.has(id)
        );

      if (missingProductIds.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "One or more selected products do not exist.",
            missingProductIds,
          },
          {
            status: 400,
          }
        );
      }
    }

    /* ==========================================================
       IMAGES
    ========================================================== */

    const featuredImageFile =
      featuredImageValue instanceof File &&
      featuredImageValue.size > 0
        ? featuredImageValue
        : null;

    const galleryFiles =
      formData
        .getAll("images")
        .filter(
          (value): value is File =>
            value instanceof File &&
            value.size > 0
        );

    if (!featuredImageFile) {
      return NextResponse.json(
        {
          success: false,
          message: "A featured image is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Store the featured image as the first OutfitImage.
     * This means every stored image, including the featured
     * image, has an ImageKit file ID available for cleanup.
     */
    const imageFiles = [
      featuredImageFile,
      ...galleryFiles,
    ];

    if (imageFiles.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          success: false,
          message:
            `An outfit can have a maximum of ${MAX_IMAGES} images.`,
        },
        { status: 400 }
      );
    }

    /* ==========================================================
       VALIDATE IMAGES
    ========================================================== */

    for (const file of imageFiles) {
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Outfit images must be PNG, JPG or WEBP.",
          },
          {
            status: 400,
          }
        );
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each outfit image must be smaller than 10MB.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* ==========================================================
       CREATE OUTFIT
    ========================================================== */

    const outfit =
      await prisma.outfit.create({
        data: {
          name,
          slug,
          shortDescription,
          longDescription,
          featuredImage: null,
          isActive,
          collectionId,

          tags:
            tagIds.length > 0
              ? {
                  connect: tagIds.map((id) => ({ id })),
                }
              : undefined,

          products:
            products.length > 0
              ? {
                  create: products.map(
                    (product, index) => ({
                      productId:
                        product.productId,

                      sortOrder:
                        product.sortOrder ??
                        index,
                    })
                  ),
                }
              : undefined,
        },

        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          longDescription: true,
          featuredImage: true,
          isActive: true,
          collectionId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    createdOutfitId = outfit.id;

    /* ==========================================================
       UPLOAD IMAGES TO IMAGEKIT
    ========================================================== */

    const uploadedImages: UploadedImage[] = [];

    for (
      let index = 0;
      index < imageFiles.length;
      index++
    ) {
      const file = imageFiles[index];

      const extension =
        getFileExtension(file);

      /*
       * Example:
       *
       * outfits/
       *   cmxyz123/
       *     0-c92b477f.jpg
       *
       * Keeping the index at the beginning makes
       * the files easier to identify in ImageKit.
       */

      const fileName =
        `${index}-${crypto.randomUUID()}.${extension}`;

      const fileBuffer = Buffer.from(
        await file.arrayBuffer()
      );

      /*
       * IMPORTANT:
       *
       * @imagekit/nodejs expects `string | Uploadable`
       * for `file`.
       *
       * Buffer directly can cause:
       *
       * Type 'Buffer<ArrayBuffer>' is not assignable
       * to type 'string | Uploadable'
       *
       * Therefore we convert the buffer to Base64.
       */

      const base64File =
        fileBuffer.toString("base64");

      /* ========================================================
         IMAGEKIT UPLOAD
      ======================================================== */

      const uploadResponse =
        await imagekit.files.upload({
          file: base64File,

          fileName,

          folder:
            `${IMAGEKIT_OUTFIT_FOLDER}/${outfit.id}`,

          useUniqueFileName: false,

          overwriteFile: false,

          isPrivateFile: false,
        });

      if (!uploadResponse.url) {
        throw new Error(
          `ImageKit did not return a URL for ${file.name}.`
        );
      }

      /*
       * Keep fileId so we can delete the ImageKit
       * file if a later database operation fails.
       */

      if (uploadResponse.fileId) {
        uploadedFileIds.push(
          uploadResponse.fileId
        );
      }

      uploadedImages.push({
        url: uploadResponse.url,

        fileId:
          uploadResponse.fileId ?? null,

        alt: file.name,

        sortOrder: index,
      });
    }

    /* ==========================================================
       CREATE OUTFIT IMAGE RECORDS
    ========================================================== */

    if (uploadedImages.length > 0) {
      await prisma.outfitImage.createMany({
        data: uploadedImages.map(
          (image) => ({
            outfitId: outfit.id,

            url: image.url,

            alt: image.alt,

            imageKitFileId: image.fileId,

            sortOrder:
              image.sortOrder,
          })
        ),
      });
    }

    /* ==========================================================
       SET FEATURED IMAGE
    ========================================================== */

    const featuredImage =
      uploadedImages[0]?.url ?? null;

    const updatedOutfit =
      await prisma.outfit.update({
        where: {
          id: outfit.id,
        },

        data: {
          featuredImage,
        },

        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          longDescription: true,
          featuredImage: true,
          isActive: true,
          collectionId: true,
          createdAt: true,
          updatedAt: true,

          collection: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          images: {
            orderBy: {
              sortOrder: "asc",
            },

            select: {
              id: true,
              url: true,
              alt: true,
              imageKitFileId: true,
              sortOrder: true,
            },
          },

          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          products: {
            orderBy: {
              sortOrder: "asc",
            },

            select: {
              sortOrder: true,

              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  featuredImage: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });

    /* ==========================================================
       SUCCESS
    ========================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Outfit created successfully.",

        outfit: updatedOutfit,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create outfit error:",
      error
    );

    /* ==========================================================
       CLEANUP IMAGEKIT FILES
    ========================================================== */

    if (uploadedFileIds.length > 0) {
      for (const fileId of uploadedFileIds) {
        try {
          await imagekit.files.delete(
            fileId
          );
        } catch (cleanupError) {
          console.error(
            `Failed to cleanup ImageKit file ${fileId}:`,
            cleanupError
          );
        }
      }
    }

    /* ==========================================================
       CLEANUP DATABASE
    ========================================================== */

    if (createdOutfitId) {
      try {
        await prisma.outfit.delete({
          where: {
            id: createdOutfitId,
          },
        });
      } catch (deleteError) {
        console.error(
          "Failed to cleanup outfit:",
          deleteError
        );
      }
    }

    /* ==========================================================
       ERROR RESPONSE
    ========================================================== */

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to create outfit.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================
   GET
   Get All Outfits
============================================================ */

export async function GET() {
  try {
    const outfits =
      await prisma.outfit.findMany({
        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          longDescription: true,
          featuredImage: true,
          isActive: true,
          collectionId: true,
          createdAt: true,
          updatedAt: true,

          collection: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          images: {
            orderBy: {
              sortOrder: "asc",
            },

            select: {
              id: true,
              url: true,
              alt: true,
              imageKitFileId: true,
              sortOrder: true,
              createdAt: true,
            },
          },

          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          products: {
            orderBy: {
              sortOrder: "asc",
            },

            select: {
              sortOrder: true,

              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  featuredImage: true,
                  isActive: true,

                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        outfits,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Get outfits error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch outfits.",
      },
      {
        status: 500,
      }
    );
  }
}