"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type StyleImage = {
  id: string;
  url: string;
  alt?: string;
};

export type OutfitItem = {
  id: string;
  name: string;
  slug: string;
  collectionId: string;

  longDescription: string;
  shortDescription: string;

  featuredImage: string;
  images: StyleImage[];

  productIDs: string[];

  isActive: boolean;
};

type Collection = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
};

interface EditOutfitProps {
  outfit: OutfitItem;
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
  };
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

export function EditOutfit({
  outfit,
  collections,
  products,
  errors = {},
}: EditOutfitProps) {
  const [name, setName] = useState(outfit.name);
  const [slug, setSlug] = useState(outfit.slug);
  const [collectionId, setCollectionId] = useState(
    outfit.collectionId
  );

  const [shortDescription, setShortDescription] =
    useState(outfit.shortDescription);

  const [longDescription, setLongDescription] =
    useState(outfit.longDescription);

  const [featuredImage, setFeaturedImage] = useState(
    outfit.featuredImage
  );

  const [galleryImages, setGalleryImages] = useState<
    StyleImage[]
  >(outfit.images || []);

  const [selectedProducts, setSelectedProducts] =
    useState<string[]>(outfit.productIDs || []);

  const [isActive, setIsActive] = useState(
    outfit.isActive
  );

  /* Product dialog */
  const [isProductDialogOpen, setIsProductDialogOpen] =
    useState(false);

  const [productSearch, setProductSearch] = useState("");

  const [productPage, setProductPage] = useState(1);

  const PRODUCTS_PER_PAGE = 5;

  /* -------------------------------------------------- */
  /* Products */
  /* -------------------------------------------------- */

  const selectedProductItems = products.filter((product) =>
    selectedProducts.includes(product.id)
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name
        .toLowerCase()
        .includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  const totalProductPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / PRODUCTS_PER_PAGE
    )
  );

  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * PRODUCTS_PER_PAGE,
    productPage * PRODUCTS_PER_PAGE
  );

  const toggleProduct = (productId: string) => {
    setSelectedProducts((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((current) =>
      current.filter((id) => id !== productId)
    );
  };

  /* -------------------------------------------------- */
  /* Images */
  /* -------------------------------------------------- */

  const handleFeaturedImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setFeaturedImage(imageUrl);
  };

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

    setGalleryImages((current) => [
      ...current,
      ...newImages,
    ]);
  };

  const removeGalleryImage = (id: string) => {
    setGalleryImages((current) =>
      current.filter((image) => image.id !== id)
    );
  };

  /* -------------------------------------------------- */
  /* Product dialog */
  /* -------------------------------------------------- */

  const openProductDialog = () => {
    setProductSearch("");
    setProductPage(1);
    setIsProductDialogOpen(true);
  };

  const handleProductSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductSearch(event.target.value);
    setProductPage(1);
  };

  /* -------------------------------------------------- */
  /* Submit */
  /* -------------------------------------------------- */

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const updatedOutfit: OutfitItem = {
      id: outfit.id,
      name: name.trim(),
      slug: slug.trim(),
      collectionId,

      shortDescription:
        shortDescription.trim(),

      longDescription:
        longDescription.trim(),

      featuredImage,

      images: galleryImages,

      productIDs: selectedProducts,

      isActive,
    };

    console.log("Updated outfit:", updatedOutfit);

    // Submit updatedOutfit to your API/server action here.
  };

  return (
    <form className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
        onSubmit={handleSubmit}
      >
      <section className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        {/* Page heading */}
        <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
          Basic Information
        </h2>
          {/* ================================================== */}
          {/* BASIC INFORMATION */}
          {/* ================================================== */}

          <div className="space-y-8">
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
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Classic Weekend Look"
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
                onChange={(event) =>
                  setSlug(event.target.value)
                }
                placeholder="classic-weekend-look"
                aria-invalid={!!errors.slug}
                className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                  errors.slug
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }`}
              />

              <FormError message={errors.slug} />
            </div>

            {/* Collection */}
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
                    setCollectionId(event.target.value)
                  }
                  className={`h-[50px] w-full appearance-none rounded-none border-0 bg-neutral-200 px-8 pr-12 text-xl text-neutral-700 outline-none focus:ring-1 ${
                    errors.collectionId
                      ? "ring-red-500"
                      : "focus:ring-neutral-400"
                  }`}
                >
                  <option value="">
                    Select a collection
                  </option>

                  {collections.map((collection) => (
                    <option
                      key={collection.id}
                      value={collection.id}
                    >
                      {collection.name}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              </div>

              <FormError
                message={errors.collectionId}
              />
            </div>
          </div>

          {/* ================================================== */}
          {/* DESCRIPTIONS */}
          {/* ================================================== */}

          <div className="space-y-8">
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
                message={errors.shortDescription}
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
                message={errors.longDescription}
              />
            </div>
          </div>


        {/* ================================================== */}
        {/* SELECT PRODUCTS DIALOG */}
        {/* ================================================== */}

        <Dialog
          open={isProductDialogOpen}
          onOpenChange={setIsProductDialogOpen}
        >
          <DialogContent className="w-[calc(100%-32px)] max-w-[800px] sm:max-w-[800px] min-w-0 overflow-hidden rounded-xl border-0 bg-neutral-100 p-6 sm:p-8">
            <DialogHeader className="min-w-0">
              <DialogTitle className="text-2xl font-medium tracking-tight text-neutral-950">
                Select Products
              </DialogTitle>
            </DialogHeader>

            <div className="mt-3 min-w-0 space-y-5">
              {/* Search */}
              <Input
                value={productSearch}
                onChange={handleProductSearch}
                placeholder="Search products..."
                className="h-[58px] w-full min-w-0 rounded-none border-0 bg-neutral-200 px-6 text-lg text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-400"
              />

              {/* Product List */}
              <div className="max-h-[420px] min-w-0 space-y-2 overflow-x-hidden overflow-y-auto">
                {paginatedProducts.map((product) => {
                  const isSelected =
                    selectedProducts.includes(product.id);

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() =>
                        toggleProduct(product.id)
                      }
                      className={`flex min-w-0 w-full items-center gap-3 rounded-none px-3 py-3 text-left transition-colors sm:gap-5 sm:px-5 ${
                        isSelected
                          ? "bg-neutral-300"
                          : "bg-neutral-200 hover:bg-neutral-300"
                      }`}
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden bg-neutral-100 sm:h-[68px] sm:w-[68px]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <span className="min-w-0 flex-1 truncate text-base font-medium text-neutral-900 sm:text-lg">
                        {product.name}
                      </span>

                      <span className="shrink-0 text-sm font-medium text-green-600 sm:text-lg">
                        ₦{product.price.toLocaleString()}
                      </span>

                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center border sm:h-9 sm:w-9 ${
                          isSelected
                            ? "border-green-500 bg-green-500"
                            : "border-neutral-400 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="text-sm text-white">
                            ✓
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}

                {paginatedProducts.length === 0 && (
                  <div className="py-12 text-center text-sm text-neutral-500">
                    No products found.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
                  <span className="text-sm text-neutral-500">
                    Page {productPage} of{" "}
                    {totalProductPages}
                  </span>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={productPage === 1}
                      onClick={() =>
                        setProductPage((page) =>
                          Math.max(1, page - 1)
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
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
                        setProductPage((page) =>
                          Math.min(
                            totalProductPages,
                            page + 1
                          )
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="h-[48px] bg-green-600 px-8 text-base font-semibold text-white hover:bg-green-700"
                >
                  Done
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
      <section className="bg-primary-foreground p-4 rounded-lg 2xl:col-span-2">
          {/* ================================================== */}
          {/* FEATURED IMAGE */}
          {/* ================================================== */}
            <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
             Images
            </h2>
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
              {featuredImage ? (
                <>
                  <img
                    src={featuredImage}
                    alt={name}
                    className="h-[260px] w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setFeaturedImage("")
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
                onChange={handleFeaturedImageChange}
                className="sr-only"
              />
            </div>

            <FormError
              message={errors.featuredImage}
            />
          </div>

          {/* ================================================== */}
          {/* OUTFIT IMAGES */}
          {/* ================================================== */}

          <div className="space-y-3">
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
                    alt={image.alt || name}
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeGalleryImage(image.id)
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
              onChange={handleGalleryImagesChange}
              className="sr-only"
            />

            <FormError message={errors.images} />
          </div>
      </section>
      <section className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
            Select Products
        </h2>


        
          {/* ================================================== */}
          {/* PRODUCTS */}
          {/* ================================================== */}

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
                  {selectedProducts.length} selected
                </span>
              </div>
            )}

            {/* Selected Products */}
            <div className="space-y-2">
              {selectedProductItems.map((product) => (
                <div
                  key={product.id}
                  className="flex min-h-[110px] items-center gap-5 rounded-none bg-neutral-200 px-5"
                >
                  <div className="h-[78px] w-[78px] shrink-0 overflow-hidden bg-neutral-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-medium text-neutral-900">
                      {product.name}
                    </p>
                  </div>

                  <span className="shrink-0 text-xl font-medium text-green-600">
                    ₦{product.price.toLocaleString()}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeProduct(product.id)
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center text-red-500 transition-colors hover:text-red-600"
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 className="h-7 w-7" />
                  </button>
                </div>
              ))}

              {selectedProducts.length === 0 && (
                <div className="py-8 text-center text-sm text-neutral-500">
                  No products selected.
                </div>
              )}
            </div>

            <FormError message={errors.productIDs} />
          </div>
      </section>
        <section className="bg-primary-foreground p-4 rounded-lg 2xl:col-span-2">
            {/* Heading */}
            <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
                Status
            </h2>


            {/* ================================================== */}
          {/* STATUS */}
          {/* ================================================== */}

          <div className="flex items-center justify-between bg-neutral-200 px-6 py-5">
            <div>
              <p className="text-base font-semibold text-neutral-700">
                Active
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Make this outfit visible on your storefront.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() =>
                setIsActive((current) => !current)
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isActive
                  ? "bg-green-600"
                  : "bg-neutral-400"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  isActive ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </section>

          {/* ================================================== */}
          {/* SAVE */}
          {/* ================================================== */}

          <div className="pt-2">
            <button
              type="submit"
              className="h-[50px] rounded-none bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
    </form>
  );
}