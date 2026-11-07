import AddBrand from "@/components/admin/AddBrand";
import BrandList from "@/components/admin/BrandList";

export default function Page() {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-lg font-medium capitalize">
            Brands
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg bg-primary-foreground p-4 lg:col-span-1 xl:col-span-1">
          <AddBrand />
        </div>

        <div className="rounded-lg bg-primary-foreground p-4 lg:col-span-1 xl:col-span-2">
          <BrandList />
        </div>
      </div>
    </div>
  );
}