"use client";

import * as React from "react";
import {
  ImagePlus,
  X,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ============================================================
   TYPES
============================================================ */

export type Collection = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  image: string;
};

export type StyleImage = {
  id: string;
  url: string;
  alt?: string;
};

export type OutfitTag = {
  id: string;
  name: string;
  slug: string;
};

interface AddOutfitProps {
  collections: Collection[];
  products: Product[];

  errors?: {
    name?: string;
    slug?: string;
    collectionId?: string;
    shortDescription?: string;
    longDescription?: string;
    featuredImage?: string;
    images?: string;
    productIDs?: string;
    tags?: string;
  };

  onSuccess?: () => void;
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

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
   COMPONENT
============================================================ */

export function AddOutfit({
  collections,
  products,
  errors = {},
  onSuccess,
}: AddOutfitProps) {
  /* ==========================================================
     BASIC FORM STATE
  ========================================================== */

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [collectionId, setCollectionId] = React.useState("");

  const [shortDescription, setShortDescription] =
    React.useState("");

  const [longDescription, setLongDescription] =
    React.useState("");

  const [isActive, setIsActive] = React.useState(true);

  /* ==========================================================
     TAG STATE
  ========================================================== */

  const [tags, setTags] = React.useState<OutfitTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const [isTagPickerOpen, setIsTagPickerOpen] = React.useState(false);
  const [isLoadingTags, setIsLoadingTags] = React.useState(true);

  const [slugManuallyEdited, setSlugManuallyEdited] =
    React.useState(false);

  /* ==========================================================
     LOAD TAGS
  ========================================================== */

  React.useEffect(() => {
    let cancelled = false;

    async function loadTags() {
      try {
        setIsLoadingTags(true);

        const response = await fetch("/api/admin/tags");

        if (!response.ok) {
          throw new Error("Failed to load tags.");
        }

        const data = await response.json();

        const loadedTags = Array.isArray(data)
          ? data
          : data.tags ?? [];

        if (!cancelled) {
          setTags(loadedTags);
        }
      } catch (error) {
        console.error("Failed to load outfit tags:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingTags(false);
        }
      }
    }

    loadTags();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     IMAGE STATE
  ========================================================== */

  const [featuredImageFile, setFeaturedImageFile] =
    React.useState<File | null>(null);

  const [featuredImagePreview, setFeaturedImagePreview] =
    React.useState("");

  const [galleryFiles, setGalleryFiles] =
    React.useState<File[]>([]);

  const [galleryImages, setGalleryImages] =
    React.useState<StyleImage[]>([]);

  /* ==========================================================
     PRODUCT STATE
  ========================================================== */

  const [selectedProducts, setSelectedProducts] =
    React.useState<string[]>([]);

  const [isProductDialogOpen, setIsProductDialogOpen] =
    React.useState(false);

  const [productSearch, setProductSearch] =
    React.useState("");

  const [productPage, setProductPage] =
    React.useState(1);

  const PRODUCTS_PER_PAGE = 5;

  /* ==========================================================
     SUBMISSION STATE
  ========================================================== */

  const [isSubmitting, setIsSubmitting] =
    React.useState(false);

  const [submitError, setSubmitError] =
    React.useState("");

  /* ==========================================================
     SLUG
  ========================================================== */

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setName(value);

    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = generateSlug(event.target.value);

    setSlug(value);
    setSlugManuallyEdited(true);
  };

  /* ==========================================================
     FEATURED IMAGE
  ========================================================== */

  const handleFeaturedImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFeaturedImageFile(file);

    const preview = URL.createObjectURL(file);

    setFeaturedImagePreview(preview);
  };

  const removeFeaturedImage = () => {
    if (featuredImagePreview) {
      URL.revokeObjectURL(featuredImagePreview);
    }

    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
  };

  /* ==========================================================
     GALLERY IMAGES
  ========================================================== */

  const handleGalleryImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const newImages: StyleImage[] = files.map(
      (file, index) => ({
        id: `${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        alt: file.name,
      })
    );

    setGalleryFiles((current) => [
      ...current,
      ...files,
    ]);

    setGalleryImages((current) => [
      ...current,
      ...newImages,
    ]);

    // Allow selecting the same file again.
    event.target.value = "";
  };

  const removeGalleryImage = (id: string) => {
    const imageIndex = galleryImages.findIndex(
      (image) => image.id === id
    );

    if (imageIndex === -1) return;

    const image = galleryImages[imageIndex];

    URL.revokeObjectURL(image.url);

    setGalleryImages((current) =>
      current.filter((item) => item.id !== id)
    );

    setGalleryFiles((current) =>
      current.filter(
        (_, index) => index !== imageIndex
      )
    );
  };

  /* ==========================================================
     PRODUCTS
  ========================================================== */

  const selectedProductItems = products.filter(
    (product) =>
      selectedProducts.includes(product.id)
  );

  const filteredProducts = products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(productSearch.toLowerCase())
  );

  const totalProductPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        PRODUCTS_PER_PAGE
    )
  );

  const paginatedProducts =
    filteredProducts.slice(
      (productPage - 1) *
        PRODUCTS_PER_PAGE,
      productPage * PRODUCTS_PER_PAGE
    );

  const toggleProduct = (productId: string) => {
    setSelectedProducts((current) =>
      current.includes(productId)
        ? current.filter(
            (id) => id !== productId
          )
        : [...current, productId]
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((current) =>
      current.filter(
        (id) => id !== productId
      )
    );
  };

  const handleProductSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductSearch(event.target.value);
    setProductPage(1);
  };

  const openProductDialog = () => {
    setProductSearch("");
    setProductPage(1);
    setIsProductDialogOpen(true);
  };

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validateForm = () => {
    if (!name.trim()) {
      return "Outfit name is required.";
    }

    if (name.trim().length < 2) {
      return "Outfit name must be at least 2 characters.";
    }

    if (!slug.trim()) {
      return "Slug is required.";
    }

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        slug
      )
    ) {
      return "Slug can only contain lowercase letters, numbers, and hyphens.";
    }

    if (!collectionId) {
      return "Please select a collection.";
    }

    if (!featuredImageFile) {
      return "A featured image is required.";
    }

    return null;
  };

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSubmitError("");

    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      /* Basic information */
      formData.append("name", name.trim());
      formData.append("slug", slug.trim());

      /* Collection */
      formData.append(
        "collectionId",
        collectionId
      );

      /* Descriptions */
      if (shortDescription.trim()) {
        formData.append(
          "shortDescription",
          shortDescription.trim()
        );
      }

      if (longDescription.trim()) {
        formData.append(
          "longDescription",
          longDescription.trim()
        );
      }

      /* Status */
      formData.append(
        "isActive",
        String(isActive)
      );

      /* Tags */
      formData.append(
        "tags",
        JSON.stringify(selectedTagIds)
      );

      /* Featured image */
      if (featuredImageFile) {
        formData.append(
          "featuredImage",
          featuredImageFile
        );
      }

      /*
       * The API stores the featured image as the first
       * OutfitImage record. This gives it an ImageKit
       * file ID as well.
       */
      galleryFiles.forEach((file) => {
        formData.append("images", file);
      });

      /*
       * Products
       *
       * API expects:
       *
       * [
       *   {
       *     productId: "...",
       *     sortOrder: 0
       *   }
       * ]
       */
      const productData = selectedProducts.map(
        (productId, index) => ({
          productId,
          sortOrder: index,
        })
      );

      formData.append(
        "products",
        JSON.stringify(productData)
      );

      const response = await fetch(
        "/api/admin/outfits",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to create outfit."
        );
      }

      /*
       * Clear the form after a successful creation.
       * Revoke all local object URLs before resetting image state.
       */
      if (featuredImagePreview) {
        URL.revokeObjectURL(featuredImagePreview);
      }

      galleryImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });

      setName("");
      setSlug("");
      setCollectionId("");
      setShortDescription("");
      setLongDescription("");
      setIsActive(true);
      setSelectedTagIds([]);
      setIsTagPickerOpen(false);
      setFeaturedImageFile(null);
      setFeaturedImagePreview("");
      setGalleryFiles([]);
      setGalleryImages([]);
      setSelectedProducts([]);
      setProductSearch("");
      setProductPage(1);
      setIsProductDialogOpen(false);
      setSubmitError("");
      setSlugManuallyEdited(false);

      toast.success(
        result?.message || "Outfit created successfully."
      );

      onSuccess?.();

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create outfit.";

      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <form onSubmit={handleSubmit}>
      <main className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

        {/* ====================================================
            BASIC INFORMATION
        ==================================================== */}

        <section className="rounded-lg bg-primary-foreground p-4 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
          <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
            Basic Information
          </h2>

          <div className="space-y-10">

            {/* Name */}
            <div className="space-y-3">
              <Label
                htmlFor="outfit-name"
                className="text-base font-semibold text-neutral-700"
              >
                Outfit Name
              </Label>

              <Input
                id="outfit-name"
                name="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Classic Weekend Look"
                required
                aria-invalid={!!errors.name}
                className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                  errors.name
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }`}
              />

              <FormError message={errors.name} />
            </div>

            {/* Slug */}
            <div className="space-y-3">
              <Label
                htmlFor="outfit-slug"
                className="text-base font-semibold text-neutral-700"
              >
                Slug
              </Label>

              <Input
                id="outfit-slug"
                name="slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="classic-weekend-look"
                required
                aria-invalid={!!errors.slug}
                className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                  errors.slug
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }`}
              />

              <p className="text-sm text-neutral-500">
                Use lowercase letters, numbers,
                and hyphens only.
              </p>

              <FormError message={errors.slug} />
            </div>

            {/* =================================================
                COLLECTION
            ================================================= */}

            <div className="space-y-3">
              <Label
                htmlFor="outfit-collection"
                className="text-base font-semibold text-neutral-700"
              >
                Collection
              </Label>

              <div className="relative">
                <select
                  id="outfit-collection"
                  name="collectionId"
                  value={collectionId}
                  onChange={(event) =>
                    setCollectionId(
                      event.target.value
                    )
                  }
                  required
                  aria-invalid={
                    !!errors.collectionId
                  }
                  className={`h-[50px] w-full appearance-none rounded-none border-0 bg-neutral-200 px-8 pr-14 text-xl text-neutral-700 outline-none focus:ring-1 ${
                    errors.collectionId
                      ? "ring-1 ring-red-500"
                      : "focus:ring-neutral-400"
                  }`}
                >
                  <option value="" disabled>
                    Select a collection
                  </option>

                  {collections.map(
                    (collection) => (
                      <option
                        key={collection.id}
                        value={collection.id}
                      >
                        {collection.name}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  className="pointer-events-none absolute right-6 top-1/2 size-5 -translate-y-1/2 text-neutral-500"
                  strokeWidth={1.8}
                />
              </div>

              <FormError
                message={
                  errors.collectionId
                }
              />
            </div>

            {/* Short Description */}
            <div className="space-y-3">
              <Label
                htmlFor="short-description"
                className="text-base font-semibold text-neutral-700"
              >
                Short Description
              </Label>

              <Textarea
                id="short-description"
                name="shortDescription"
                value={shortDescription}
                onChange={(event) =>
                  setShortDescription(
                    event.target.value
                  )
                }
                placeholder="A sophisticated everyday outfit..."
                aria-invalid={
                  !!errors.shortDescription
                }
                className={`min-h-[100px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                  errors.shortDescription
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }`}
              />

              <FormError
                message={
                  errors.shortDescription
                }
              />
            </div>

            {/* Long Description */}
            <div className="space-y-3">
              <Label
                htmlFor="long-description"
                className="text-base font-semibold text-neutral-700"
              >
                Long Description
              </Label>

              <Textarea
                id="long-description"
                name="longDescription"
                value={longDescription}
                onChange={(event) =>
                  setLongDescription(
                    event.target.value
                  )
                }
                placeholder="Describe the outfit in detail..."
                aria-invalid={
                  !!errors.longDescription
                }
                className={`min-h-[220px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                  errors.longDescription
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }`}
              />

              <FormError
                message={
                  errors.longDescription
                }
              />
            </div>

          </div>
        </section>

        {/* ====================================================
            IMAGES
        ==================================================== */}

        <section className="rounded-lg bg-primary-foreground p-4 2xl:col-span-2">
          <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
            Images
          </h2>

          {/* Featured Image */}
          <div className="space-y-3">
            <Label
              htmlFor="featured-image"
              className="text-base font-semibold text-neutral-700"
            >
              Featured Image
            </Label>

            <div
              className={`relative flex min-h-[260px] items-center justify-center overflow-hidden bg-neutral-200 ${
                errors.featuredImage
                  ? "ring-1 ring-red-500"
                  : ""
              }`}
            >
              {featuredImagePreview ? (
                <>
                  <img
                    src={featuredImagePreview}
                    alt="Outfit featured image"
                    className="h-[260px] w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={
                      removeFeaturedImage
                    }
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm hover:bg-neutral-100"
                    aria-label="Remove featured image"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <label
                    htmlFor="featured-image"
                    className="absolute bottom-3 left-3 cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-100"
                  >
                    Replace Image
                  </label>
                </>
              ) : (
                <label
                  htmlFor="featured-image"
                  className="flex min-h-[260px] w-full cursor-pointer flex-col items-center justify-center gap-3 text-neutral-500 hover:bg-neutral-300"
                >
                  <ImagePlus className="h-8 w-8" />

                  <span className="text-sm font-medium">
                    Upload featured image
                  </span>

                  <span className="text-xs text-neutral-400">
                    PNG, JPG or WEBP
                  </span>
                </label>
              )}

              <input
                id="featured-image"
                name="featuredImage"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={
                  handleFeaturedImageChange
                }
                className="sr-only"
              />
            </div>

            <FormError
              message={errors.featuredImage}
            />
          </div>

          {/* Gallery */}
          <div className="mt-8 space-y-3">
            <Label
              htmlFor="outfit-images"
              className="text-base font-semibold text-neutral-700"
            >
              Outfit Images
            </Label>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden bg-neutral-200"
                >
                  <img
                    src={image.url}
                    alt={
                      image.alt ||
                      "Outfit image"
                    }
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeGalleryImage(
                        image.id
                      )
                    }
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm hover:bg-neutral-100"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <label
                htmlFor="outfit-images"
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
              >
                <ImagePlus className="h-7 w-7" />

                <span className="text-sm font-medium">
                  Add Images
                </span>
              </label>
            </div>

            <input
              id="outfit-images"
              name="images"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={
                handleGalleryImagesChange
              }
              className="sr-only"
            />

            <FormError
              message={errors.images}
            />
          </div>
        </section>

        {/* ====================================================
            TAGS
        ==================================================== */}

        <section className="rounded-lg bg-primary-foreground p-4">
          <h2 className="mb-8 text-2xl font-medium tracking-tight text-neutral-950">
            Tags
          </h2>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-neutral-700">
              Outfit Tags
            </Label>

            <button
              type="button"
              onClick={() => setIsTagPickerOpen(true)}
              disabled={isSubmitting || isLoadingTags}
              className="flex min-h-[50px] w-full items-center justify-between gap-4 rounded-none bg-neutral-200 px-8 text-left text-lg text-neutral-700 transition-colors hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {isLoadingTags
                  ? "Loading tags..."
                  : selectedTagIds.length > 0
                    ? `${selectedTagIds.length} tag${selectedTagIds.length === 1 ? "" : "s"} selected`
                    : "Select outfit tags"}
              </span>
              <Plus className="size-5 shrink-0 text-green-500" />
            </button>

            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedTagIds.map((tagId) => {
                  const tag = tags.find((item) => item.id === tagId);
                  if (!tag) return null;

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setSelectedTagIds((current) =>
                          current.filter((id) => id !== tag.id)
                        )
                      }
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-700 transition-colors hover:border-red-300 hover:text-red-500"
                    >
                      {tag.name}
                      <X className="size-3.5" />
                    </button>
                  );
                })}
              </div>
            )}

            <FormError message={errors.tags} />
          </div>
        </section>

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        <section className="rounded-lg bg-primary-foreground p-4 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
          <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
            Select Products
          </h2>

          <div className="space-y-5">

            <h3 className="text-2xl font-medium tracking-tight text-neutral-950">
              Products
            </h3>

            {/* Add Products */}
            <button
              type="button"
              onClick={openProductDialog}
              className="flex h-[86px] w-full items-center justify-between rounded-none bg-neutral-200 px-8 text-left transition-colors hover:bg-neutral-300"
            >
              <span className="text-xl text-neutral-900">
                Add Products
              </span>

              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-green-400 text-green-500">
                <Plus
                  className="h-6 w-6"
                  strokeWidth={2}
                />
              </span>
            </button>

            {/* Selected Count */}
            {selectedProducts.length > 0 && (
              <div className="flex justify-end">
                <span className="text-lg text-neutral-500">
                  {selectedProducts.length}{" "}
                  selected
                </span>
              </div>
            )}

            {/* Selected Products */}
            <div className="space-y-2">
              {selectedProductItems.map(
                (product) => (
                  <div
                    key={product.id}
                    className="flex min-h-[110px] items-center gap-5 rounded-none bg-neutral-200 px-5"
                  >
                    {/* Image */}
                    <div className="h-[78px] w-[78px] shrink-0 overflow-hidden bg-neutral-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Name */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-medium text-neutral-900">
                        {product.name}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() =>
                        removeProduct(
                          product.id
                        )
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center text-red-500 transition-colors hover:text-red-600"
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2
                        className="h-7 w-7"
                        strokeWidth={2}
                      />
                    </button>
                  </div>
                )
              )}

              {selectedProducts.length ===
                0 && (
                <div className="py-8 text-center text-sm text-neutral-500">
                  No products selected.
                </div>
              )}
            </div>

            <FormError
              message={errors.productIDs}
            />
          </div>
        </section>

        {/* ====================================================
            STATUS
        ==================================================== */}

        <section className="rounded-lg bg-primary-foreground p-4 2xl:col-span-2">
          <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
            Status
          </h2>

          <div className="flex items-center justify-between bg-neutral-200 px-6 py-5">
            <div>
              <p className="text-base font-semibold text-neutral-700">
                Active
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Make this outfit visible on
                your storefront.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() =>
                setIsActive(
                  (current) => !current
                )
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isActive
                  ? "bg-green-600"
                  : "bg-neutral-400"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  isActive
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </section>

        {/* ====================================================
            SUBMIT
        ==================================================== */}

        <div className="flex items-center gap-4 pt-2 lg:col-span-2 xl:col-span-3 2xl:col-span-4">
          {submitError && (
            <p className="flex-1 text-sm font-medium text-red-600">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[50px] rounded-none bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Adding Outfit..."
              : "Add Outfit"}
          </button>
        </div>
      </main>

      {/* ======================================================
          SELECT OUTFIT TAGS DIALOG
      ====================================================== */}

      <Dialog
        open={isTagPickerOpen}
        onOpenChange={setIsTagPickerOpen}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-xl border-0 bg-neutral-100 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium tracking-tight text-neutral-950">
              Select Outfit Tags
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-2">
            {tags.length > 0 ? (
              tags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setSelectedTagIds((current) =>
                        selected
                          ? current.filter((id) => id !== tag.id)
                          : [...current, tag.id]
                      )
                    }
                    className={`flex min-h-12 w-full items-center justify-between border px-4 text-left transition-colors ${
                      selected
                        ? "border-green-400 bg-green-50 text-green-700"
                        : "border-neutral-200 bg-neutral-100 text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    <span>{tag.name}</span>
                    {selected && (
                      <Check className="size-5 text-green-600" />
                    )}
                  </button>
                );
              })
            ) : (
              <p className="py-8 text-center text-sm text-neutral-500">
                No tags available. Create tags first.
              </p>
            )}

            <div className="flex justify-end border-t border-neutral-200 pt-6">
              <button
                type="button"
                onClick={() => setIsTagPickerOpen(false)}
                className="h-10 rounded-sm bg-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
              >
                Done
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ======================================================
          SELECT PRODUCTS DIALOG
      ====================================================== */}

      <Dialog
        open={isProductDialogOpen}
        onOpenChange={
          setIsProductDialogOpen
        }
      >
        <DialogContent className="w-[calc(100%-32px)] min-w-0 max-w-[800px] overflow-hidden rounded-xl border-0 bg-neutral-100 p-6 sm:p-8">
          <DialogHeader className="min-w-0">
            <DialogTitle className="truncate text-2xl font-medium tracking-tight text-neutral-950">
              Select Products
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 min-w-0 space-y-5">

            {/* Search */}
            <Input
              value={productSearch}
              onChange={
                handleProductSearch
              }
              placeholder="Search products..."
              className="h-[58px] w-full min-w-0 rounded-none border-0 bg-neutral-200 px-6 text-lg text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-400"
            />

            {/* Products */}
            <div className="max-h-[420px] min-w-0 space-y-2 overflow-x-hidden overflow-y-auto">
              {paginatedProducts.map(
                (product) => {
                  const isSelected =
                    selectedProducts.includes(
                      product.id
                    );

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() =>
                        toggleProduct(
                          product.id
                        )
                      }
                      className={`flex min-w-0 w-full items-center gap-3 rounded-none px-3 py-3 text-left transition-colors sm:gap-5 sm:px-5 ${
                        isSelected
                          ? "bg-neutral-300"
                          : "bg-neutral-200 hover:bg-neutral-300"
                      }`}
                    >
                      {/* Image */}
                      <div className="h-14 w-14 shrink-0 overflow-hidden bg-neutral-100 sm:h-[68px] sm:w-[68px]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Product Name */}
                      <span className="min-w-0 flex-1 truncate text-base font-medium text-neutral-900 sm:text-lg">
                        {product.name}
                      </span>

                      {/* Checkbox */}
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center border sm:h-9 sm:w-9 ${
                          isSelected
                            ? "border-green-500 bg-green-500"
                            : "border-neutral-400 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="text-sm text-white sm:text-base">
                            ✓
                          </span>
                        )}
                      </span>
                    </button>
                  );
                }
              )}

              {/* Empty State */}
              {paginatedProducts.length ===
                0 && (
                <div className="py-12 text-center text-sm text-neutral-500">
                  No products found.
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredProducts.length >
              0 && (
              <div className="flex min-w-0 items-center justify-between border-t border-neutral-200 pt-4">
                <span className="text-sm text-neutral-500">
                  Page {productPage} of{" "}
                  {totalProductPages}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      productPage === 1
                    }
                    onClick={() =>
                      setProductPage(
                        (page) =>
                          Math.max(
                            1,
                            page - 1
                          )
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    disabled={
                      productPage ===
                      totalProductPages
                    }
                    onClick={() =>
                      setProductPage(
                        (page) =>
                          Math.min(
                            totalProductPages,
                            page + 1
                          )
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Done */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() =>
                  setIsProductDialogOpen(false)
                }
                className="h-[48px] bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700"
              >
                Done
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}