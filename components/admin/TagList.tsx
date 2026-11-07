"use client";

import * as React from "react";
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

interface Tag {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
}

const fetcher = async (
  url: string
): Promise<Tag[]> => {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Failed to fetch tags."
    );
  }

  if (!Array.isArray(data)) {
    throw new Error("Invalid tags response.");
  }

  return data as Tag[];
};

function TagSkeleton() {
  return (
    <div className="flex min-h-[62px] items-center rounded-md bg-neutral-200 px-5">
      <Skeleton className="h-5 w-8 bg-neutral-300" />

      <Skeleton className="ml-5 h-5 w-40 bg-neutral-300" />

      <div className="ml-auto flex items-center gap-7">
        <Skeleton className="h-5 w-10 bg-neutral-300" />
        <Skeleton className="h-5 w-14 bg-neutral-300" />
      </div>
    </div>
  );
}

export default function TagList() {
  const [editingTag, setEditingTag] =
    React.useState<Tag | null>(null);

  const [tagName, setTagName] =
    React.useState("");

  const [isUpdating, setIsUpdating] =
    React.useState(false);

  const [deletingId, setDeletingId] =
    React.useState<string | null>(null);

  const {
    data: tags = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Tag[]>(
    "/api/admin/tags",
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  /*
   * Open edit dialog
   */
  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
  };

  /*
   * Close edit dialog
   */
  const closeEditDialog = () => {
    if (isUpdating) return;

    setEditingTag(null);
    setTagName("");
  };

  /*
   * Update tag
   */
  const handleUpdate = async () => {
    if (!editingTag) return;

    const name = tagName.trim();

    if (!name) {
      toast.error("Tag name is required.");
      return;
    }

    if (name.length < 2) {
      toast.error(
        "Tag name must be at least 2 characters."
      );
      return;
    }

    if (name.length > 100) {
      toast.error(
        "Tag name must not exceed 100 characters."
      );
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `/api/admin/tags/${editingTag.id}`,
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
            data.error ||
            "Failed to update tag."
        );
      }

      toast.success(
        data.message || "Tag updated successfully."
      );

      closeEditDialog();

      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the tag."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  /*
   * Delete tag
   */
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tag?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(
        `/api/admin/tags/${id}`,
        {
          method: "DELETE",
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete tag."
        );
      }

      toast.success(
        data.message || "Tag deleted successfully."
      );

      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the tag."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <section className="w-full">
        <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
          Tag list
        </h2>

        {/* Error */}
        {error && !isLoading && (
          <div className="rounded-md bg-red-50 px-5 py-4 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Failed to load tags."}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            <TagSkeleton />
            <TagSkeleton />
            <TagSkeleton />
            <TagSkeleton />
            <TagSkeleton />
          </div>
        )}

        {/* Tag List */}
        {!isLoading &&
          !error &&
          tags.length > 0 && (
            <div className="space-y-3">
              {tags.map((tag, index) => (
                <div
                  key={tag.id}
                  className="flex min-h-[62px] items-center rounded-md bg-neutral-200 px-5"
                >
                  {/* Number */}
                  <span className="w-10 shrink-0 text-base font-medium text-neutral-900">
                    {index + 1}.
                  </span>

                  {/* Tag Name */}
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-base font-medium text-neutral-900">
                      {tag.name}
                    </span>

                    <span className="block truncate text-xs text-neutral-500">
                      /{tag.slug}
                    </span>
                  </div>

                  {/* Sort Order */}
                  <span className="mr-6 hidden text-sm text-neutral-500 sm:block">
                    {tag.sortOrder}
                  </span>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-7">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(tag)
                      }
                      disabled={
                        deletingId === tag.id ||
                        isUpdating
                      }
                      className="text-base font-medium text-green-600 transition-colors hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(tag.id)
                      }
                      disabled={
                        deletingId === tag.id
                      }
                      className="text-base font-medium text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === tag.id
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
          tags.length === 0 && (
            <div className="rounded-md bg-neutral-100 py-10 text-center text-sm text-neutral-500">
              No tags found.
            </div>
          )}
      </section>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTag}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-neutral-900">
              Edit Tag
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-5">
            <div>
              <label
                htmlFor="tag-edit-name"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Name
              </label>

              <Input
                id="tag-edit-name"
                value={tagName}
                onChange={(event) =>
                  setTagName(
                    event.target.value
                  )
                }
                placeholder="Tag name"
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
                  !tagName.trim() ||
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