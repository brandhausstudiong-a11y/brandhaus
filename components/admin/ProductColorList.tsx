"use client";

import * as React from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ProductColor = {
  id: string;
  name: string;
  label: string;
  hex: string;
  createdAt?: string;
  updatedAt?: string;
};

type ColorsResponse = {
  success: boolean;
  colors: ProductColor[];
};

const fetcher = async (url: string): Promise<ProductColor[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch product colors");
  }

  const data: ColorsResponse = await response.json();

  return data.colors ?? [];
};

function normalizeHex(value: string) {
  let hex = value.trim();

  if (!hex.startsWith("#")) {
    hex = `#${hex}`;
  }

  return hex.toUpperCase();
}

function isValidHex(value: string) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
}

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

function ProductColorListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid min-h-[62px] animate-pulse grid-cols-[40px_1fr_1fr_auto] items-center gap-4 rounded-md bg-neutral-200 px-5"
        >
          <div className="h-4 w-5 rounded bg-neutral-300" />

          <div className="h-4 w-32 rounded bg-neutral-300" />

          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-neutral-300" />
            <div className="h-4 w-20 rounded bg-neutral-300" />
          </div>

          <div className="flex items-center gap-7">
            <div className="h-4 w-10 rounded bg-neutral-300" />
            <div className="h-4 w-12 rounded bg-neutral-300" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProductColorList() {
  const {
    data: productColors = [],
    error,
    isLoading,
  } = useSWR<ProductColor[]>(
    "/api/admin/colors",
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  const [editingProductColor, setEditingProductColor] =
    React.useState<ProductColor | null>(null);

  const [colorName, setColorName] = React.useState("");
  const [colorLabel, setColorLabel] = React.useState("");
  const [hex, setHex] = React.useState("#000000");

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Edit                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleEdit = (color: ProductColor) => {
    setEditingProductColor(color);
    setColorName(color.name);
    setColorLabel(color.label);
    setHex(color.hex);
  };

  /* ------------------------------------------------------------------------ */
  /* Close Dialog                                                             */
  /* ------------------------------------------------------------------------ */

  const closeDialog = () => {
    if (isUpdating) return;

    setEditingProductColor(null);
    setColorName("");
    setColorLabel("");
    setHex("#000000");
  };

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleUpdate = async () => {
    if (!editingProductColor) return;

    const name = colorName.trim();
    const label = colorLabel.trim();
    const normalizedHex = normalizeHex(hex);

    if (!name) {
      toast.error("Color name is required.");
      return;
    }

    if (!label) {
      toast.error("Color label is required.");
      return;
    }

    if (!isValidHex(normalizedHex)) {
      toast.error("Please enter a valid HEX color.");
      return;
    }

    try {
      setIsUpdating(true);

      const response = await fetch(
        `/api/admin/colors/${editingProductColor.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            label,
            hex: normalizedHex,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to update product color."
        );
      }

      toast.success("Product color updated successfully.");

      await mutate("/api/admin/colors");

      setEditingProductColor(null);
      setColorName("");
      setColorLabel("");
      setHex("#000000");
    } catch (error) {
      console.error("Update product color error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update product color."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product color?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(
        `/api/admin/colors/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete product color."
        );
      }

      toast.success("Product color deleted successfully.");

      await mutate("/api/admin/colors");
    } catch (error) {
      console.error("Delete product color error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete product color."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Error State                                                              */
  /* ------------------------------------------------------------------------ */

  if (error) {
    return (
      <section className="w-full">
        <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950 capitalize">
          Color List
        </h2>

        <div className="rounded-md border border-red-200 bg-red-50 px-5 py-10 text-center">
          <p className="text-sm text-red-600">
            Failed to load product colors.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => mutate("/api/admin/colors")}
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full">
        {/* Header */}
        <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950 capitalize">
          Color List
        </h2>

        {/* Table Header */}
        <div className="mb-2 grid grid-cols-[40px_1fr_1fr_1fr_auto] items-center gap-4 px-5 text-sm font-medium text-neutral-500">
          <span>#</span>
          <span>Name</span>
          <span>Label</span>
          <span>Hex Code</span>
          <span>Actions</span>
        </div>

        {/* Loading */}
        {isLoading && <ProductColorListSkeleton />}

        {/* Product Colors */}
        {!isLoading && (
          <div className="space-y-3">
            {productColors.map((color, index) => (
              <div
                key={color.id}
                className="grid min-h-[62px] grid-cols-[40px_1fr_1fr_1fr_auto] items-center gap-4 rounded-md bg-neutral-200 px-5"
              >
                {/* Number */}
                <span className="text-base font-medium text-neutral-900">
                  {index + 1}.
                </span>

                {/* Name */}
                <span className="text-base font-medium text-neutral-900 capitalize">
                  {color.name}
                </span>

                {/* Label */}
                <span className="text-base text-neutral-700">
                  {color.label}
                </span>

                {/* Hex */}
                <div className="flex items-center gap-3">
                  <span
                    className="h-6 w-6 shrink-0 rounded-full border border-neutral-300"
                    style={{
                      backgroundColor: color.hex,
                    }}
                  />

                  <span className="text-base uppercase text-neutral-700">
                    {color.hex}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-7">
                  <button
                    type="button"
                    onClick={() => handleEdit(color)}
                    disabled={deletingId === color.id}
                    className="text-base font-medium text-green-600 transition-colors hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(color.id)}
                    disabled={deletingId === color.id}
                    className="text-base font-medium text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === color.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {productColors.length === 0 && (
              <div className="rounded-md bg-neutral-100 py-12 text-center">
                <p className="text-sm text-neutral-500">
                  No product colors found.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* Edit Dialog                                                          */}
      {/* -------------------------------------------------------------------- */}

      <Dialog
        open={!!editingProductColor}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            closeDialog();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-neutral-900">
              Edit Product Color
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="color-name"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Name
              </label>

              <Input
                id="color-name"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="Color name"
                autoFocus
                disabled={isUpdating}
              />
            </div>

            {/* Label */}
            <div>
              <label
                htmlFor="color-label"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Label
              </label>

              <Input
                id="color-label"
                value={colorLabel}
                onChange={(e) => setColorLabel(e.target.value)}
                placeholder="Display label"
                disabled={isUpdating}
              />
            </div>

            {/* Hex */}
            <div>
              <label
                htmlFor="color-hex"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Hex Code
              </label>

              <div className="flex h-10 items-center overflow-hidden rounded-md border border-neutral-200">
                {/* Color Picker */}
                <input
                  type="color"
                  value={
                    isValidHex(normalizeHex(hex))
                      ? normalizeHex(hex)
                      : "#000000"
                  }
                  onChange={(e) => setHex(e.target.value.toUpperCase())}
                  disabled={isUpdating}
                  className="h-10 w-12 cursor-pointer border-0 bg-transparent p-1 disabled:cursor-not-allowed"
                  aria-label="Choose color"
                />

                {/* Hex Input */}
                <Input
                  id="color-hex"
                  value={hex}
                  onChange={(e) => {
                    let value = e.target.value;

                    if (value && !value.startsWith("#")) {
                      value = `#${value}`;
                    }

                    setHex(value.toUpperCase());
                  }}
                  onBlur={() => {
                    if (hex.trim()) {
                      setHex(normalizeHex(hex));
                    }
                  }}
                  placeholder="#000000"
                  disabled={isUpdating}
                  className="h-full rounded-none border-0 uppercase shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 rounded-md border border-neutral-200 p-3">
              <span
                className="h-10 w-10 rounded-full border border-neutral-300"
                style={{
                  backgroundColor: isValidHex(normalizeHex(hex))
                    ? normalizeHex(hex)
                    : "#000000",
                }}
              />

              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {colorLabel || colorName || "Color Preview"}
                </p>

                <p className="text-xs uppercase text-neutral-500">
                  {normalizeHex(hex)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isUpdating}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleUpdate}
                disabled={
                  isUpdating ||
                  !colorName.trim() ||
                  !colorLabel.trim() ||
                  !hex.trim()
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}