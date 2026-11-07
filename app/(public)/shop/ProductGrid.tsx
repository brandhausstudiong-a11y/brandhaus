"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";

import CategoryNavigation from "@/components/category-navigation/CategoryNavigation";
import ProductCard from "@/components/ProductCard";
import {
  ProductItem,
  SubCategory,
} from "@/types/product";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProductGridProps {
  subCategories: SubCategory[];
  categorySlug?: string;
  page?: string;
  search?: string;
  sort?: string;
  limit?: string;
}

interface ProductsResponse {
  success: boolean;
  products: ProductItem[];
  error?: string;

  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type ProductSortOption =
  | "newest"
  | "price-asc"
  | "price-desc";

const fetcher = async (
  url: string
): Promise<ProductsResponse> => {
  const response = await fetch(url, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        "Failed to load products."
    );
  }

  return data;
};

export default function ProductGrid({
  subCategories,
  categorySlug,
  page,
  search,
  sort,
  limit,
}: ProductGridProps) {
  const [sortBy, setSortBy] =
    useState<ProductSortOption>(
      (sort as ProductSortOption) || "Newest"
    );

  /*
   * Build the API URL from the page parameters.
   *
   * /api/store/products
   *
   * becomes:
   *
   * /api/store/products?category=shirts&page=1
   */
  const productsUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (categorySlug) {
      params.set("category", categorySlug);
    }

    if (page) {
      params.set("page", page);
    }

    if (search) {
      params.set("search", search);
    }

    if (sort) {
      params.set("sort", sort);
    }

    if (limit) {
      params.set("limit", limit);
    }

    const query = params.toString();

    return query
      ? `/api/store/products?${query}`
      : "/api/store/products";
  }, [
    categorySlug,
    page,
    search,
    sort,
    limit,
  ]);

  const {
    data,
    error,
    isLoading,
  } = useSWR<ProductsResponse>(
    productsUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const products = data?.products ?? [];

  const sortedProducts = products;

  return (
    <div className="w-full">
      <div className="sticky top-0 z-40 mt-8 bg-background pb-2">
        <CategoryNavigation
          subCategories={subCategories}
        />

        <div className="mt-2 flex items-center justify-between">
          <div className="font-light text-sm">
            {isLoading ? (
              <Badge variant="secondary">
                Loading...
              </Badge>
            ) : (
              <Badge variant="secondary">
                {products.length}{" "}
                {products.length > 1
                  ? "items"
                  : "item"}
              </Badge>
            )}
          </div>

          <div>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value as ProductSortOption);
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="newest">
                  Newest
                </SelectItem>

                <SelectItem value="price-asc">
                  Price: Low to High
                </SelectItem>

                <SelectItem value="price-desc">
                  Price: High to Low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                key={index}
                className="animate-pulse"
              >
                <div className="aspect-[3/5] w-full rounded-md bg-muted" />

                <div className="mt-3 h-4 w-3/4 rounded bg-muted" />

                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
              </div>
            )
          )}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 px-6 py-16 text-center">
          <h3 className="text-lg font-semibold">
            Unable to Load Products
          </h3>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {error.message ||
              "Something went wrong while loading products."}
          </p>

          <Button
            nativeButton={false}
            className="mt-6"
            render={
              <Link href="/shop">
                Try Again
              </Link>
            }
          />
        </div>
      )}

      {/* Products */}
      {!isLoading &&
        !error &&
        sortedProducts.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {sortedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
              />
            ))}
          </div>
        )}

      {/* Empty */}
      {!isLoading &&
        !error &&
        sortedProducts.length === 0 && (
          <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-sidebar-accent bg-accent px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-sidebar-foreground">
              No Results Found
            </h3>

            <p className="mt-2 max-w-md text-sm text-sidebar-foreground/60">
              We couldn't find any products matching
              your current filters. Try adjusting your
              filters or browse another category.
            </p>

            <Button
              nativeButton={false}
              className="mt-6"
              render={
                <Link href="/shop">
                  Continue Shopping
                </Link>
              }
            />
          </div>
        )}
    </div>
  );
}