import Image from "next/image";
import Link from "next/link";

import { CollectionItem } from "@/types/collection";

type CollectionCardProps = {
  collection: CollectionItem;
};

export default function CollectionCard({
  collection,
}: CollectionCardProps) {
  return (
    <Link
      href={`/styles?collection=${collection.slug}&page=1`}
      className="group block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <Image
          src={collection.coverImage}
          alt={collection.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <h3 className="mt-3 text-xl md:text-2xl font-medium text-sidebar-foreground leading-tight capitalize">
        {collection.name}
      </h3>
    </Link>
  );
}