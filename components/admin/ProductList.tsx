"use client";

import * as React from "react";
import Image from "next/image";
import useSWR from "swr";
import { useRouter } from "next/navigation";

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import type { SortingState } from "@tanstack/react-table";

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


// ============================================================
// TYPES
// ============================================================

interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  featuredImage: string | null;
  isActive: boolean;
  category: ProductCategory | null;
  createdAt?: string;
  updatedAt?: string;
}


// ============================================================
// API
// ============================================================

interface ProductsResponse {
  products: Product[];
}

const fetcher = async (url: string): Promise<Product[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  const data: ProductsResponse = await response.json();

  return data.products ?? [];
};


// ============================================================
// TABLE FEATURES
// ============================================================

const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnFilteringFeature,
  globalFilteringFeature,

  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filteredRowModel: createFilteredRowModel(),

  sortFns: {
    alphanumeric: sortFn_alphanumeric,
  },

  filterFns: {
    includesString: filterFn_includesString,
  },
});


// ============================================================
// COLUMN HELPER
// ============================================================

const columnHelper =
  createColumnHelper<typeof features, Product>();


// ============================================================
// SKELETON
// ============================================================

function ProductListSkeleton() {
  const skeletonRows = Array.from({ length: 8 });

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="w-full overflow-x-auto">
        <Table>

          <TableHeader>
            <TableRow className="border-neutral-200 hover:bg-transparent">
              {[
                "Image",
                "Product Name",
                "Category",
                "Visibility",
                "Action",
              ].map((heading) => (
                <TableHead
                  key={heading}
                  className="
                    h-14
                    whitespace-nowrap
                    px-5
                    text-sm
                    font-semibold
                    text-neutral-600
                  "
                >
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow
                key={index}
                className="border-neutral-200"
              >
                {/* Image */}
                <TableCell className="h-16 px-5">
                  <div className="size-14 animate-pulse rounded-md bg-neutral-100" />
                </TableCell>

                {/* Product name */}
                <TableCell className="px-5">
                  <div className="h-4 w-52 animate-pulse rounded bg-neutral-100" />
                </TableCell>

                {/* Category */}
                <TableCell className="px-5">
                  <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
                </TableCell>

                {/* Visibility */}
                <TableCell className="px-5">
                  <div className="h-4 w-16 animate-pulse rounded bg-neutral-100" />
                </TableCell>

                {/* Action */}
                <TableCell className="px-5">
                  <div className="size-9 animate-pulse rounded-md bg-neutral-100" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </div>
    </div>
  );
}


// ============================================================
// PRODUCT LIST
// ============================================================

export function ProductList() {

  // ----------------------------------------------------------
  // Products
  // ----------------------------------------------------------
  const router = useRouter();
  
  const {
    data = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Product[]>(
    "/api/admin/products",
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );


  // ----------------------------------------------------------
  // Table state
  // ----------------------------------------------------------

  const [sorting, setSorting] =
    React.useState<SortingState>([]);

  const [globalFilter, setGlobalFilter] =
    React.useState("");


  // ----------------------------------------------------------
  // Filter state
  // ----------------------------------------------------------

  const [categoryFilter, setCategoryFilter] =
    React.useState("all");

  const [visibilityFilter, setVisibilityFilter] =
    React.useState("all");


  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories = React.useMemo(() => {
    const categoryMap = new Map<string, ProductCategory>();

    data.forEach((product) => {
      if (product.category) {
        categoryMap.set(
          product.category.id,
          product.category
        );
      }
    });

    return Array.from(categoryMap.values()).sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }, [data]);


  // ==========================================================
  // COLUMNS
  // ==========================================================

  const columns = React.useMemo(
    () =>
      columnHelper.columns([

        // ----------------------------------------------------
        // Featured Image
        // ----------------------------------------------------

        {
          accessorKey: "featuredImage",
          header: "Image",
          enableSorting: false,
          enableGlobalFilter: false,

          cell: ({ row }) => {
            const product = row.original;

            return (
              <div className="relative size-14 overflow-hidden rounded-md bg-neutral-100">

                {product.featuredImage ? (
                  <Image
                    src={product.featuredImage}
                    alt={product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-neutral-400">
                    No image
                  </div>
                )}

              </div>
            );
          },
        },


        // ----------------------------------------------------
        // Product Name
        // ----------------------------------------------------

        {
          accessorKey: "name",
          header: "Product Name",

          cell: ({ row }) => (
            <div className="max-w-[320px] truncate font-medium text-neutral-900">
              {row.original.name}
            </div>
          ),
        },


        // ----------------------------------------------------
        // Category
        // ----------------------------------------------------

        {
          id: "category",
          accessorFn: (row) =>
            row.category?.name ?? "",

          header: "Category",

          cell: ({ row }) => (
            <span className="text-neutral-600">
              {row.original.category?.name ?? "Uncategorized"}
            </span>
          ),
        },


        // ----------------------------------------------------
        // Visibility
        // ----------------------------------------------------

        {
          accessorKey: "isActive",
          header: "Visibility",

          cell: ({ row }) => (
            <span
              className={
                row.original.isActive
                  ? "text-emerald-600"
                  : "text-neutral-500"
              }
            >
              {row.original.isActive
                ? "Visible"
                : "Hidden"}
            </span>
          ),
        },


        // ----------------------------------------------------
        // Actions
        // ----------------------------------------------------

        {
          id: "actions",
          header: "Action",
          enableSorting: false,
          enableGlobalFilter: false,

          cell: ({ row }) => {
            const product = row.original;

            return (
              <DropdownMenu>

                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9"
                    >
                      <MoreHorizontal className="size-5" />

                      <span className="sr-only">
                        Open actions
                      </span>
                    </Button>
                  }
                />

                <DropdownMenuContent
                  align="end"
                  className="w-40"
                >

                  <DropdownMenuItem
                    onClick={() => {
                      router.push(`/admin/products/edit/${product.id}`);
                    }}
                  >
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => {
                      console.log(
                        "Delete:",
                        product.id
                      );
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>

                </DropdownMenuContent>

              </DropdownMenu>
            );
          },
        },

      ]),
    []
  );


  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filteredData = React.useMemo(() => {

    return data.filter((product) => {

      // ------------------------------------------------------
      // Category
      // ------------------------------------------------------

      if (categoryFilter !== "all") {

        if (
          product.category?.id !==
          categoryFilter
        ) {
          return false;
        }

      }


      // ------------------------------------------------------
      // Visibility
      // ------------------------------------------------------

      if (visibilityFilter !== "all") {

        if (
          String(product.isActive) !==
          visibilityFilter
        ) {
          return false;
        }

      }


      return true;
    });

  }, [
    data,
    categoryFilter,
    visibilityFilter,
  ]);


  // ==========================================================
  // TABLE
  // ==========================================================

  const table = useTable(
    {
      features,
      columns,

      data: filteredData,

      globalFilterFn: "includesString",

      state: {
        sorting,
        globalFilter,
      },

      onSortingChange: setSorting,

      onGlobalFilterChange:
        setGlobalFilter,

      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 8,
        },
      },
    },

    (state) => ({
      sorting: state.sorting,
      pagination: state.pagination,
      globalFilter: state.globalFilter,
    })
  );


  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (
    value: string
  ) => {

    setGlobalFilter(value);

    table.resetPageIndex();
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {

    return (
      <section className="w-full">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-[360px]">

            <div className="h-12 animate-pulse rounded-md bg-white" />

          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="h-5 w-16 animate-pulse rounded bg-neutral-100" />

            <div className="h-12 w-[150px] animate-pulse rounded-md bg-white" />

            <div className="h-12 w-[140px] animate-pulse rounded-md bg-white" />

          </div>

        </div>

        <ProductListSkeleton />

      </section>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <section className="w-full">

        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white px-6 text-center">

          <p className="font-medium text-neutral-900">
            Unable to load products
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            Something went wrong while loading
            your products.
          </p>

          <Button
            variant="outline"
            className="mt-5"
            onClick={() => mutate()}
          >
            Try again
          </Button>

        </div>

      </section>
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="w-full">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}

        <div className="relative w-full lg:max-w-[360px]">

          <Search
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              size-4
              -translate-y-1/2
              text-neutral-500
            "
          />

          <Input
            value={globalFilter}
            onChange={(event) =>
              handleSearch(
                event.target.value
              )
            }
            placeholder="Search products..."
            className="
              h-12
              rounded-md
              border-0
              bg-white
              pl-11
              pr-4
              shadow-none
              focus-visible:ring-1
              focus-visible:ring-neutral-400
            "
          />

        </div>


        {/* =================================================
            FILTERS
        ================================================== */}

        <div className="flex flex-wrap items-center gap-3">

          <span className="text-sm font-medium text-neutral-600">
            Filter by:
          </span>


          {/* ------------------------------------------------
              Category
          ------------------------------------------------- */}

          <Select
            value={categoryFilter}
            onValueChange={(value) => {

              if (value === null) return;

              setCategoryFilter(value);

              table.resetPageIndex();
            }}
          >

            <SelectTrigger className="h-12 w-[170px] border-0 bg-white shadow-none">
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">
                All Categories
              </SelectItem>

              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </SelectItem>
              ))}

            </SelectContent>

          </Select>


          {/* ------------------------------------------------
              Visibility
          ------------------------------------------------- */}

          <Select
            value={visibilityFilter}
            onValueChange={(value) => {

              if (value === null) return;

              setVisibilityFilter(value);

              table.resetPageIndex();
            }}
          >

            <SelectTrigger className="h-12 w-[140px] border-0 bg-white shadow-none">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">
                All
              </SelectItem>

              <SelectItem value="true">
                Visible
              </SelectItem>

              <SelectItem value="false">
                Hidden
              </SelectItem>

            </SelectContent>

          </Select>

        </div>

      </div>


      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">

        <div className="w-full overflow-x-auto">

          <Table>

            {/* ------------------------------------------------
                HEADER
            ------------------------------------------------- */}

            <TableHeader>

              {table
                .getHeaderGroups()
                .map((headerGroup) => (

                  <TableRow
                    key={headerGroup.id}
                    className="border-neutral-200 hover:bg-transparent"
                  >

                    {headerGroup.headers.map(
                      (header) => (

                        <TableHead
                          key={header.id}
                          className="
                            h-14
                            whitespace-nowrap
                            px-5
                            text-sm
                            font-semibold
                            text-neutral-600
                          "
                        >
                          {header.isPlaceholder
                            ? null
                            : (header.column
                                .columnDef
                                .header as string)}
                        </TableHead>

                      )
                    )}

                  </TableRow>

                ))}

            </TableHeader>


            {/* ------------------------------------------------
                BODY
            ------------------------------------------------- */}

            <TableBody>

              {table.getRowModel().rows.length > 0 ? (

                table
                  .getRowModel()
                  .rows
                  .map((row) => (

                    <TableRow
                      key={row.id}
                      className="
                        border-neutral-200
                        hover:bg-neutral-50
                      "
                    >

                      {row
                        .getAllCells()
                        .map((cell) => (

                          <TableCell
                            key={cell.id}
                            className="
                              h-16
                              whitespace-nowrap
                              px-5
                              text-sm
                            "
                          >
                            {flexRender(
                              cell.column
                                .columnDef
                                .cell,
                              cell.getContext()
                            )}
                          </TableCell>

                        ))}

                    </TableRow>

                  ))

              ) : (

                <TableRow>

                  <TableCell
                    colSpan={columns.length}
                    className="
                      h-32
                      text-center
                      text-neutral-500
                    "
                  >
                    {data.length === 0
                      ? "No products found."
                      : "No products match your filters."}
                  </TableCell>

                </TableRow>

              )}

            </TableBody>

          </Table>

        </div>

      </div>


      {/* =====================================================
          PAGINATION
      ====================================================== */}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Results */}

        <p className="text-sm text-neutral-500">

          Showing{" "}

          <span className="font-medium text-neutral-800">
            {table
              .getRowModel()
              .rows.length}
          </span>{" "}

          of{" "}

          <span className="font-medium text-neutral-800">
            {filteredData.length}
          </span>{" "}

          products

        </p>


        {/* Pagination */}

        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            size="icon"
            className="size-9 bg-white"
            onClick={() =>
              table.previousPage()
            }
            disabled={
              !table.getCanPreviousPage()
            }
          >
            <ChevronLeft className="size-4" />
          </Button>


          {/* Page numbers */}

          {Array.from(
            {
              length: table.getPageCount(),
            },
            (_, index) => {

              const currentPage =
                table.state.pagination
                  .pageIndex;

              const isActive =
                currentPage === index;

              return (
                <Button
                  key={index}
                  variant={
                    isActive
                      ? "default"
                      : "outline"
                  }
                  size="icon"
                  className="size-9"
                  onClick={() =>
                    table.setPageIndex(
                      index
                    )
                  }
                >
                  {index + 1}
                </Button>
              );

            }
          )}


          <Button
            variant="outline"
            size="icon"
            className="size-9 bg-white"
            onClick={() =>
              table.nextPage()
            }
            disabled={
              !table.getCanNextPage()
            }
          >
            <ChevronRight className="size-4" />
          </Button>

        </div>

      </div>

    </section>
  );
}