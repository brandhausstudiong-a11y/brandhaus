export default function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="grid gap-12 lg:grid-cols-2">

        <div className="space-y-4">
          <div className="h-[600px] animate-pulse rounded-lg bg-muted" />

          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="size-24 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />

          <div className="h-6 w-32 animate-pulse rounded bg-muted" />

          <div className="h-28 animate-pulse rounded bg-muted" />

          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="size-10 animate-pulse rounded-full bg-muted"
              />
            ))}
          </div>

          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-16 animate-pulse rounded bg-muted"
              />
            ))}
          </div>

          <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-muted" />
        </div>

      </div>
    </div>
  );
}