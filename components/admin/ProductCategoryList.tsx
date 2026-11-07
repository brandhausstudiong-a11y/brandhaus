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

type Category = {
  id: string;
  name: string;
  slug: string;
  categoryGroupId: string;
  description?: string | null;
  image?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

type CategoriesResponse = {
  success?: boolean;
  categories: Category[];
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: Category;
  categories?: Category[];
};

const fetcher = async (
  url: string
): Promise<Category[]> => {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data: CategoriesResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.success === false
        ? "Failed to fetch categories."
        : "Failed to fetch categories."
    );
  }

  if (!Array.isArray(data.categories)) {
    throw new Error("Invalid categories response.");
  }

  return data.categories;
};

function CategorySkeleton() {
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

export default function ProductCategoryList() {
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [categoryName, setCategoryName] =
    useState("");

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const {
    data: categories = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Category[]>(
    "/api/admin/categories",
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  /*
   * Open edit dialog
   */
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };

  /*
   * Close edit dialog
   */
  const closeEditDialog = () => {
    if (isUpdating) return;

    setEditingCategory(null);
    setCategoryName("");
  };

  /*
   * Update category
   */
  const handleUpdate = async () => {
    if (!editingCategory) return;

    const name = categoryName.trim();

    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    if (name.length < 3) {
      toast.error(
        "Category name must be at least 3 characters."
      );
      return;
    }

    if (name.length > 100) {
      toast.error(
        "Category name must not exceed 100 characters."
      );
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `/api/admin/categories/${editingCategory.id}`,
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
            "Failed to update category."
        );
      }

      toast.success(
        data.message ||
          "Category updated successfully."
      );

      closeEditDialog();

      /*
       * Revalidate the categories from the API.
       */
      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the category."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  /*
   * Delete category
   */
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(
        `/api/admin/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete category."
        );
      }

      toast.success(
        data.message ||
          "Category deleted successfully."
      );

      /*
       * Revalidate the list after deletion.
       */
      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <section className="w-full">
        {/* Header */}
      <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
        Category list
      </h2>

        {/* Error */}
        {error && !isLoading && (
          <div className="rounded-md bg-red-50 px-5 py-4 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Failed to load categories."}
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-3">
            <CategorySkeleton />
            <CategorySkeleton />
            <CategorySkeleton />
            <CategorySkeleton />
            <CategorySkeleton />
          </div>
        )}

        {/* Category List */}
        {!isLoading &&
          !error &&
          categories.length > 0 && (
            <div className="space-y-3">
              {categories.map(
                (category, index) => (
                  <div
                    key={category.id}
                    className="flex min-h-[62px] items-center rounded-md bg-neutral-200 px-5"
                  >
                    {/* Number */}
                    <span className="w-10 shrink-0 text-base font-medium text-neutral-900">
                      {index + 1}.
                    </span>

                    {/* Category Name */}
                    <span className="flex-1 text-base font-medium text-neutral-900 capitalize">
                      {category.name}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-7">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(category)
                        }
                        disabled={
                          deletingId ===
                          category.id
                        }
                        className="text-base font-medium text-green-600 transition-colors hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            category.id
                          )
                        }
                        disabled={
                          deletingId ===
                          category.id
                        }
                        className="text-base font-medium text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId ===
                        category.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          categories.length === 0 && (
            <div className="rounded-md bg-neutral-100 py-10 text-center text-sm text-neutral-500">
              No categories found.
            </div>
          )}
      </section>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-neutral-900">
              Edit Category
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-5">
            <div>
              <label
                htmlFor="category-name"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Name
              </label>

              <Input
                id="category-name"
                value={categoryName}
                onChange={(event) =>
                  setCategoryName(
                    event.target.value
                  )
                }
                placeholder="Category name"
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
                  !categoryName.trim() ||
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