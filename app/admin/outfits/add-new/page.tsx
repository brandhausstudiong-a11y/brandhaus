// import { AddOutfit } from '@/components/admin/AddOutfit'
// import { Button, buttonVariants } from '@/components/ui/button'
// import { ArrowLeft, Plus } from 'lucide-react'
// import Link from 'next/link'

// export default function page() {
//   return (
//     <div className="grid grid-cols-1 gap-4">
//       <div className='flex justify-between items-end mb-4'>
//         <div className=''>
//           <h3 className='font-medium text-lg capitalize'>Add new Outfit</h3>
//         </div>
//         <div className='w-max'>
//           <Link
//             href="/admin/outfits"
//             className={buttonVariants()}
//           >
//             <ArrowLeft className="size-4"  />
//             All Outfits
//           </Link>
//         </div>
//       </div>

//      <AddOutfit />
//     </div>
//   )
// }


import { AddOutfit } from "@/components/admin/AddOutfit";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import prisma from "@/lib/prisma";

export default async function Page() {
  /* ============================================================
     FETCH COLLECTIONS
  ============================================================ */

  const collections = await prisma.collection.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  /* ============================================================
     FETCH PRODUCTS
  ============================================================ */

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      featuredImage: true,
    },
  });

  /* ============================================================
     FORMAT PRODUCTS
  ============================================================ */

  const formattedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    image:
      product.featuredImage ??
      "/images/placeholder-product.jpg",
  }));

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-lg font-medium capitalize">
            Add new Outfit
          </h3>
        </div>

        <div className="w-max">
          <Link
            href="/admin/outfits"
            className={buttonVariants()}
          >
            <ArrowLeft className="size-4" />
            All Outfits
          </Link>
        </div>
      </div>

      {/* ========================================================
          ADD OUTFIT
      ======================================================== */}

      <AddOutfit
        collections={collections}
        products={formattedProducts}
      />
    </div>
  );
}
