import OutfitList from '@/components/admin/OutfitList'
import { Button, buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function page() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className='flex justify-between items-end mb-4'>
        <div className=''>
          <h3 className='font-medium text-lg capitalize'>Outfits</h3>
        </div>
        <div className='w-max'>
          <Link
            href="/admin/outfits/add-new"
            className={buttonVariants()}
          >
            <Plus className="size-4" />
            Add New
          </Link>
        </div>
      </div>

      <div className="bg-primary-foreground p-4 rounded-lg">
        <OutfitList />
      </div>
    </div>
  )
}
