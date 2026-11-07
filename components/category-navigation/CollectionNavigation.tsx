"use client";

import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CollectionItem } from "@/types/collection";

interface CollectionNavigationProps {
  collections: CollectionItem[];
}

export default function CollectionNavigation({
  collections,
}: CollectionNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active collection directly from the URL
  const activeCollection = searchParams.get("collection");

  const autoplay = Autoplay({
    delay: 4000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
      containScroll: "trimSnaps",
    },
    [autoplay]
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const handleCollectionClick = useCallback(
    (collectionSlug: string, index: number) => {
      // Scroll the carousel to the selected collection
      emblaApi?.scrollTo(index);

      // Preserve any other existing query parameters
      const params = new URLSearchParams(searchParams.toString());

      params.set("collection", collectionSlug);
      params.set("page", "1");

      router.push(`${pathname}?${params.toString()}`);
    },
    [emblaApi, pathname, router, searchParams]
  );

  /*
   * When the URL changes to a collection that is currently outside
   * the visible carousel area, bring that collection into view.
   */
  useEffect(() => {
    if (!emblaApi || !activeCollection) return;

    const activeIndex = collections.findIndex(
      (collection) => collection.slug === activeCollection
    );

    if (activeIndex !== -1) {
      emblaApi.scrollTo(activeIndex);
    }
  }, [activeCollection, collections, emblaApi]);

  return (
    <div className="w-full rounded-2xl bg-accent">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        {/* LEFT BUTTON */}
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous collection"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-neutral-200"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* CAROUSEL */}
        <div
          ref={emblaRef}
          className="flex-1 overflow-hidden"
        >
          <div className="flex">
            {(collections ?? []).map((collection, index) => {
              const isActive = collection.slug === activeCollection;

              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() =>
                    handleCollectionClick(collection.slug, index)
                  }
                  aria-current={isActive ? "page" : undefined}
                  className="mr-6 shrink-0"
                >
                  <div className="flex flex-col items-center">
                    {/* COLLECTION NAME */}
                    <span
                      className={`
                        whitespace-nowrap
                        text-sm
                        capitalize
                        transition-colors
                        duration-300
                        ${
                          isActive
                            ? "text-sidebar-foreground"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                        }
                      `}
                    >
                      {collection.name}
                    </span>

                    {/* ACTIVE UNDERLINE */}
                    <div
                      className={`
                        mt-2
                        h-[2px]
                        w-full
                        origin-center
                        transition-all
                        duration-300
                        ${
                          isActive
                            ? "scale-x-100 bg-foreground"
                            : "scale-x-0 bg-transparent"
                        }
                      `}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT BUTTON */}
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next collection"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-neutral-200"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}