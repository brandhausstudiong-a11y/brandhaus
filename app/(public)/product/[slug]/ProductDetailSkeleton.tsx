// components/ProductDetailSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ===========================
            LEFT COLUMN
        =========================== */}
        <div className="lg:col-span-8">
          {/* Mobile */}
          <div className="lg:hidden">
            <Skeleton className="aspect-[3/5] w-full rounded-lg" />

            <div className="mt-4 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-[3/5] rounded-md"
                />
              ))}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="aspect-[3/5] rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* ===========================
            RIGHT COLUMN
        =========================== */}
        <div className="space-y-5 lg:col-span-4">
          {/* Category */}
          <Skeleton className="h-4 w-24" />

          {/* Product Name */}
          <Skeleton className="h-8 w-4/5" />

          {/* Price */}
          <Skeleton className="h-7 w-40" />

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
          </div>

          {/* Colors */}
          <div>
            <Skeleton className="mb-3 h-4 w-20" />

            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-8 w-8 rounded-full"
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <Skeleton className="mb-3 h-4 w-16" />

            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-10 w-14 rounded-md"
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 flex-1 rounded-md" />
            <Skeleton className="h-12 w-14 rounded-md" />
          </div>

          {/* Extra Information */}
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}