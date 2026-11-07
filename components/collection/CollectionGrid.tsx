
import { CollectionItem } from "@/types/collection";
import CollectionCard from "./CollectionCard";


type CollectionGridProps = {
  collections: CollectionItem[];
};

export default function CollectionGrid({
  collections,
}: CollectionGridProps) {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 gap-x-6 md:gap-x-6 gap-y-10 md:grid-cols-2">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
          />
        ))}
      </div>
    </section>
  );
}