import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { EditOutfit } from "@/components/admin/EditOutfit";

const outfit = {
  id: "1",
  name: "Classic Weekend Look",
  slug: "classic-weekend-look",
  collectionId: "1",

  shortDescription:
    "A clean and relaxed weekend outfit.",

  longDescription:
    "A versatile combination of classic wardrobe pieces designed for effortless everyday styling.",

  featuredImage:
    "/images/outfits/weekend-look.jpg",

  images: [
    {
      id: "img-1",
      url: "/images/outfits/weekend-look-1.jpg",
      alt: "Classic Weekend Look",
    },
    {
      id: "img-2",
      url: "/images/outfits/weekend-look-2.jpg",
      alt: "Classic Weekend Look",
    },
  ],

  productIDs: ["1", "2", "3"],

  isActive: true,
};

const collections = [
  {
    id: "1",
    name: "Summer Collection",
  },
  {
    id: "2",
    name: "Essentials",
  },
  {
    id: "3",
    name: "New Arrivals",
  },
];

const products = [
  {
    id: "1",
    name: "Yellow Jacket",
    image: "/images/products/yellow-jacket.jpg",
    price: 65000,
  },
  {
    id: "2",
    name: "Black N White Loafers",
    image: "/images/products/loafers.jpg",
    price: 125000,
  },
  {
    id: "3",
    name: "Classic White Shirt",
    image: "/images/products/shirt.jpg",
    price: 45000,
  },
];

export default async function EditOutfitPage() {
  return (
    <main className="grid grid-cols-1 gap-4">
      <div className='flex justify-between items-end mb-4'>
        <div className=''>
          <h3 className='font-medium text-lg capitalize'>Edit Outfit</h3>
        </div>
        <div className='w-max'>
          <Link
            href="/admin/outfits"
            className={buttonVariants()}
          >
            <ArrowLeft className="size-4"  />
            All Outfits
          </Link>
        </div>
      </div>
      <EditOutfit
        outfit={outfit}
        collections={collections}
        products={products}
      />
    </main>
  );
}