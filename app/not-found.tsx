// app/products/[slug]/not-found.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-[2px] text-muted-foreground">
          Error 404
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Page Not Found
        </h1>

        <p className="mt-4 text-muted-foreground">
          Sorry, the page you're looking for doesn't exist, has been
          removed, or the link may be incorrect.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
            nativeButton={false}
            render={<Link href="/shop" />}
            >
                Go to Shop
            </Button>
            <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/" />}
            >
            Back Home
            </Button>
        </div>
      </div>
    </div>
  );
}