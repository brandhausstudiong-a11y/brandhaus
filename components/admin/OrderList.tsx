"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* =========================================================
   TYPES
========================================================= */

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus =
  | "Pending"
  | "Successful"
  | "Failed"
  | "Refunded";

export interface Order {
  id: string;
  orderNo: string;
  customerEmail: string;
  orderStatus: OrderStatus;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  date: string;
}

type DateFilter =
  | "all"
  | "today"
  | "yesterday"
  | "this-week"
  | "this-month"
  | "last-30-days";

/* =========================================================
   API RESPONSE
========================================================= */

interface OrdersApiResponse {
  success: boolean;
  message?: string;
  data?: Order[];
}

/* =========================================================
   TABLE FEATURES
========================================================= */

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

/* =========================================================
   COLUMN HELPER
========================================================= */

const columnHelper =
  createColumnHelper<typeof features, Order>();

/* =========================================================
   FORMATTERS
========================================================= */

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/* =========================================================
   DATE FILTER
========================================================= */

function isSameDay(
  dateA: Date,
  dateB: Date
) {
  return (
    dateA.getFullYear() ===
      dateB.getFullYear() &&
    dateA.getMonth() ===
      dateB.getMonth() &&
    dateA.getDate() ===
      dateB.getDate()
  );
}

function isDateInRange(
  dateString: string,
  filter: DateFilter
) {
  if (filter === "all") {
    return true;
  }

  const orderDate = new Date(dateString);
  const today = new Date();

  orderDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  /* Today */

  if (filter === "today") {
    return isSameDay(
      orderDate,
      today
    );
  }

  /* Yesterday */

  if (filter === "yesterday") {
    const yesterday = new Date(today);

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    return isSameDay(
      orderDate,
      yesterday
    );
  }

  /* This week */

  if (filter === "this-week") {
    const startOfWeek =
      new Date(today);

    const day =
      startOfWeek.getDay();

    const difference =
      day === 0 ? 6 : day - 1;

    startOfWeek.setDate(
      startOfWeek.getDate() -
        difference
    );

    startOfWeek.setHours(
      0,
      0,
      0,
      0
    );

    return (
      orderDate >= startOfWeek &&
      orderDate <= today
    );
  }

  /* This month */

  if (filter === "this-month") {
    const startOfMonth =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    startOfMonth.setHours(
      0,
      0,
      0,
      0
    );

    return (
      orderDate >= startOfMonth &&
      orderDate <= today
    );
  }

  /* Last 30 days */

  if (filter === "last-30-days") {
    const startDate =
      new Date(today);

    startDate.setDate(
      startDate.getDate() - 30
    );

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    return (
      orderDate >= startDate &&
      orderDate <= today
    );
  }

  return true;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function OrderList() {
  const router = useRouter();

  const [data, setData] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await fetch("/api/admin/orders", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        const result = (await response.json()) as OrdersApiResponse;

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load orders.");
        }

        setData(result.data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        setLoadError(
          error instanceof Error ? error.message : "Unable to load orders."
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadOrders();
    return () => controller.abort();
  }, []);

  /* Sorting */

  const [sorting, setSorting] =
    React.useState<SortingState>([]);

  /* Search */

  const [globalFilter, setGlobalFilter] =
    React.useState("");

  /* Order status */

  const [
    orderStatusFilter,
    setOrderStatusFilter,
  ] = React.useState("all");

  /* Payment status */

  const [
    paymentStatusFilter,
    setPaymentStatusFilter,
  ] = React.useState("all");

  /* Date */

  const [dateFilter, setDateFilter] =
    React.useState<DateFilter>("all");

  /* =======================================================
     COLUMNS
  ======================================================= */

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        /* Order Number */

        {
          accessorKey: "orderNo",

          header: "Order No.",

          cell: ({ row }) => (
            <span className="font-medium text-neutral-900">
              {row.original.orderNo}
            </span>
          ),
        },

        /* Customer Email */

        {
          accessorKey: "customerEmail",

          header: "Customer Email",

          cell: ({ row }) => (
            <div className="max-w-[280px] truncate text-neutral-600">
              {row.original.customerEmail}
            </div>
          ),
        },

        /* Order Status */

        {
          accessorKey: "orderStatus",

          header: "Order Status",

          cell: ({ row }) => {
            const status =
              row.original.orderStatus;

            return (
              <span
                className={
                  status === "Delivered"
                    ? "font-medium text-emerald-600"
                    : status === "Shipped" || status === "Processing"
                    ? "font-medium text-blue-600"
                    : status === "Cancelled"
                    ? "font-medium text-red-500"
                    : "font-medium text-amber-600"
                }
              >
                {status}
              </span>
            );
          },
        },

        /* Amount Paid */

        {
          accessorKey: "amountPaid",

          header: "Amount Paid",

          cell: ({ row }) => (
            <span className="font-medium text-neutral-800">
              {formatAmount(
                row.original.amountPaid
              )}
            </span>
          ),
        },

        /* Payment Status */

        {
          accessorKey: "paymentStatus",

          header: "Payment Status",

          cell: ({ row }) => {
            const status =
              row.original.paymentStatus;

            return (
              <span
                className={
                  status === "Successful"
                    ? "font-medium text-emerald-600"
                    : status === "Pending"
                    ? "font-medium text-amber-600"
                    : status === "Refunded"
                    ? "font-medium text-purple-600"
                    : "font-medium text-red-500"
                }
              >
                {status}
              </span>
            );
          },
        },

        /* Date */

        {
          accessorKey: "date",

          header: "Date",

          cell: ({ row }) => (
            <span className="text-neutral-600">
              {formatDate(
                row.original.date
              )}
            </span>
          ),
        },
      ]),
    []
  );

  /* =======================================================
     FILTER DATA
  ======================================================= */

  const filteredData =
    React.useMemo(() => {
      return data.filter((order) => {
        /* Order Status */

        if (
          orderStatusFilter !==
            "all" &&
          order.orderStatus !==
            orderStatusFilter
        ) {
          return false;
        }

        /* Payment Status */

        if (
          paymentStatusFilter !==
            "all" &&
          order.paymentStatus !==
            paymentStatusFilter
        ) {
          return false;
        }

        /* Date */

        if (
          !isDateInRange(
            order.date,
            dateFilter
          )
        ) {
          return false;
        }

        return true;
      });
    }, [
      data,
      orderStatusFilter,
      paymentStatusFilter,
      dateFilter,
    ]);

  /* =======================================================
     TABLE
  ======================================================= */

  const table = useTable(
    {
      features,

      columns,

      data: filteredData,

      globalFilterFn:
        "includesString",

      state: {
        sorting,
        globalFilter,
      },

      onSortingChange:
        setSorting,

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
      globalFilter:
        state.globalFilter,
    })
  );

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleSearch = (
    value: string
  ) => {
    setGlobalFilter(value);

    table.resetPageIndex();
  };

  const handleOrderStatusChange = (
    value: string | null
  ) => {
    if (value === null) return;

    setOrderStatusFilter(value);

    table.resetPageIndex();
  };

  const handlePaymentStatusChange = (
    value: string | null
  ) => {
    if (value === null) return;

    setPaymentStatusFilter(value);

    table.resetPageIndex();
  };

  const handleDateChange = (
    value: string | null
  ) => {
    if (value === null) return;

    setDateFilter(
      value as DateFilter
    );

    table.resetPageIndex();
  };

  /* =======================================================
     ORDER CLICK
  ======================================================= */

  const handleOrderClick = (
    orderNo: string
  ) => {
    router.push(
      `/admin/orders/detail/${encodeURIComponent(
        orderNo
      )}`
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="w-full">
      {/* Header */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}

        <div className="relative w-full lg:max-w-[360px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />

          <Input
            value={globalFilter}
            onChange={(event) =>
              handleSearch(
                event.target.value
              )
            }
            placeholder="Search orders..."
            className="h-12 rounded-md border-0 bg-white pl-11 pr-4 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
          />
        </div>

        {/* Filters */}

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-neutral-600">
            Filter by:
          </span>

          {/* Order Status */}

          <Select
            value={orderStatusFilter}
            onValueChange={
              handleOrderStatusChange
            }
          >
            <SelectTrigger className="h-12 w-[170px] border-0 bg-white shadow-none">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Order Status
              </SelectItem>

              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Status */}

          <Select
            value={paymentStatusFilter}
            onValueChange={
              handlePaymentStatusChange
            }
          >
            <SelectTrigger className="h-12 w-[180px] border-0 bg-white shadow-none">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Payment Status
              </SelectItem>

              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Successful">Successful</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          {/* Date */}

          <Select
            value={dateFilter}
            onValueChange={
              handleDateChange
            }
          >
            <SelectTrigger className="h-12 w-[160px] border-0 bg-white shadow-none">
              <SelectValue placeholder="Date" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Dates
              </SelectItem>

              <SelectItem value="today">
                Today
              </SelectItem>

              <SelectItem value="yesterday">
                Yesterday
              </SelectItem>

              <SelectItem value="this-week">
                This Week
              </SelectItem>

              <SelectItem value="this-month">
                This Month
              </SelectItem>

              <SelectItem value="last-30-days">
                Last 30 Days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="w-full overflow-x-auto">
          <Table>
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
                          className="h-14 whitespace-nowrap px-5 text-sm font-semibold text-neutral-600"
                        >
                          {header.isPlaceholder
                            ? null
                            : header.column
                                .columnDef
                                .header as string}
                        </TableHead>
                      )
                    )}
                  </TableRow>
                ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows
                .length > 0 ? (
                table
                  .getRowModel()
                  .rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() =>
                        handleOrderClick(
                          row.original
                            .orderNo
                        )
                      }
                      className="cursor-pointer border-neutral-200 transition-colors hover:bg-neutral-50"
                    >
                      {row
                        .getAllCells()
                        .map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="h-16 whitespace-nowrap px-5 text-sm"
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
                    colSpan={
                      columns.length
                    }
                    className="h-32 text-center text-neutral-500"
                  >
                    {isLoading
                      ? "Loading orders..."
                      : loadError
                      ? loadError
                      : "No orders found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Result count */}

        <p className="text-sm text-neutral-500">
          Showing{" "}
          <span className="font-medium text-neutral-800">
            {table
              .getRowModel()
              .rows.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-neutral-800">
            {isLoading ? "…" : filteredData.length}
          </span>{" "}
          orders
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

          {Array.from(
            {
              length:
                table.getPageCount(),
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