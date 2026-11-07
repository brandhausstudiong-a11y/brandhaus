import { NextRequest, NextResponse } from "next/server";
import ImageKit from "@imagekit/nodejs";

import prisma from "@/lib/prisma";

/* ============================================================
   IMAGEKIT
============================================================ */

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

const IMAGEKIT_COLLECTION_FOLDER = "/collections";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

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

/* ============================================================
   POST
   Create Collection
============================================================ */

export async function POST(request: NextRequest) {
  let uploadedFileId: string | null = null;
  let createdCollectionId: string | null = null;

  try {
    /* ==========================================================
       READ MULTIPART FORM DATA
    ========================================================== */

    const formData = await request.formData();

    const nameValue = formData.get("name");

    const slugValue = formData.get("slug");

    const descriptionValue = formData.get("description");

    const coverImageValue = formData.get("coverImage");

    /* ==========================================================
       VALIDATE NAME
    ========================================================== */

    if (
      typeof nameValue !== "string" ||
      !nameValue.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Collection name is required.",
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
            "Collection name must be at least 2 characters.",
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
            "Collection name cannot exceed 100 characters.",
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

    /* ==========================================================
       DESCRIPTION
    ========================================================== */

    let description: string | null = null;

    if (
      typeof descriptionValue === "string" &&
      descriptionValue.trim()
    ) {
      description = descriptionValue.trim();

      if (description.length > 1000) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Description cannot exceed 1000 characters.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* ==========================================================
       COVER IMAGE
    ========================================================== */

    if (!(coverImageValue instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Collection cover image is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================================================
       IMAGE TYPE
    ========================================================== */

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        coverImageValue.type
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cover image must be PNG, JPG or WEBP.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================================================
       IMAGE SIZE
    ========================================================== */

    if (coverImageValue.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cover image must be smaller than 10MB.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================================================
       CHECK DUPLICATE SLUG
    ========================================================== */

    const existingCollection =
      await prisma.collection.findUnique({
        where: {
          slug,
        },

        select: {
          id: true,
        },
      });

    if (existingCollection) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A collection with this slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /* ==========================================================
       CREATE COLLECTION
    ========================================================== */

    const collection =
      await prisma.collection.create({
        data: {
          name,
          slug,
          description,
          coverImage: null,
        },

        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          coverImage: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    createdCollectionId = collection.id;

    /* ==========================================================
       FILE EXTENSION
    ========================================================== */

    const originalExtension =
      coverImageValue.name
        .split(".")
        .pop()
        ?.toLowerCase();

    const extension =
      originalExtension &&
      /^[a-z0-9]+$/.test(originalExtension)
        ? originalExtension
        : "jpg";

    /* ==========================================================
       IMAGEKIT FILE NAME
    ========================================================== */

    const fileName =
      `${crypto.randomUUID()}.${extension}`;

    /* ==========================================================
       READ FILE
    ========================================================== */

    const fileBuffer = Buffer.from(
      await coverImageValue.arrayBuffer()
    );

    /* ==========================================================
       CONVERT TO BASE64

       @imagekit/nodejs accepts Base64 strings for the
       `file` property.
    ========================================================== */

    const base64File = fileBuffer.toString("base64");

    /* ==========================================================
       UPLOAD TO IMAGEKIT

       Result:

       /collections/
         └── <collection-id>/
               └── uuid.jpg
    ========================================================== */

    const uploadResponse =
      await imagekit.files.upload({
        file: base64File,

        fileName,

        folder:
          `${IMAGEKIT_COLLECTION_FOLDER}/${collection.id}`,

        useUniqueFileName: false,

        overwriteFile: false,

        isPrivateFile: false,
      });

    /* ==========================================================
       VALIDATE IMAGEKIT RESPONSE
    ========================================================== */

    if (!uploadResponse.url) {
      throw new Error(
        "ImageKit did not return an image URL."
      );
    }

    /* ==========================================================
       SAVE IMAGEKIT FILE ID FOR CLEANUP
    ========================================================== */

    if (uploadResponse.fileId) {
      uploadedFileId = uploadResponse.fileId;
    }

    const coverImage = uploadResponse.url;

    /* ==========================================================
       UPDATE COLLECTION WITH IMAGE URL
    ========================================================== */

    const updatedCollection =
      await prisma.collection.update({
        where: {
          id: collection.id,
        },

        data: {
          coverImage,
        },

        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          coverImage: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    /* ==========================================================
       RESPONSE
    ========================================================== */

    return NextResponse.json(
      {
        success: true,
        message:
          "Collection created successfully.",
        collection: updatedCollection,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create collection error:",
      error
    );

    /* ==========================================================
       CLEANUP IMAGEKIT FILE
    ========================================================== */

    if (uploadedFileId) {
      try {
        await imagekit.files.delete(
          uploadedFileId
        );
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup ImageKit image:",
          cleanupError
        );
      }
    }

    /* ==========================================================
       CLEANUP DATABASE
    ========================================================== */

    if (createdCollectionId) {
      try {
        await prisma.collection.delete({
          where: {
            id: createdCollectionId,
          },
        });
      } catch (deleteError) {
        console.error(
          "Failed to cleanup collection:",
          deleteError
        );
      }
    }

    /* ==========================================================
       RESPONSE
    ========================================================== */

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create collection.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================
   GET
   Get All Collections
============================================================ */

export async function GET() {
  try {
    const collections =
      await prisma.collection.findMany({
        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          coverImage: true,
          createdAt: true,
          updatedAt: true,

          _count: {
            select: {
              outfits: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        collections,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Get collections error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch collections.",
      },
      {
        status: 500,
      }
    );
  }
}