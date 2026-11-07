"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
// import { ProductImage } from "@/types/product";

type Image = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}
interface ProductGalleryProps {
  images: Image[];
}

export default function ProductGallery({
  images,
}: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="">
      <div className="grid grid-cols-2 gap-2">

        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveImage(image)}
            className={cn(
              "group relative aspect-[3/5] overflow-hidden bg-neutral-100",
            //   activeImage === image &&
            //     "ring-2 ring-black ring-offset-2"
            )}
          >
            <Image
              src={image.url}
              alt={""}
              fill
              sizes="50vw"
              className="object-cover transition-all duration-500 group-hover:scale-105"
            />
          </button>
        ))}

      </div>
    </div>
  );
}