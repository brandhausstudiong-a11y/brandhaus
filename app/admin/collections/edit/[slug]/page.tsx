import EditCollection, {
  CollectionItem,
} from "@/components/admin/EditCollection";

interface EditCollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const collections: CollectionItem[] = [
  {
    id: "1",
    name: "Summer Collection",
    slug: "summer-collection",
    coverImage: "/images/collections/collection-1.jpg",
    description: "Our latest summer collection.",
  },
  {
    id: "2",
    name: "Essentials",
    slug: "essentials",
    coverImage: "/images/collections/collection-2.jpg",
    description: "Everyday wardrobe essentials.",
  },
];

export default async function EditCollectionPage({
  params,
}: EditCollectionPageProps) {
  const { slug } = await params;

  const collection = collections.find(
    (item) => item.slug === slug
  );

  if (!collection) {
    return (
        <main className="w-full">
            <div className='flex justify-between items-end mb-4'>
                <div className=''>
                    <h3 className='font-medium text-lg capitalize'>Edit collection</h3>
                </div>
            </div>
            <div className="p-6 text-center text-neutral-500">
                Collection not found.
            </div>
        </main>
    );
  }

  return (
    <main className="w-full">
        <div className='flex justify-between items-end mb-4'>
            <div className=''>
                <h3 className='font-medium text-lg capitalize'>Edit collection</h3>
            </div>
        </div>
      <EditCollection collection={collection} />
    </main>
  );
}