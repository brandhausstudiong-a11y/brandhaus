"use client";

import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { SubCategory } from "@/types/product";

interface CategoryNavigationProps {
  subCategories: SubCategory[];
}

export default function CategoryNavigation({
  subCategories,
}: CategoryNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /*
   * The URL is the source of truth for the
   * active category.
   *
   * /shop
   *               → no category selected
   *
   * /shop?category=shirts
   *               → shirts is active
   */
  const activeCategory =
    searchParams.get("category");

  const autoplay = Autoplay({
    delay: 4000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  const [emblaRef, emblaApi] =
    useEmblaCarousel(
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

  /*
   * Select a category.
   */
  const handleCategoryClick = useCallback(
    (
      index: number,
      categorySlug: string
    ) => {
      // Scroll carousel to selected category
      emblaApi?.scrollTo(index);

      // Preserve existing query parameters
      const params = new URLSearchParams(
        searchParams.toString()
      );

      params.set(
        "category",
        categorySlug
      );

      // Always start from page 1
      params.set("page", "1");

      router.push(
        `${pathname}?${params.toString()}`
      );
    },
    [
      emblaApi,
      pathname,
      router,
      searchParams,
    ]
  );

  /*
   * When the URL changes directly, scroll
   * the carousel to the active category.
   *
   * Example:
   *
   * /shop?category=shirts
   *
   * → automatically scroll to Shirts.
   */
  useEffect(() => {
    if (!emblaApi) return;

    /*
     * If there is no category parameter,
     * don't force a specific category.
     */
    if (!activeCategory) return;

    const activeIndex =
      subCategories.findIndex(
        (category) =>
          category.slug === activeCategory
      );

    if (activeIndex !== -1) {
      emblaApi.scrollTo(activeIndex);
    }
  }, [
    activeCategory,
    subCategories,
    emblaApi,
  ]);

  return (
    <div className="w-full rounded-2xl bg-accent">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        {/* LEFT BUTTON */}

        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous category"
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
            {(subCategories ?? []).map(
              (category, index) => {
                /*
                 * Active state is determined by
                 * the URL, NOT Embla's index.
                 */
                const isActive =
                  category.slug ===
                  activeCategory;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      handleCategoryClick(
                        index,
                        category.slug
                      )
                    }
                    aria-current={
                      isActive
                        ? "page"
                        : undefined
                    }
                    className="mr-6 shrink-0"
                  >
                    <div className="flex flex-col items-center">
                      {/* CATEGORY NAME */}

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
                        {category.name}
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
              }
            )}
          </div>
        </div>

        {/* RIGHT BUTTON */}

        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next category"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-neutral-200"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}