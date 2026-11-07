// import { Button, buttonVariants } from '@/components/ui/button'
// import { ArrowLeft, Plus } from 'lucide-react'
// import Link from 'next/link'

import OrderList from "@/components/admin/OrderList";



export default async function Page() {
  return (
    <main className="grid grid-cols-1 gap-4 pb-10">
        <div className='flex justify-between items-end mb-4'>
            <div className=''>
                <h3 className='font-medium text-lg capitalize'>Orders</h3>
            </div>
        {/* <div className='w-max'>
            <Link
            href="/admin/outfits"
            className={buttonVariants()}
            >
            <ArrowLeft className="size-4"  />
            All Outfits
            </Link>
        </div> */}
        </div>
        <OrderList />
    </main>
  );
}