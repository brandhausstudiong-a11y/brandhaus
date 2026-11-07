"use client";

import Image from "next/image";
import { buttonVariants } from "./ui/button";

export interface CollectionCardProps {
  slug: string;
  name: string;
  description: string;
  image: string;
  itemCount: number;
}

export default function CollectionCard({
  slug,
  name,
  description,
  image,
}: CollectionCardProps) {
  return (
    <div className="grid grid-cols-4 gap-3 md:gap-10 w-full">

      <div className="relative col-span-4 md:col-span-2 aspect-[5/3] overflow-hidden bg-neutral-100">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover"
        />
      </div>

      {/* CONTENT */}

        <div className="col-span-4 md:col-span-2">
            <h2 className='text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-800'>
                {name}
            </h2>
            <p className='text-slate-800 text-sm md:text-md lg:text-lg mt-4'>
                {description}
            </p>
            <a
                href={`/styles/${slug}`}
                className={`mt-4 ${buttonVariants({ variant: "secondary", size: "lg" })}`}
            >
                See Collection
            </a>
        </div>
    </div>
  );
}