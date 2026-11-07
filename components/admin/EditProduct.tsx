"use client";

import * as React from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Brand = { id: string; name: string; slug: string };
type Tag = { id: string; name: string; slug: string };
type Category = { id: string; name: string; slug: string };

type Color = {
  id: string;
  name: string;
  label: string;
  hex: string;
};

type Size = {
  id: string;
  name: string;
  label: string;
};

type ProductImage = {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
};

type ProductVariant = {
  id: string;
  sku: string;
  color: Color | null;
  size: Size | null;
  price: number | string;
  percentageDiscount: number | string;
  stock: number;
  isActive: boolean;
};

type Product = {
  id: string;
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  categoryId: string | null;
  brandId: string | null;
  isActive: boolean;
  tags: Tag[];
  images: ProductImage[];
  variants: ProductVariant[];
};

type VariantForm = {
  id?: string;
  sku: string;
  color: Color | null;
  size: Size | null;
  price: string;
  percentageDiscount: string;
  stock: string;
  isActive: boolean;
};

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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-lg bg-primary-foreground p-6 shadow-xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-medium tracking-tight text-neutral-950">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold text-neutral-700">
        {label}
      </Label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-[50px] w-full appearance-none rounded-none border-0 bg-neutral-200 px-8 pr-16 text-lg text-neutral-700 outline-none focus:ring-1 focus:ring-neutral-400"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-6 top-1/2 size-5 -translate-y-1/2 text-neutral-500" />
      </div>
    </div>
  );
}

export function EditProduct({ productId }: { productId: string }) {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [colors, setColors] = React.useState<Color[]>([]);
  const [sizes, setSizes] = React.useState<Size[]>([]);

  const [name, setName] = React.useState("");
  const [shortDescription, setShortDescription] = React.useState("");
  const [longDescription, setLongDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [brandId, setBrandId] = React.useState("");
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const [isActive, setIsActive] = React.useState(true);

  const [images, setImages] = React.useState<ProductImage[]>([]);
  const [newImageFiles, setNewImageFiles] = React.useState<File[]>([]);
  const [variants, setVariants] = React.useState<ProductVariant[]>([]);

  const imageInputRef = React.useRef<HTMLInputElement | null>(null);

  const [tagPickerOpen, setTagPickerOpen] = React.useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = React.useState(false);
  const [picker, setPicker] = React.useState<"size" | "color" | null>(null);

  const [variantForm, setVariantForm] = React.useState<VariantForm>({
    sku: "",
    color: null,
    size: null,
    price: "",
    percentageDiscount: "0",
    stock: "",
    isActive: true,
  });

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [productResponse, categoriesResponse, brandsResponse, tagsResponse, colorsResponse, sizesResponse] =
        await Promise.all([
          fetch(`/api/admin/products/${productId}`),
          fetch("/api/admin/categories"),
          fetch("/api/admin/brands"),
          fetch("/api/admin/tags"),
          fetch("/api/admin/colors"),
          fetch("/api/admin/sizes"),
        ]);

      const [productData, categoriesData, brandsData, tagsData, colorsData, sizesData] =
        await Promise.all([
          productResponse.json(),
          categoriesResponse.json(),
          brandsResponse.json(),
          tagsResponse.json(),
          colorsResponse.json(),
          sizesResponse.json(),
        ]);

      if (!productResponse.ok) {
        throw new Error(productData?.message || "Failed to load product.");
      }

      const loaded: Product = productData.product;

      setProduct(loaded);
      setName(loaded.name);
      setShortDescription(loaded.shortDescription ?? "");
      setLongDescription(loaded.longDescription ?? "");
      setCategoryId(loaded.categoryId ?? "");
      setBrandId(loaded.brandId ?? "");
      setSelectedTagIds(loaded.tags.map((tag) => tag.id));
      setIsActive(loaded.isActive);
      setImages(loaded.images);
      setVariants(
        loaded.variants.map((variant) => ({
          ...variant,
          price: Number(variant.price),
          percentageDiscount: Number(variant.percentageDiscount),
        }))
      );

      setCategories(categoriesData.categories ?? []);
      setBrands(
        Array.isArray(brandsData) ? brandsData : brandsData.brands ?? []
      );
      setTags(Array.isArray(tagsData) ? tagsData : tagsData.tags ?? []);
      setColors(colorsData.colors ?? []);
      setSizes(sizesData.sizes ?? []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load product.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  function openNewVariant() {
    setVariantForm({
      sku: "",
      color: null,
      size: null,
      price: "",
      percentageDiscount: "0",
      stock: "",
      isActive: true,
    });
    setVariantDialogOpen(true);
  }

  function openEditVariant(variant: ProductVariant) {
    setVariantForm({
      id: variant.id,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      price: String(variant.price),
      percentageDiscount: String(variant.percentageDiscount),
      stock: String(variant.stock),
      isActive: variant.isActive,
    });
    setVariantDialogOpen(true);
  }

  function saveVariant() {
    const sku = variantForm.sku.trim();
    const price = Number(variantForm.price);
    const discount = Number(variantForm.percentageDiscount);
    const stock = Number(variantForm.stock);

    if (!sku || !variantForm.color || !variantForm.size) {
      toast.error("SKU, color and size are required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid price.");
      return;
    }

    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      toast.error("Discount must be between 0 and 100%.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stock must be a non-negative integer.");
      return;
    }

    const duplicate = variants.some(
      (item) =>
        item.id !== variantForm.id &&
        item.sku.toLowerCase() === sku.toLowerCase()
    );

    if (duplicate) {
      toast.error("A variant with this SKU already exists.");
      return;
    }

    const nextVariant: ProductVariant = {
      id:
        variantForm.id ??
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString()),
      sku,
      color: variantForm.color,
      size: variantForm.size,
      price,
      percentageDiscount: discount,
      stock,
      isActive: variantForm.isActive,
    };

    setVariants((current) => {
      const exists = current.some((item) => item.id === nextVariant.id);
      return exists
        ? current.map((item) =>
            item.id === nextVariant.id ? nextVariant : item
          )
        : [...current, nextVariant];
    });

    setVariantDialogOpen(false);
    setPicker(null);
  }

  function removeVariant(id: string) {
    setVariants((current) => current.filter((item) => item.id !== id));
  }

  function removeImage(id: string) {
    setImages((current) =>
      current.filter((image) => image.id !== id)
    );
  }

  function handleNewImageFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    if (selectedFiles.length === 0) return;

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      toast.error(
        `${invalidFile.name} is not a valid image file.`
      );

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > 10 * 1024 * 1024
    );

    if (oversizedFile) {
      toast.error(
        `${oversizedFile.name} exceeds the 10MB limit.`
      );

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      return;
    }

    const total =
      images.length +
      newImageFiles.length +
      selectedFiles.length;

    if (total > 8) {
      toast.error(
        "You can have a maximum of 8 product images."
      );

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      return;
    }

    setNewImageFiles((current) => [
      ...current,
      ...selectedFiles,
    ]);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function removeNewImage(index: number) {
    setNewImageFiles((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  React.useEffect(() => {
    return () => {
      newImageFiles.forEach((file) => {
        // Object URLs are created only while rendering previews below.
        // This cleanup is intentionally kept here for future preview URL use.
        void file;
      });
    };
  }, [newImageFiles]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    if (!brandId) {
      toast.error("Please select a brand.");
      return;
    }

    if (variants.length === 0) {
      toast.error("At least one product variant is required.");
      return;
    }

    try {
      setSaving(true);

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
      formData.append("categoryId", categoryId);
      formData.append("brandId", brandId);
      formData.append(
        "isActive",
        String(isActive)
      );
      formData.append(
        "tags",
        JSON.stringify(selectedTagIds)
      );

      /*
       * Existing images are sent as JSON metadata.
       * New image files are appended separately.
       */
      formData.append(
        "existingImages",
        JSON.stringify(
          images.map((image, index) => ({
            id: image.id,
            alt: image.alt ?? null,
            sortOrder: index,
          }))
        )
      );

      for (const file of newImageFiles) {
        formData.append("images", file);
      }

      formData.append(
        "variants",
        JSON.stringify(
          variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku.trim(),
            colorId: variant.color?.id ?? null,
            sizeId: variant.size?.id ?? null,
            price: Number(variant.price),
            percentageDiscount: Number(
              variant.percentageDiscount
            ),
            stock: Number(variant.stock),
            isActive: variant.isActive,
          }))
        )
      );

      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update product.");
      }

      setProduct(data.product);
      setImages(data.product.images ?? []);
      setNewImageFiles([]);
      toast.success("Product updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-[450px] animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-[300px] animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-[400px] animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-[250px] animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-600">
          {error || "Product not found."}
        </p>
        <button
          type="button"
          onClick={loadData}
          className="mt-4 h-10 rounded-sm bg-neutral-900 px-5 text-sm font-medium text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {/* General information */}
          <section className="rounded-lg bg-primary-foreground p-4 lg:col-span-2">
            <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
              General Information
            </h2>

            <div className="space-y-8">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-neutral-700">
                  Product Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  className="h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-neutral-700">
                  Short Description
                </Label>
                <Textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  disabled={saving}
                  className="min-h-[50px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-lg text-neutral-700 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-neutral-700">
                  Long Description
                </Label>
                <Textarea
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  disabled={saving}
                  className="min-h-[150px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-lg text-neutral-700 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-lg bg-primary-foreground p-4 2xl:col-span-2">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-medium tracking-tight text-neutral-950">
                Product Images
              </h2>

              <span className="text-sm text-neutral-500">
                {images.length + newImageFiles.length} / 8 images
              </span>
            </div>

            {images.length > 0 || newImageFiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square overflow-hidden bg-neutral-100"
                  >
                    <img
                      src={image.url}
                      alt={
                        image.alt ??
                        `${name} image ${index + 1}`
                      }
                      className="h-full w-full object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute left-2 top-2 bg-green-600 px-2 py-1 text-xs font-medium text-white">
                        Featured
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(image.id)
                      }
                      disabled={saving}
                      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow hover:bg-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}

                {newImageFiles.map((file, index) => {
                  const previewUrl =
                    URL.createObjectURL(file);

                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className="group relative aspect-square overflow-hidden bg-neutral-100"
                    >
                      <img
                        src={previewUrl}
                        alt={`${name} new image ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                        onLoad={() =>
                          URL.revokeObjectURL(
                            previewUrl
                          )
                        }
                      />

                      <span className="absolute left-2 top-2 bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                        New
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(index)
                        }
                        disabled={saving}
                        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow hover:bg-white"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-sm text-red-500">
                At least one product image is required.
              </p>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleNewImageFiles}
              disabled={
                saving ||
                images.length +
                  newImageFiles.length >=
                  8
              }
            />

            <button
              type="button"
              onClick={() =>
                imageInputRef.current?.click()
              }
              disabled={
                saving ||
                images.length +
                  newImageFiles.length >=
                  8
              }
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-sm border border-neutral-400 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4 text-green-500" />
              Add Product Images
            </button>

            <p className="mt-4 text-sm text-neutral-500">
              JPG, PNG, WEBP and other image formats are
              supported. Maximum 8 images, 10MB per image.
              New images are uploaded to ImageKit when you
              save the product.
            </p>
          </section>
          {/* Variants */}
          <section className="rounded-lg bg-primary-foreground p-4 lg:col-span-2">
            <div className="mb-12 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-medium tracking-tight text-neutral-950">
                Colors &amp; Sizes
              </h2>
              <span className="text-sm text-neutral-500">
                {variants.length}{" "}
                {variants.length === 1 ? "variant" : "variants"}
              </span>
            </div>

            {variants.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  <div className="grid grid-cols-[1.2fr_1fr_0.7fr_1fr_0.8fr_0.8fr_0.7fr_0.8fr] items-center gap-4 px-2 pb-4 text-sm font-semibold text-neutral-600">
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
                        className="grid grid-cols-[1.2fr_1fr_0.7fr_1fr_0.8fr_0.8fr_0.7fr_0.8fr] items-center gap-4 px-2 py-2 text-sm text-neutral-600"
                      >
                        <span className="font-medium text-neutral-700">
                          {variant.sku}
                        </span>

                        <span className="flex items-center gap-2">
                          {variant.color && (
                            <span
                              className="size-4 rounded-full border border-neutral-300"
                              style={{ backgroundColor: variant.color.hex }}
                            />
                          )}
                          {variant.color?.label ?? "—"}
                        </span>

                        <span>{variant.size?.label ?? "—"}</span>

                        <span>
                          ₦{Number(variant.price).toLocaleString("en-NG")}
                        </span>

                        <span>{Number(variant.percentageDiscount)}%</span>
                        <span>{variant.stock}</span>

                        <span>
                          {variant.isActive ? "Visible" : "Hidden"}
                        </span>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => openEditVariant(variant)}
                            className="text-xs text-green-600 hover:text-green-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeVariant(variant.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-4 text-sm text-neutral-500">
                No variants have been added.
              </p>
            )}

            <button
              type="button"
              onClick={openNewVariant}
              disabled={saving}
              className="mt-8 inline-flex h-9 items-center gap-2 rounded-sm border border-neutral-400 px-3 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Add Product Variant
              <Plus className="size-4 text-green-400" />
            </button>
          </section>

          {/* Category */}
          <section className="rounded-lg bg-primary-foreground p-4">
            <h2 className="mb-8 text-2xl font-medium tracking-tight text-neutral-950">
              Category
            </h2>

            <SelectField
              label="Product Category"
              value={categoryId}
              onChange={setCategoryId}
              disabled={saving}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>
          </section>

          {/* Brand */}
          <section className="rounded-lg bg-primary-foreground p-4">
            <h2 className="mb-8 text-2xl font-medium tracking-tight text-neutral-950">
              Brand
            </h2>

            <SelectField
              label="Product Brand"
              value={brandId}
              onChange={setBrandId}
              disabled={saving}
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </SelectField>
          </section>

          {/* Tags */}
          <section className="rounded-lg bg-primary-foreground p-4">
            <h2 className="mb-8 text-2xl font-medium tracking-tight text-neutral-950">
              Tags
            </h2>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-neutral-700">
                Product Tags
              </Label>

              <button
                type="button"
                onClick={() => setTagPickerOpen(true)}
                disabled={saving}
                className="flex min-h-[50px] w-full items-center justify-between bg-neutral-200 px-8 text-left text-lg text-neutral-700 hover:bg-neutral-300"
              >
                <span>
                  {selectedTagIds.length
                    ? `${selectedTagIds.length} tag${
                        selectedTagIds.length === 1 ? "" : "s"
                      } selected`
                    : "Select product tags"}
                </span>
                <Plus className="size-5 text-green-500" />
              </button>

              {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTagIds.map((id) => {
                    const tag = tags.find((item) => item.id === id);
                    if (!tag) return null;

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          setSelectedTagIds((current) =>
                            current.filter((tagId) => tagId !== id)
                          )
                        }
                        className="inline-flex items-center gap-2 border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-700 hover:border-red-300 hover:text-red-500"
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

          {/* Status */}
          <section className="rounded-lg bg-primary-foreground p-4">
            <h2 className="mb-8 text-2xl font-medium tracking-tight text-neutral-950">
              Visibility
            </h2>

            <div className="flex items-center justify-between gap-6">
              <div>
                <Label className="text-base font-semibold text-neutral-700">
                  Product Active
                </Label>
                <p className="mt-2 text-sm text-neutral-500">
                  Show or hide this product on your storefront.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive((value) => !value)}
                disabled={saving}
                className={`relative h-8 w-20 shrink-0 rounded-full p-1 ${
                  isActive ? "bg-green-400" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`block size-6 rounded-full bg-white shadow-sm transition-transform ${
                    isActive ? "translate-x-12" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>
        </div>

        <div className="mt-4 flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-[50px] rounded-none bg-green-600 px-8 text-base font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => window.history.back()}
            disabled={saving}
            className="h-[50px] rounded-none border border-neutral-300 px-8 text-base font-semibold text-neutral-600 hover:bg-neutral-100"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Tag picker */}
      <Modal
        open={tagPickerOpen}
        title="Select Product Tags"
        onClose={() => setTagPickerOpen(false)}
        maxWidth="max-w-md"
      >
        {tags.length ? (
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
                  className={`flex min-h-12 w-full items-center justify-between border px-4 text-left ${
                    selected
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-neutral-200 bg-neutral-100 text-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  <span>{tag.name}</span>
                  {selected && <Check className="size-5 text-green-600" />}
                </button>
              );
            })}

            <div className="flex justify-end border-t border-neutral-200 pt-6">
              <button
                type="button"
                onClick={() => setTagPickerOpen(false)}
                className="h-10 rounded-sm bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-neutral-500">
            No tags available.
          </p>
        )}
      </Modal>

      {/* Variant editor */}
      <Modal
        open={variantDialogOpen}
        title={variantForm.id ? "Edit Variant" : "Add New Variant"}
        onClose={() => {
          if (!saving) {
            setVariantDialogOpen(false);
            setPicker(null);
          }
        }}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-neutral-700">
              SKU
            </Label>
            <Input
              value={variantForm.sku}
              onChange={(e) =>
                setVariantForm((current) => ({
                  ...current,
                  sku: e.target.value,
                }))
              }
              className="h-[50px] rounded-none border-0 bg-neutral-200 px-6 text-lg shadow-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-neutral-700">
                Size
              </Label>

              <button
                type="button"
                onClick={() => setPicker("size")}
                className="flex min-h-[50px] w-full items-center gap-3 text-left text-lg text-neutral-500"
              >
                <span>{variantForm.size?.label ?? "Pick a size"}</span>
                <Plus className="size-5 text-green-400" />
              </button>

              {variantForm.size && (
                <div className="inline-flex border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-700">
                  {variantForm.size.label}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-neutral-700">
                Color
              </Label>

              <button
                type="button"
                onClick={() => setPicker("color")}
                className="flex min-h-[50px] w-full items-center gap-3 text-left text-lg text-neutral-500"
              >
                <span>{variantForm.color?.label ?? "Pick a color"}</span>
                <Plus className="size-5 text-green-400" />
              </button>

              {variantForm.color && (
                <div
                  className="size-9 border border-neutral-200"
                  style={{ backgroundColor: variantForm.color.hex }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-neutral-700">
                Price (₦)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={variantForm.price}
                onChange={(e) =>
                  setVariantForm((current) => ({
                    ...current,
                    price: e.target.value,
                  }))
                }
                className="h-[50px] rounded-none border-0 bg-neutral-200 px-6 shadow-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-neutral-700">
                Discount (%)
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={variantForm.percentageDiscount}
                onChange={(e) =>
                  setVariantForm((current) => ({
                    ...current,
                    percentageDiscount: e.target.value,
                  }))
                }
                className="h-[50px] rounded-none border-0 bg-neutral-200 px-6 shadow-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-neutral-700">
                Stock
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={variantForm.stock}
                onChange={(e) =>
                  setVariantForm((current) => ({
                    ...current,
                    stock: e.target.value,
                  }))
                }
                className="h-[50px] rounded-none border-0 bg-neutral-200 px-6 shadow-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold text-neutral-700">
                Active
              </Label>
              <p className="mt-2 text-sm text-neutral-500">
                Hide or show this variant.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={variantForm.isActive}
              onClick={() =>
                setVariantForm((current) => ({
                  ...current,
                  isActive: !current.isActive,
                }))
              }
              className={`relative h-8 w-20 rounded-full p-1 ${
                variantForm.isActive ? "bg-green-400" : "bg-neutral-300"
              }`}
            >
              <span
                className={`block size-6 rounded-full bg-white shadow-sm transition-transform ${
                  variantForm.isActive ? "translate-x-12" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6">
            <button
              type="button"
              onClick={() => setVariantDialogOpen(false)}
              className="h-10 rounded-sm border border-neutral-300 px-5 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveVariant}
              className="h-10 rounded-sm bg-green-500 px-5 text-sm font-semibold text-white hover:bg-green-600"
            >
              {variantForm.id ? "Save Variant" : "Add Variant"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Size/color picker */}
      <Modal
        open={picker !== null}
        title={picker === "size" ? "Select Size" : "Select Color"}
        onClose={() => setPicker(null)}
        maxWidth="max-w-md"
      >
        {picker === "size" ? (
          sizes.length ? (
            <div className="grid grid-cols-3 gap-3">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => {
                    setVariantForm((current) => ({
                      ...current,
                      size,
                    }));
                    setPicker(null);
                  }}
                  className={`flex h-14 items-center justify-center border text-sm font-medium ${
                    variantForm.size?.id === size.id
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
        ) : colors.length ? (
          <div className="grid grid-cols-2 gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => {
                  setVariantForm((current) => ({
                    ...current,
                    color,
                  }));
                  setPicker(null);
                }}
                className={`flex items-center gap-3 border p-3 text-left ${
                  variantForm.color?.id === color.id
                    ? "border-green-400 bg-green-50"
                    : "border-neutral-200 bg-neutral-100 hover:border-neutral-400"
                }`}
              >
                <span
                  className="size-8 shrink-0 rounded-full border border-neutral-300"
                  style={{ backgroundColor: color.hex }}
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
    </>
  );
}
