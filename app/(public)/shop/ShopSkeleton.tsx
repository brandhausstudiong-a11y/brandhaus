import { Skeleton } from "@/components/ui/skeleton";

export default function ShopSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-9 w-32 rounded-md" />

        <div className="hidden gap-2 md:flex">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-60" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {/* Toolbar */}
      <div className="my-8">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />

      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}