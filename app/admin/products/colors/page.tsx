import { AddColor } from "@/components/admin/AddColor";
import ProductColorList from "@/components/admin/ProductColorList";

export default function page() {
  return (
    <div className=''>
        <div className='flex justify-between items-end mb-4'>
            <div className=''>
                <h3 className='font-medium text-lg capitalize'>Product Sizes</h3>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-1 xl:col-span-1">
                <AddColor />
            </div>
            <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-1 xl:col-span-2">
                <ProductColorList />
            </div>
        </div>
    </div>
  )
}
