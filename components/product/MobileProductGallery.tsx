"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/types/product";

type Image = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

interface MobileProductGalleryProps {
  images: Image[];
}

export default function MobileProductGallery({
  images,
}: MobileProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = (index: number) => {
    emblaApi?.scrollTo(index);
  };

  return (
    <div className="space-y-4">

      {/* MAIN CAROUSEL */}

      <div
        ref={emblaRef}
        className="overflow-hidden bg-neutral-100"
      >
        <div className="flex">

          {images.map((image) => (
            <div
              key={image.id}
              className="relative min-w-full aspect-[3/5]"
            >
              <Image
                src={image.url}
                alt={""}
                fill
                className="object-cover"
                priority
              />
            </div>
          ))}

        </div>
      </div>

      {/* THUMBNAILS */}

      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">

        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => scrollTo(index)}
            className={cn(
              "relative h-20 w-20 shrink-0 overflow-hidden border transition-all",
              selectedIndex === index
                ? "border-black"
                : "border-neutral-200"
            )}
          >
            <Image
              src={image.url}
              alt=""
              fill
              className="object-cover"
            />
          </button>
        ))}

      </div>

      {/* PAGINATION */}

      <div className="flex justify-center gap-2">

        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all",
              selectedIndex === index
                ? "w-8 bg-secondary-foreground"
                : "w-2 bg-secondary-foreground/30"
            )}
          />
        ))}

      </div>
    </div>
  );
}