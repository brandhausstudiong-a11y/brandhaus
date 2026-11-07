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

type ProductSize = {
  id: string;
  name: string;
  label: string;
  createdAt?: string;
  updatedAt?: string;
};

type SizesResponse = {
  success: boolean;
  sizes: ProductSize[];
};

/* -------------------------------------------------------------------------- */
/* Fetcher                                                                    */
/* -------------------------------------------------------------------------- */

const fetcher = async (url: string): Promise<ProductSize[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch product sizes.");
  }

  const data: SizesResponse = await response.json();

  return data.sizes ?? [];
};

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

function ProductSizeListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid min-h-[62px] animate-pulse grid-cols-[40px_1fr_1fr_auto] items-center gap-4 rounded-md bg-neutral-200 px-5"
        >
          {/* Number */}
          <div className="h-4 w-5 rounded bg-neutral-300" />

          {/* Name */}
          <div className="h-4 w-24 rounded bg-neutral-300" />

          {/* Label */}
          <div className="h-4 w-32 rounded bg-neutral-300" />

          {/* Actions */}
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

export default function ProductSizeList() {
  const {
    data: productSizes = [],
    error,
    isLoading,
  } = useSWR<ProductSize[]>(
    "/api/admin/sizes",
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  const [editingProductSize, setEditingProductSize] =
    React.useState<ProductSize | null>(null);

  const [sizeName, setSizeName] = React.useState("");
  const [sizeLabel, setSizeLabel] = React.useState("");

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(
    null
  );

  /* ------------------------------------------------------------------------ */
  /* Edit                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleEdit = (productSize: ProductSize) => {
    setEditingProductSize(productSize);
    setSizeName(productSize.name);
    setSizeLabel(productSize.label);
  };

  /* ------------------------------------------------------------------------ */
  /* Close Dialog                                                             */
  /* ------------------------------------------------------------------------ */

  const closeDialog = () => {
    if (isUpdating) return;

    setEditingProductSize(null);
    setSizeName("");
    setSizeLabel("");
  };

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleUpdate = async () => {
    if (!editingProductSize) return;

    const name = sizeName.trim();
    const label = sizeLabel.trim();

    if (!name) {
      toast.error("Size name is required.");
      return;
    }

    if (!label) {
      toast.error("Size label is required.");
      return;
    }

    try {
      setIsUpdating(true);

      const response = await fetch(
        `/api/admin/sizes/${editingProductSize.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            label,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to update product size."
        );
      }

      toast.success("Product size updated successfully.");

      // Refresh the list
      await mutate("/api/admin/sizes");

      // Reset dialog
      setEditingProductSize(null);
      setSizeName("");
      setSizeLabel("");
    } catch (error) {
      console.error("Update product size error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update product size."
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
      "Are you sure you want to delete this product size?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(`/api/admin/sizes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete product size."
        );
      }

      toast.success("Product size deleted successfully.");

      // Refresh the list
      await mutate("/api/admin/sizes");
    } catch (error) {
      console.error("Delete product size error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete product size."
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
          Size List
        </h2>

        <div className="rounded-md border border-red-200 bg-red-50 px-5 py-10 text-center">
          <p className="text-sm text-red-600">
            Failed to load product sizes.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => mutate("/api/admin/sizes")}
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
            Size List
          </h2>

        {/* Table Header */}
        <div className="mb-2 grid grid-cols-[40px_1fr_1fr_auto] items-center gap-4 px-5 text-sm font-medium text-neutral-500">
          <span>#</span>
          <span>Name</span>
          <span>Label</span>
          <span>Actions</span>
        </div>

        {/* Loading */}
        {isLoading && <ProductSizeListSkeleton />}

        {/* Product Sizes */}
        {!isLoading && (
          <div className="space-y-3">
            {productSizes.map((productSize, index) => (
              <div
                key={productSize.id}
                className="grid min-h-[62px] grid-cols-[40px_1fr_1fr_auto] items-center gap-4 rounded-md bg-neutral-200 px-5"
              >
                {/* Number */}
                <span className="text-base font-medium text-neutral-900">
                  {index + 1}.
                </span>

                {/* Name */}
                <span className="text-base font-medium text-neutral-900">
                  {productSize.name}
                </span>

                {/* Label */}
                <span className="text-base text-neutral-700">
                  {productSize.label}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-7">
                  <button
                    type="button"
                    onClick={() => handleEdit(productSize)}
                    disabled={deletingId === productSize.id}
                    className="text-base font-medium text-green-600 transition-colors hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(productSize.id)}
                    disabled={deletingId === productSize.id}
                    className="text-base font-medium text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === productSize.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {productSizes.length === 0 && (
              <div className="rounded-md bg-neutral-100 py-12 text-center">
                <p className="text-sm text-neutral-500">
                  No product sizes found.
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
        open={!!editingProductSize}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            closeDialog();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-neutral-900">
              Edit Product Size
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="size-name"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Name
              </label>

              <Input
                id="size-name"
                value={sizeName}
                onChange={(e) => setSizeName(e.target.value)}
                placeholder="e.g. XL"
                autoFocus
                disabled={isUpdating}
              />
            </div>

            {/* Label */}
            <div>
              <label
                htmlFor="size-label"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Label
              </label>

              <Input
                id="size-label"
                value={sizeLabel}
                onChange={(e) => setSizeLabel(e.target.value)}
                placeholder="e.g. Extra Large"
                disabled={isUpdating}
              />
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
                  !sizeName.trim() ||
                  !sizeLabel.trim()
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