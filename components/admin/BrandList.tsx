"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Brand = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  featuredImage?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: Brand;
  brands?: Brand[];
};

const fetcher = async (
  url: string
): Promise<Brand[]> => {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data: ApiResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch brands."
    );
  }

  if (!Array.isArray(data.brands)) {
    // Also support a direct array response.
    if (Array.isArray(data)) {
      return data;
    }

    throw new Error("Invalid brands response.");
  }

  return data.brands;
};

function BrandSkeleton() {
  return (
    <div className="flex min-h-[62px] items-center rounded-md bg-neutral-200 px-5">
      <Skeleton className="h-5 w-7 shrink-0" />

      <div className="flex-1 px-3">
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="flex items-center gap-7">
        <Skeleton className="h-5 w-10" />
        <Skeleton className="h-5 w-14" />
      </div>
    </div>
  );
}

export default function BrandList() {
  const [editingBrand, setEditingBrand] =
    useState<Brand | null>(null);

  const [brandName, setBrandName] =
    useState("");

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const {
    data: brands = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Brand[]>(
    "/api/admin/brands",
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
  };

  const closeEditDialog = () => {
    if (isUpdating) return;

    setEditingBrand(null);
    setBrandName("");
  };

  const handleUpdate = async () => {
    if (!editingBrand) return;

    const name = brandName.trim();

    if (!name) {
      toast.error("Brand name is required.");
      return;
    }

    if (name.length < 2) {
      toast.error(
        "Brand name must be at least 2 characters."
      );
      return;
    }

    if (name.length > 100) {
      toast.error(
        "Brand name must not exceed 100 characters."
      );
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `/api/admin/brands/${editingBrand.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update brand."
        );
      }

      toast.success(
        data.message ||
          "Brand updated successfully."
      );

      closeEditDialog();

      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the brand."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this brand?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(
        `/api/admin/brands/${id}`,
        {
          method: "DELETE",
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete brand."
        );
      }

      toast.success(
        data.message ||
          "Brand deleted successfully."
      );

      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the brand."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <section className="w-full">
        <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
          Brand list
        </h2>

        {/* Error */}
        {error && !isLoading && (
          <div className="rounded-md bg-red-50 px-5 py-4 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Failed to load brands."}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            <BrandSkeleton />
            <BrandSkeleton />
            <BrandSkeleton />
            <BrandSkeleton />
            <BrandSkeleton />
          </div>
        )}

        {/* List */}
        {!isLoading &&
          !error &&
          brands.length > 0 && (
            <div className="space-y-3">
              {brands.map((brand, index) => (
                <div
                  key={brand.id}
                  className="flex min-h-[62px] items-center rounded-md bg-neutral-200 px-5"
                >
                  <span className="w-10 shrink-0 text-base font-medium text-neutral-900">
                    {index + 1}.
                  </span>

                  <div className="flex-1 px-3">
                    <span className="text-base font-medium capitalize text-neutral-900">
                      {brand.name}
                    </span>

                    <span className="ml-3 text-sm text-neutral-500">
                      /{brand.slug}
                    </span>
                  </div>

                  <div className="flex items-center gap-7">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(brand)
                      }
                      disabled={
                        deletingId === brand.id
                      }
                      className="text-base font-medium text-green-600 transition-colors hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(brand.id)
                      }
                      disabled={
                        deletingId === brand.id
                      }
                      className="text-base font-medium text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === brand.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Empty */}
        {!isLoading &&
          !error &&
          brands.length === 0 && (
            <div className="rounded-md bg-neutral-100 py-10 text-center text-sm text-neutral-500">
              No brands found.
            </div>
          )}
      </section>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingBrand}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-neutral-900">
              Edit Brand
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-5">
            <div>
              <label
                htmlFor="brand-name"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Name
              </label>

              <Input
                id="brand-name"
                value={brandName}
                onChange={(event) =>
                  setBrandName(event.target.value)
                }
                placeholder="Brand name"
                autoFocus
                disabled={isUpdating}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !isUpdating
                  ) {
                    handleUpdate();
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditDialog}
                disabled={isUpdating}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleUpdate}
                disabled={
                  !brandName.trim() ||
                  isUpdating
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating
                  ? "Saving..."
                  : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}