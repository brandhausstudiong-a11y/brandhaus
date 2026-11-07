"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* ==========================================================================
   TYPES
   ========================================================================== */

export type CollectionItem = {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type CollectionsResponse = {
  success?: boolean;
  collections: CollectionItem[];
};

/* ==========================================================================
   FETCHER
   ========================================================================== */

const fetcher = async (
  url: string
): Promise<CollectionItem[]> => {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data: CollectionsResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.success === false
        ? "Failed to fetch collections."
        : "Failed to fetch collections."
    );
  }

  if (!Array.isArray(data.collections)) {
    throw new Error(
      "Invalid collections response."
    );
  }

  return data.collections;
};

/* ==========================================================================
   SKELETON
   ========================================================================== */

function CollectionSkeleton() {
  return (
    <div
      className="
        grid
        min-h-[80px]
        grid-cols-[40px_80px_1fr_auto]
        items-center
        gap-4
        rounded-md
        bg-neutral-200
        px-5
      "
    >
      {/* Number */}

      <Skeleton className="h-5 w-7" />

      {/* Cover */}

      <Skeleton className="h-14 w-14 rounded-md" />

      {/* Name */}

      <div>
        <Skeleton className="h-5 w-40" />
      </div>

      {/* Actions */}

      <div className="flex items-center gap-7">
        <Skeleton className="h-5 w-10" />
        <Skeleton className="h-5 w-14" />
      </div>
    </div>
  );
}

/* ==========================================================================
   COLLECTION LIST
   ========================================================================== */

export default function CollectionList() {
  const [deletingCollection, setDeletingCollection] =
    useState<CollectionItem | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  /* ------------------------------------------------------------------------
     FETCH COLLECTIONS
     ------------------------------------------------------------------------ */

  const {
    data: collections = [],
    error,
    isLoading,
    mutate,
  } = useSWR<CollectionItem[]>(
    "/api/admin/collections",
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  /* ------------------------------------------------------------------------
     OPEN DELETE DIALOG
     ------------------------------------------------------------------------ */

  const handleDeleteClick = (
    collection: CollectionItem
  ) => {
    setDeletingCollection(collection);
  };

  /* ------------------------------------------------------------------------
     CLOSE DELETE DIALOG
     ------------------------------------------------------------------------ */

  const closeDeleteDialog = () => {
    if (isDeleting) return;

    setDeletingCollection(null);
  };

  /* ------------------------------------------------------------------------
     DELETE COLLECTION
     
     The DELETE endpoint has not been defined yet.
     This function is intentionally kept separate so it can be connected
     once /api/store/collections/[id] DELETE is available.
     ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deletingCollection) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/collections/${deletingCollection.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete collection."
        );
      }

      toast.success(
        data?.message ||
          "Collection deleted successfully."
      );

      setDeletingCollection(null);

      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the collection."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <>
      <section className="w-full">
        {/* ================================================================
            HEADER
        ================================================================= */}

        <div className="mb-5">
          <h2 className="text-xl font-medium text-neutral-900">
            Collection List
          </h2>
        </div>

        {/* ================================================================
            ERROR
        ================================================================= */}

        {error && !isLoading && (
          <div className="mb-5 rounded-md bg-red-50 px-5 py-4 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Failed to load collections."}
          </div>
        )}

        {/* ================================================================
            TABLE HEADER
        ================================================================= */}

        {!error && (
          <div
            className="
              mb-2
              grid
              grid-cols-[40px_80px_1fr_auto]
              items-center
              gap-4
              px-5
              text-sm
              font-medium
              text-neutral-500
            "
          >
            <span>#</span>

            <span>Cover</span>

            <span>Name</span>

            <span>Actions</span>
          </div>
        )}

        {/* ================================================================
            LOADING SKELETON
        ================================================================= */}

        {isLoading && (
          <div className="space-y-3">
            <CollectionSkeleton />
            <CollectionSkeleton />
            <CollectionSkeleton />
            <CollectionSkeleton />
            <CollectionSkeleton />
          </div>
        )}

        {/* ================================================================
            COLLECTION LIST
        ================================================================= */}

        {!isLoading &&
          !error &&
          collections.length > 0 && (
            <div className="space-y-3">
              {collections.map(
                (collection, index) => (
                  <div
                    key={collection.id}
                    className="
                      grid
                      min-h-[80px]
                      grid-cols-[40px_80px_1fr_auto]
                      items-center
                      gap-4
                      rounded-md
                      bg-neutral-200
                      px-5
                    "
                  >
                    {/* ==================================================
                        NUMBER
                    =================================================== */}

                    <span className="text-base font-medium text-neutral-900">
                      {index + 1}.
                    </span>

                    {/* ==================================================
                        COVER IMAGE
                    =================================================== */}

                    <div className="relative h-14 w-14 overflow-hidden rounded-md bg-neutral-300">
                      {collection.coverImage ? (
                        <Image
                          src={
                            collection.coverImage
                          }
                          alt={collection.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
                          No image
                        </div>
                      )}
                    </div>

                    {/* ==================================================
                        NAME
                    =================================================== */}

                    <div className="min-w-0">
                      <span className="block truncate text-base font-medium text-neutral-900">
                        {collection.name}
                      </span>

                      {collection.description && (
                        <span className="mt-1 block max-w-[600px] truncate text-sm text-neutral-500">
                          {collection.description}
                        </span>
                      )}
                    </div>

                    {/* ==================================================
                        ACTIONS
                    =================================================== */}

                    <div className="flex items-center gap-7">
                      {/* Edit */}

                      <Link
                        href={`/admin/collections/edit/${collection.slug}`}
                        className="
                          text-base
                          font-medium
                          text-green-600
                          transition-colors
                          hover:text-green-700
                        "
                      >
                        Edit
                      </Link>

                      {/* Delete */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteClick(
                            collection
                          )
                        }
                        disabled={
                          isDeleting &&
                          deletingCollection?.id ===
                            collection.id
                        }
                        className="
                          text-base
                          font-medium
                          text-red-500
                          transition-colors
                          hover:text-red-600
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {isDeleting &&
                        deletingCollection?.id ===
                          collection.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

        {/* ================================================================
            EMPTY STATE
        ================================================================= */}

        {!isLoading &&
          !error &&
          collections.length === 0 && (
            <div className="rounded-md bg-neutral-100 py-10 text-center text-sm text-neutral-500">
              No collections found.
            </div>
          )}
      </section>

      {/* ==================================================================
          DELETE CONFIRMATION DIALOG
      =================================================================== */}

      <Dialog
        open={!!deletingCollection}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-neutral-900">
              Delete Collection
            </DialogTitle>

            <DialogDescription className="pt-2 text-sm leading-6 text-neutral-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-neutral-900">
                {deletingCollection?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 flex-row justify-end gap-3">
            {/* Cancel */}

            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={isDeleting}
            >
              Cancel
            </Button>

            {/* Delete */}

            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting
                ? "Deleting..."
                : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}