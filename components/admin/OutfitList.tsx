"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export type StyleImage = {
  id: string;
  url: string;
  alt?: string | null;
};

export type OutfitItem = {
  id: string;
  name: string;
  slug: string;
  collectionId?: string | null;

  shortDescription?: string | null;
  longDescription?: string | null;

  featuredImage?: string | null;
  images?: StyleImage[];

  productIDs: string[];

  isActive: boolean;

  collection?: {
    id: string;
    name: string;
  } | null;

  products?: {
    id: string;
    productId?: string;
    sortOrder?: number;
  }[];
};

type OutfitListProps = {
  outfits?: OutfitItem[];
};

const FALLBACK_IMAGE = "/images/placeholder-product.jpg";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeOutfit(outfit: any): OutfitItem {
  const products = Array.isArray(outfit.products)
    ? outfit.products
    : [];

  const images = Array.isArray(outfit.images)
    ? outfit.images
    : [];

  return {
    id: outfit.id,
    name: outfit.name,
    slug: outfit.slug,

    collectionId: outfit.collectionId ?? null,

    shortDescription: outfit.shortDescription ?? null,
    longDescription: outfit.longDescription ?? null,

    featuredImage: outfit.featuredImage ?? null,

    images: images.map((image: any) => ({
      id: image.id,
      url: image.url,
      alt: image.alt ?? outfit.name,
    })),

  productIDs:
    Array.isArray(outfit.productIDs)
      ? outfit.productIDs
      : products
          .map(
            (item: any) =>
              item.product?.id ??
              item.productId ??
              item.id
          )
          .filter(Boolean),

    isActive: Boolean(outfit.isActive),

    collection: outfit.collection
      ? {
          id: outfit.collection.id,
          name: outfit.collection.name,
        }
      : null,

    products,
  };
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

function OutfitListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid min-h-[80px] grid-cols-[40px_70px_1.5fr_1fr_100px_100px_auto] items-center gap-4 rounded-md bg-neutral-100 px-5"
        >
          {/* Number */}
          <div className="h-4 w-5 animate-pulse rounded bg-neutral-200" />

          {/* Image */}
          <div className="h-14 w-14 animate-pulse rounded-md bg-neutral-200" />

          {/* Name */}
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
          </div>

          {/* Collection */}
          <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />

          {/* Products */}
          <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />

          {/* Status */}
          <div className="h-7 w-16 animate-pulse rounded-full bg-neutral-200" />

          {/* Actions */}
          <div className="flex gap-5">
            <div className="h-4 w-8 animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-12 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function OutfitList({
  outfits: initialOutfits = [],
}: OutfitListProps) {
  const [outfitList, setOutfitList] =
    React.useState<OutfitItem[]>(initialOutfits);

  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState<string | null>(
    null
  );

  const [deletingOutfit, setDeletingOutfit] =
    React.useState<OutfitItem | null>(null);

  const [deleting, setDeleting] = React.useState(false);

  const [refreshing, setRefreshing] = React.useState(false);

  /* ------------------------------------------------------------------------ */
  /* Load outfits                                                             */
  /* ------------------------------------------------------------------------ */

  const loadOutfits = React.useCallback(
    async (showSkeleton = true) => {
      try {
        if (showSkeleton) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);

        const response = await fetch(
          "/api/admin/outfits",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          let message =
            "Failed to load outfits.";

          try {
            const data = await response.json();

            if (data?.error) {
              message = data.error;
            }
          } catch {
            // Ignore JSON parsing errors.
          }

          throw new Error(message);
        }

        const data = await response.json();

        /*
         * Supports either:
         *
         * { outfits: [...] }
         *
         * or:
         *
         * [...]
         */
        const outfits = Array.isArray(data)
          ? data
          : data.outfits ?? [];

        setOutfitList(
          outfits.map(normalizeOutfit)
        );
      } catch (err) {
        console.error(
          "Failed to load outfits:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading outfits."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  React.useEffect(() => {
    loadOutfits();
  }, [loadOutfits]);

  /* ------------------------------------------------------------------------ */
  /* Delete outfit                                                            */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deletingOutfit) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/admin/outfits/${deletingOutfit.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let message = "Failed to delete outfit.";

        try {
          const data = await response.json();

          if (data?.error) {
            message = data.error;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      // Remove immediately from UI.
      setOutfitList((current) =>
        current.filter(
          (outfit) =>
            outfit.id !== deletingOutfit.id
        )
      );

      setDeletingOutfit(null);
    } catch (err) {
      console.error(
        "Failed to delete outfit:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete outfit."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Collection                                                               */
  /* ------------------------------------------------------------------------ */

  const getCollectionName = (
    outfit: OutfitItem
  ) => {
    return (
      outfit.collection?.name ||
      "—"
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <section className="w-full rounded-xl bg-white p-6 shadow-sm">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-neutral-900">
              Outfit List
            </h2>

            {!loading && !error && (
              <p className="mt-1 text-sm text-neutral-500">
                {outfitList.length}{" "}
                {outfitList.length === 1
                  ? "outfit"
                  : "outfits"}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadOutfits(false)}
            disabled={loading || refreshing}
          >
            <RefreshCw
              className={`size-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </Button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Error                                                             */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />

            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">
                Unable to load outfits
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadOutfits()}
            >
              Try again
            </Button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Table Header                                                      */}
        {/* ---------------------------------------------------------------- */}

        {!error && (
          <>
            <div className="mb-2 hidden grid-cols-[40px_70px_1.5fr_1fr_100px_100px_auto] items-center gap-4 px-5 text-sm font-medium text-neutral-500 lg:grid">
              <span>#</span>
              <span>Image</span>
              <span>Name</span>
              <span>Collection</span>
              <span>Products</span>
              <span>Visibility</span>
              <span>Actions</span>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Loading                                                        */}
            {/* ------------------------------------------------------------ */}

            {loading && (
              <OutfitListSkeleton />
            )}

            {/* ------------------------------------------------------------ */}
            {/* Outfit List                                                    */}
            {/* ------------------------------------------------------------ */}

            {!loading &&
              outfitList.length > 0 && (
                <div className="space-y-3">
                  {outfitList.map(
                    (outfit, index) => {
                      const productCount =
                        outfit.productIDs
                          ?.length ?? 0;

                      return (
                        <div
                          key={outfit.id}
                          className="rounded-md bg-neutral-100 px-5 py-4 transition-colors hover:bg-neutral-200 lg:grid lg:min-h-[80px] lg:grid-cols-[40px_70px_1.5fr_1fr_100px_100px_auto] lg:items-center lg:gap-4 lg:py-3"
                        >
                          {/* ------------------------------------------------ */}
                          {/* Mobile Header                                    */}
                          {/* ------------------------------------------------ */}

                          <div className="mb-3 flex items-center justify-between lg:hidden">
                            <span className="text-sm font-medium text-neutral-500">
                              #{index + 1}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                outfit.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-neutral-300 text-neutral-600"
                              }`}
                            >
                              {outfit.isActive
                                ? "Active"
                                : "Hidden"}
                            </span>
                          </div>

                          {/* Number */}
                          <span className="hidden text-base font-medium text-neutral-900 lg:block">
                            {index + 1}.
                          </span>

                          {/* ------------------------------------------------ */}
                          {/* Featured Image                                   */}
                          {/* ------------------------------------------------ */}

                          <div className="mb-4 flex items-center gap-4 lg:mb-0">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-200 lg:h-14 lg:w-14">
                              <img
                                src={
                                  outfit.featuredImage ||
                                  FALLBACK_IMAGE
                                }
                                alt={
                                  outfit.name
                                }
                                className="h-full w-full object-cover"
                                loading="lazy"
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.src =
                                    FALLBACK_IMAGE;
                                }}
                              />
                            </div>

                            {/* Mobile name */}
                            <div className="min-w-0 lg:hidden">
                              <p className="truncate text-base font-medium text-neutral-900">
                                {outfit.name}
                              </p>

                              <p className="mt-1 truncate text-sm text-neutral-500">
                                /{outfit.slug}
                              </p>
                            </div>
                          </div>

                          {/* ------------------------------------------------ */}
                          {/* Name                                             */}
                          {/* ------------------------------------------------ */}

                          <div className="hidden min-w-0 lg:block">
                            <p className="truncate text-base font-medium text-neutral-900">
                              {outfit.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-neutral-500">
                              /{outfit.slug}
                            </p>
                          </div>

                          {/* ------------------------------------------------ */}
                          {/* Collection                                       */}
                          {/* ------------------------------------------------ */}

                          <div className="mb-2 flex items-center justify-between lg:mb-0 lg:block">
                            <span className="text-sm text-neutral-500 lg:hidden">
                              Collection
                            </span>

                            <span className="text-base text-neutral-700">
                              {getCollectionName(
                                outfit
                              )}
                            </span>
                          </div>

                          {/* ------------------------------------------------ */}
                          {/* Products                                         */}
                          {/* ------------------------------------------------ */}

                          <div className="mb-2 flex items-center justify-between lg:mb-0 lg:block">
                            <span className="text-sm text-neutral-500 lg:hidden">
                              Products
                            </span>

                            <span className="text-base text-neutral-700">
                              {productCount}{" "}
                              {productCount === 1
                                ? "product"
                                : "products"}
                            </span>
                          </div>

                          {/* ------------------------------------------------ */}
                          {/* Visibility                                       */}
                          {/* ------------------------------------------------ */}

                          <span
                            className={`hidden w-fit rounded-full px-3 py-1 text-sm font-medium lg:block ${
                              outfit.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-neutral-300 text-neutral-600"
                            }`}
                          >
                            {outfit.isActive
                              ? "Active"
                              : "Hidden"}
                          </span>

                          {/* ------------------------------------------------ */}
                          {/* Actions                                           */}
                          {/* ------------------------------------------------ */}

                          <div className="mt-4 flex items-center justify-end gap-5 border-t border-neutral-200 pt-3 lg:mt-0 lg:border-0 lg:pt-0">
                            <Link
                              href={`/admin/outfits/edit/${outfit.slug}`}
                              className="text-sm font-medium text-green-600 transition-colors hover:text-green-700"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                setDeletingOutfit(
                                  outfit
                                )
                              }
                              className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

            {/* ------------------------------------------------------------ */}
            {/* Empty State                                                    */}
            {/* ------------------------------------------------------------ */}

            {!loading &&
              !error &&
              outfitList.length === 0 && (
                <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 text-center">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-neutral-200">
                    <span className="text-xl">
                      👕
                    </span>
                  </div>

                  <h3 className="text-base font-medium text-neutral-900">
                    No outfits found
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-neutral-500">
                    You haven't created any
                    outfits yet.
                  </p>

                  <Link
                    href="/admin/outfits/add"
                    className="mt-4 inline-flex h-9 items-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                  >
                    Add your first outfit
                  </Link>
                </div>
              )}
          </>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Delete Confirmation                                                */}
      {/* ------------------------------------------------------------------ */}

      <Dialog
        open={!!deletingOutfit}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeletingOutfit(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-neutral-900">
              Delete Outfit
            </DialogTitle>

            <DialogDescription className="pt-2 text-sm leading-6 text-neutral-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-neutral-900">
                {deletingOutfit?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setDeletingOutfit(null)
              }
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleting && (
                <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}

              {deleting
                ? "Deleting..."
                : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}