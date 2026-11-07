"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, ChevronDown, Plus, X } from "lucide-react";

import { ProductImageUpload } from "@/components/admin/ProductImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ProductBrand = {
  id: string;
  name: string;
  slug: string;
};

type ProductTag = {
  id: string;
  name: string;
  slug: string;
};

type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type ProductColor = {
  id: string;
  name: string;
  label: string;
  hex: string;
};

type ProductSize = {
  id: string;
  name: string;
  label: string;
};

type ProductVariant = {
  id: string;
  sku: string;
  color: ProductColor;
  size: ProductSize;
  price: number;
  percentageDiscount: number;
  stock: number;
  isActive: boolean;
};

type VariantForm = {
  sku: string;
  size: ProductSize | null;
  color: ProductColor | null;
  price: string;
  percentageDiscount: string;
  stock: string;
  isActive: boolean;
};

type FormErrors = {
  name?: string;
  shortDescription?: string;
  longDescription?: string;
  categoryId?: string;
  brandId?: string;
  tags?: string;
  images?: string;
  variants?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

/* -------------------------------------------------------------------------- */
/* Fetcher                                                                    */
/* -------------------------------------------------------------------------- */

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }

  return response.json();
}

/* -------------------------------------------------------------------------- */
/* Form Error                                                                 */
/* -------------------------------------------------------------------------- */

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal                                                                      */
/* -------------------------------------------------------------------------- */

function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-lg bg-primary-foreground p-6 shadow-xl`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-medium tracking-tight text-neutral-950">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close dialog"
          >
            <X className="size-5" strokeWidth={1.8} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function AddProduct() {
  /* ------------------------------------------------------------------------ */
  /* Product                                                                   */
  /* ------------------------------------------------------------------------ */

  const [name, setName] = React.useState("");
  const [shortDescription, setShortDescription] =
    React.useState("");
  const [longDescription, setLongDescription] =
    React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [brandId, setBrandId] = React.useState("");
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const [isTagPickerOpen, setIsTagPickerOpen] = React.useState(false);

  /* ------------------------------------------------------------------------ */
  /* API Data                                                                  */
  /* ------------------------------------------------------------------------ */

  const [categories, setCategories] = React.useState<ProductCategory[]>([]);

  const [brands, setBrands] = React.useState<ProductBrand[]>([]);

  const [tags, setTags] = React.useState<ProductTag[]>([]);

  const [colors, setColors] = React.useState<ProductColor[]>(
    []
  );

  const [sizes, setSizes] = React.useState<ProductSize[]>([]);

  const [isLoadingOptions, setIsLoadingOptions] =
    React.useState(true);

  const [optionsError, setOptionsError] =
    React.useState("");

  /* ------------------------------------------------------------------------ */
  /* Images                                                                    */
  /* ------------------------------------------------------------------------ */

  const [imageFiles, setImageFiles] = React.useState<File[]>(
    []
  );

  /* ------------------------------------------------------------------------ */
  /* Variants                                                                  */
  /* ------------------------------------------------------------------------ */

  const [variants, setVariants] = React.useState<
    ProductVariant[]
  >([]);

  const [isVariantDialogOpen, setIsVariantDialogOpen] =
    React.useState(false);

  const [picker, setPicker] = React.useState<
    "size" | "color" | null
  >(null);

  const [variantForm, setVariantForm] =
    React.useState<VariantForm>({
      sku: "",
      size: null,
      color: null,
      price: "",
      percentageDiscount: "0",
      stock: "",
      isActive: true,
    });

  /* ------------------------------------------------------------------------ */
  /* Submission                                                               */
  /* ------------------------------------------------------------------------ */

  const [isSubmitting, setIsSubmitting] =
    React.useState(false);

  const [errors, setErrors] = React.useState<FormErrors>({});

  /* ------------------------------------------------------------------------ */
  /* Load Categories, Colors & Sizes                                         */
  /* ------------------------------------------------------------------------ */

  React.useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        setIsLoadingOptions(true);
        setOptionsError("");

        const [
          categoriesResponse,
          brandsResponse,
          tagsResponse,
          colorsResponse,
          sizesResponse,
        ] = await Promise.all([
          fetchJson<{
            success: boolean;
            categories: ProductCategory[];
          }>("/api/admin/categories"),

          fetchJson<ProductBrand[] | { success: boolean; brands: ProductBrand[] }>(
            "/api/admin/brands"
          ),

          fetchJson<ProductTag[] | { success: boolean; tags: ProductTag[] }>(
            "/api/admin/tags"
          ),

          fetchJson<{
            success: boolean;
            colors: ProductColor[];
          }>("/api/admin/colors"),

          fetchJson<{
            success: boolean;
            sizes: ProductSize[];
          }>("/api/admin/sizes"),
        ]);

        if (cancelled) return;

        setCategories(categoriesResponse.categories ?? []);

        setBrands(
          Array.isArray(brandsResponse)
            ? brandsResponse
            : brandsResponse.brands ?? []
        );

        setTags(
          Array.isArray(tagsResponse)
            ? tagsResponse
            : tagsResponse.tags ?? []
        );

        setColors(colorsResponse.colors ?? []);

        setSizes(sizesResponse.sizes ?? []);
      } catch (error) {
        console.error("Failed to load product options:", error);

        if (!cancelled) {
          setOptionsError(
            "Failed to load categories, brands, tags, colors or sizes."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Variant Helpers                                                          */
  /* ------------------------------------------------------------------------ */

  function resetVariantForm() {
    setVariantForm({
      sku: "",
      size: null,
      color: null,
      price: "",
      percentageDiscount: "0",
      stock: "",
      isActive: true,
    });
  }

  function openVariantDialog() {
    resetVariantForm();
    setIsVariantDialogOpen(true);
  }

  function closeVariantDialog() {
    if (isSubmitting) return;

    setIsVariantDialogOpen(false);
    setPicker(null);
  }

  function selectColor(color: ProductColor) {
    setVariantForm((current) => ({
      ...current,
      color,
    }));

    setPicker(null);
  }

  function selectSize(size: ProductSize) {
    setVariantForm((current) => ({
      ...current,
      size,
    }));

    setPicker(null);
  }

  /* ------------------------------------------------------------------------ */
  /* Add Variant                                                               */
  /* ------------------------------------------------------------------------ */

  function addVariant() {
    const sku = variantForm.sku.trim();
    const price = Number(variantForm.price);
    const discount = Number(
      variantForm.percentageDiscount
    );
    const stock = Number(variantForm.stock);

    if (!sku) {
      toast.error("SKU is required.");
      return;
    }

    if (!variantForm.color) {
      toast.error("Please select a color.");
      return;
    }

    if (!variantForm.size) {
      toast.error("Please select a size.");
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      toast.error("Please enter a valid price.");
      return;
    }

    if (
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > 100
    ) {
      toast.error(
        "Discount must be between 0 and 100%."
      );
      return;
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      toast.error(
        "Stock must be a non-negative integer."
      );
      return;
    }

    const duplicateSku = variants.some(
      (variant) =>
        variant.sku.toLowerCase() ===
        sku.toLowerCase()
    );

    if (duplicateSku) {
      toast.error(
        "A variant with this SKU already exists."
      );
      return;
    }

    const newVariant: ProductVariant = {
      id:
        typeof crypto !== "undefined" &&
        crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}`,
      sku,
      color: variantForm.color,
      size: variantForm.size,
      price,
      percentageDiscount: discount,
      stock,
      isActive: variantForm.isActive,
    };

    setVariants((current) => [
      ...current,
      newVariant,
    ]);

    closeVariantDialog();
  }

  /* ------------------------------------------------------------------------ */
  /* Remove Variant                                                           */
  /* ------------------------------------------------------------------------ */

  function removeVariant(id: string) {
    setVariants((current) =>
      current.filter(
        (variant) => variant.id !== id
      )
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Validate Product                                                         */
  /* ------------------------------------------------------------------------ */

  function validateForm() {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name =
        "Product name is required.";
    } else if (name.trim().length < 2) {
      newErrors.name =
        "Product name must be at least 2 characters.";
    }

    if (!categoryId) {
      newErrors.categoryId =
        "Please select a category.";
    }

    if (!brandId) {
      newErrors.brandId = "Please select a brand.";
    }

    if (imageFiles.length === 0) {
      newErrors.images =
        "Please upload at least one product image.";
    }

    if (variants.length === 0) {
      newErrors.variants =
        "Please add at least one product variant.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  /* ------------------------------------------------------------------------ */
  /* Submit Product                                                           */
  /* ------------------------------------------------------------------------ */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      toast.error(
        "Please complete the required fields."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("name", name.trim());

      formData.append(
        "shortDescription",
        shortDescription.trim()
      );

      formData.append(
        "longDescription",
        longDescription.trim()
      );

      formData.append(
        "categoryId",
        categoryId
      );

      formData.append("brandId", brandId);

      formData.append(
        "tags",
        JSON.stringify(selectedTagIds)
      );

      formData.append("isActive", "true");

      /* -------------------------------------------------------------------- */
      /* Variants                                                             */
      /* -------------------------------------------------------------------- */

      formData.append(
        "variants",
        JSON.stringify(
          variants.map((variant) => ({
            sku: variant.sku,
            colorId: variant.color.id,
            sizeId: variant.size.id,
            price: variant.price,
            percentageDiscount:
              variant.percentageDiscount,
            stock: variant.stock,
            isActive: variant.isActive,
          }))
        )
      );

      /* -------------------------------------------------------------------- */
      /* Images                                                               */
      /* -------------------------------------------------------------------- */

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          body: formData,
        }
      );

      const data: ApiResponse<unknown> =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to create product."
        );
      }

      toast.success(
        "Product created successfully."
      );

      /* -------------------------------------------------------------------- */
      /* Reset Form                                                           */
      /* -------------------------------------------------------------------- */

      setName("");
      setShortDescription("");
      setLongDescription("");
      setCategoryId("");
      setBrandId("");
      setSelectedTagIds([]);
      setImageFiles([]);
      setVariants([]);
      setErrors({});
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create product."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Loading Options                                                          */
  /* ------------------------------------------------------------------------ */

  if (isLoadingOptions) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded bg-neutral-200" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-[400px] animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-[400px] animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-[300px] animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-[200px] animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Options Error                                                            */
  /* ------------------------------------------------------------------------ */

  if (optionsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-600">
          {optionsError}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 h-10 rounded-sm bg-neutral-900 px-5 text-sm font-medium text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {/* ================================================================== */}
        {/* General Information                                                */}
        {/* ================================================================== */}

        <section className="rounded-lg bg-primary-foreground p-4 lg:col-span-2">
          <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
            General Information
          </h2>

          <div className="space-y-8">
            {/* Name */}
            <div className="space-y-3">
              <Label
                htmlFor="product-name"
                className="text-base font-semibold text-neutral-700"
              >
                Name Product
              </Label>

              <Input
                id="product-name"
                name="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);

                  setErrors((current) => ({
                    ...current,
                    name: undefined,
                  }));
                }}
                placeholder="Puffer Jacket With pocket detail"
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
                className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                  errors.name
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }`}
              />

              <FormError message={errors.name} />
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
                disabled={isSubmitting}
                className="min-h-[50px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-lg text-neutral-700 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
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
                disabled={isSubmitting}
                className="min-h-[150px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-lg text-neutral-700 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
              />
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* Images                                                              */}
        {/* ================================================================== */}

        <section className="rounded-lg bg-primary-foreground p-4 2xl:col-span-2">
          <ProductImageUpload
            files={imageFiles}
            onFilesChange={setImageFiles}
            error={errors.images}
            disabled={isSubmitting}
          />
        </section>

        {/* ================================================================== */}
        {/* Variants                                                            */}
        {/* ================================================================== */}

        <section className="rounded-lg bg-primary-foreground p-4 lg:col-span-2">
          <div className="mb-12 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-medium tracking-tight text-neutral-950">
              Colors &amp; Sizes
            </h2>

            <span className="text-sm text-neutral-500">
              {variants.length}{" "}
              {variants.length === 1
                ? "variant"
                : "variants"}
            </span>
          </div>

          {variants.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[850px]">
                <div className="grid grid-cols-[1.2fr_1fr_0.7fr_1fr_0.8fr_0.8fr_0.7fr_0.6fr] items-center gap-4 px-2 pb-4 text-sm font-semibold text-neutral-600">
                  <span>SKU</span>
                  <span>Color</span>
                  <span>Size</span>
                  <span>Price</span>
                  <span>Discount</span>
                  <span>Stock</span>
                  <span>Visibility</span>
                  <span />
                </div>

                <div className="space-y-1">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="grid grid-cols-[1.2fr_1fr_0.7fr_1fr_0.8fr_0.8fr_0.7fr_0.6fr] items-center gap-4 px-2 py-2 text-sm text-neutral-600"
                    >
                      <span className="font-medium text-neutral-700">
                        {variant.sku}
                      </span>

                      <span className="flex items-center gap-2">
                        <span
                          className="size-4 rounded-full border border-neutral-300"
                          style={{
                            backgroundColor:
                              variant.color.hex,
                          }}
                        />

                        {variant.color.label}
                      </span>

                      <span>
                        {variant.size.label}
                      </span>

                      <span>
                        ₦
                        {variant.price.toLocaleString(
                          "en-NG"
                        )}
                      </span>

                      <span>
                        {variant.percentageDiscount}%
                      </span>

                      <span>
                        {variant.stock}
                      </span>

                      <span>
                        {variant.isActive
                          ? "Visible"
                          : "Hidden"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeVariant(
                            variant.id
                          )
                        }
                        disabled={isSubmitting}
                        className="justify-self-start text-xs text-red-500 transition-colors hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-sm text-neutral-500">
              No product variants have been added yet.
            </div>
          )}

          <FormError message={errors.variants} />

          <button
            type="button"
            onClick={openVariantDialog}
            disabled={isSubmitting}
            className="mt-8 inline-flex h-9 items-center gap-2 rounded-sm border border-neutral-400 px-3 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Product Variant

            <Plus
              className="size-4 text-green-400"
              strokeWidth={2}
            />
          </button>
        </section>
        
        {/* ================================================================== */}
        {/* Category                                                            */}
        {/* ================================================================== */}

        <section className="rounded-lg bg-primary-foreground p-4 2xl:col-span-2">
          <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
            Category
          </h2>

          <div className="space-y-3">
            <Label
              htmlFor="product-category"
              className="text-base font-semibold text-neutral-700"
            >
              Product Category
            </Label>

            <div className="relative">
              <select
                id="product-category"
                name="categoryId"
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(
                    event.target.value
                  );

                  setErrors((current) => ({
                    ...current,
                    categoryId: undefined,
                  }));
                }}
                disabled={isSubmitting}
                aria-invalid={!!errors.categoryId}
                className={`h-[50px] w-full appearance-none rounded-none border-0 bg-neutral-200 px-8 pr-16 text-xl text-neutral-700 outline-none focus:ring-1 ${
                  errors.categoryId
                    ? "focus:ring-red-500"
                    : "focus:ring-neutral-400"
                }`}
              >
                <option value="">
                  Select Category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-6 top-1/2 size-5 -translate-y-1/2 text-neutral-500" />
            </div>

            <FormError
              message={errors.categoryId}
            />
          </div>
        </section>
        {/* ================================================================== */}
        {/* Brand & Tags                                                        */}
        {/* ================================================================== */}

        <section className="rounded-lg bg-primary-foreground p-4 2xl:col-span-2">
            <h2 className="mb-12  text-2xl font-medium tracking-tight text-neutral-950">
                Brand
            </h2>
            {/* Brand */}
            <div className="space-y-3">

              <Label
                htmlFor="product-brand"
                className="text-base font-semibold text-neutral-700"
              >
                Product Brand
              </Label>

              <div className="relative">
                <select
                  id="product-brand"
                  name="brandId"
                  value={brandId}
                  onChange={(event) => {
                    setBrandId(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      brandId: undefined,
                    }));
                  }}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.brandId}
                  className={`h-[50px] w-full appearance-none rounded-none border-0 bg-neutral-200 px-8 pr-16 text-xl text-neutral-700 outline-none focus:ring-1 ${
                    errors.brandId
                      ? "focus:ring-red-500"
                      : "focus:ring-neutral-400"
                  }`}
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-6 top-1/2 size-5 -translate-y-1/2 text-neutral-500" />
              </div>

              <FormError message={errors.brandId} />
            </div>
        </section>

        <section className="rounded-lg bg-primary-foreground p-4 2xl:col-span-2">
            <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
                Tags
            </h2>
            {/* Tags */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-neutral-500">
                  {selectedTagIds.length} selected
                </span>
              </div>

              <Label className="text-base font-semibold text-neutral-700">
                Product Tags
              </Label>

              <button
                type="button"
                onClick={() => setIsTagPickerOpen(true)}
                disabled={isSubmitting}
                className="flex min-h-[50px] w-full items-center justify-between gap-4 rounded-none bg-neutral-200 px-8 text-left text-lg text-neutral-700 transition-colors hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {selectedTagIds.length > 0
                    ? `${selectedTagIds.length} tag${selectedTagIds.length === 1 ? "" : "s"} selected`
                    : "Select product tags"}
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
            </div>
        </section>
      </div>

      {/* ==================================================================== */}
      {/* Variant Dialog                                                        */}
      {/* ==================================================================== */}

      <Modal
        open={isVariantDialogOpen}
        title="Add New Variant"
        onClose={closeVariantDialog}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-8">
          {/* SKU */}
          <div className="space-y-3">
            <Label
              htmlFor="variant-sku"
              className="text-base font-semibold text-neutral-700"
            >
              SKU
            </Label>

            <Input
              id="variant-sku"
              value={variantForm.sku}
              onChange={(event) =>
                setVariantForm((current) => ({
                  ...current,
                  sku: event.target.value,
                }))
              }
              placeholder="UGR146UTW"
              disabled={isSubmitting}
              className="h-[50px] rounded-none border-0 bg-neutral-200 px-6 text-lg text-neutral-700 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            />
          </div>

          {/* Size / Color */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Size */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-neutral-700">
                Size
              </Label>

              <button
                type="button"
                onClick={() => setPicker("size")}
                disabled={isSubmitting}
                className="flex min-h-[50px] w-full items-center gap-3 text-left text-lg text-neutral-500"
              >
                <span>
                  {variantForm.size
                    ? variantForm.size.label
                    : "Pick a size"}
                </span>

                <Plus className="size-5 text-green-400" />
              </button>

              {variantForm.size && (
                <div className="inline-flex min-w-14 items-center justify-center border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-700">
                  {variantForm.size.label}
                </div>
              )}
            </div>

            {/* Color */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-neutral-700">
                Color
              </Label>

              <button
                type="button"
                onClick={() => setPicker("color")}
                disabled={isSubmitting}
                className="flex min-h-[50px] w-full items-center gap-3 text-left text-lg text-neutral-500"
              >
                <span>
                  {variantForm.color
                    ? variantForm.color.label
                    : "Pick a color"}
                </span>

                <Plus className="size-5 text-green-400" />
              </button>

              {variantForm.color && (
                <div
                  className="size-9 border border-neutral-200"
                  style={{
                    backgroundColor:
                      variantForm.color.hex,
                  }}
                  title={variantForm.color.label}
                />
              )}
            </div>
          </div>

          {/* Price / Discount / Stock */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Price */}
            <div className="space-y-3">
              <Label
                htmlFor="variant-price"
                className="text-base font-semibold text-neutral-700"
              >
                Price (₦)
              </Label>

              <Input
                id="variant-price"
                type="number"
                min="0"
                step="0.01"
                value={variantForm.price}
                onChange={(event) =>
                  setVariantForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="60000"
                disabled={isSubmitting}
                className="h-[50px] rounded-none border-0 bg-neutral-200 px-6 text-lg text-neutral-700 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
              />
            </div>

            {/* Discount */}
            <div className="space-y-3">
              <Label
                htmlFor="variant-discount"
                className="text-base font-semibold text-neutral-700"
              >
                Discount (%)
              </Label>

              <div className="relative">
                <Input
                  id="variant-discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    variantForm.percentageDiscount
                  }
                  onChange={(event) =>
                    setVariantForm((current) => ({
                      ...current,
                      percentageDiscount:
                        event.target.value,
                    }))
                  }
                  placeholder="10"
                  disabled={isSubmitting}
                  className="h-[50px] rounded-none border-0 bg-neutral-200 px-6 pr-12 text-lg text-neutral-700 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                />

                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500">
                  %
                </span>
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-3">
              <Label
                htmlFor="variant-stock"
                className="text-base font-semibold text-neutral-700"
              >
                Stock
              </Label>

              <Input
                id="variant-stock"
                type="number"
                min="0"
                step="1"
                value={variantForm.stock}
                onChange={(event) =>
                  setVariantForm((current) => ({
                    ...current,
                    stock: event.target.value,
                  }))
                }
                placeholder="5"
                disabled={isSubmitting}
                className="h-[50px] rounded-none border-0 bg-neutral-200 px-6 text-lg text-neutral-700 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
              />
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center justify-between gap-6">
            <div>
              <Label className="text-base font-semibold text-neutral-700">
                Active
              </Label>

              <p className="mt-2 max-w-sm text-sm leading-5 text-neutral-500">
                Hide or make this variant visible
                on your storefront.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={
                variantForm.isActive
              }
              onClick={() =>
                setVariantForm((current) => ({
                  ...current,
                  isActive:
                    !current.isActive,
                }))
              }
              disabled={isSubmitting}
              className={`relative h-8 w-20 shrink-0 rounded-full p-1 transition-colors ${
                variantForm.isActive
                  ? "bg-green-400"
                  : "bg-neutral-300"
              }`}
            >
              <span
                className={`block size-6 rounded-full bg-white shadow-sm transition-transform ${
                  variantForm.isActive
                    ? "translate-x-12"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6">
            <button
              type="button"
              onClick={closeVariantDialog}
              disabled={isSubmitting}
              className="h-10 rounded-sm border border-neutral-300 px-5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={addVariant}
              disabled={
                isSubmitting ||
                !variantForm.sku.trim() ||
                !variantForm.size ||
                !variantForm.color ||
                !variantForm.price ||
                !variantForm.stock
              }
              className="h-10 rounded-sm bg-green-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Variant
            </button>
          </div>
        </div>
      </Modal>

      {/* ==================================================================== */}
      {/* Size / Color Picker                                                  */}
      {/* ==================================================================== */}

      <Modal
        open={picker !== null}
        title={
          picker === "size"
            ? "Select Size"
            : "Select Color"
        }
        onClose={() => setPicker(null)}
        maxWidth="max-w-md"
      >
        {picker === "size" ? (
          sizes.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() =>
                    selectSize(size)
                  }
                  className={`flex h-14 items-center justify-center border text-sm font-medium transition-colors ${
                    variantForm.size?.id ===
                    size.id
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-neutral-200 bg-neutral-100 text-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-neutral-500">
              No sizes available.
            </p>
          )
        ) : colors.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() =>
                  selectColor(color)
                }
                className={`flex items-center gap-3 border p-3 text-left transition-colors ${
                  variantForm.color?.id ===
                  color.id
                    ? "border-green-400 bg-green-50"
                    : "border-neutral-200 bg-neutral-100 hover:border-neutral-400"
                }`}
              >
                <span
                  className="size-8 shrink-0 rounded-full border border-neutral-300"
                  style={{
                    backgroundColor:
                      color.hex,
                  }}
                />

                <span className="text-sm text-neutral-700">
                  {color.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-neutral-500">
            No colors available.
          </p>
        )}
      </Modal>

      {/* ==================================================================== */}
      {/* Tag Picker                                                            */}
      {/* ==================================================================== */}

      <Modal
        open={isTagPickerOpen}
        title="Select Product Tags"
        onClose={() => setIsTagPickerOpen(false)}
        maxWidth="max-w-md"
      >
        {tags.length > 0 ? (
          <div className="space-y-2">
            {tags.map((tag) => {
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
                  <span>
                    {tag.name}
                  </span>
                  {selected && (
                    <Check className="size-5 text-green-600" />
                  )}
                </button>
              );
            })}

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
        ) : (
          <p className="py-8 text-center text-sm text-neutral-500">
            No tags available. Create tags first.
          </p>
        )}
      </Modal>

      {/* ==================================================================== */}
      {/* Submit                                                               */}
      {/* ==================================================================== */}

      <div className="mt-4 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-[50px] rounded-none bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Saving Product..."
            : "Add Product"}
        </button>
      </div>
    </form>
  );
}