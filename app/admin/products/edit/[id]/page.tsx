import { EditProduct } from "@/components/admin/EditProduct";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  return (
    <div className="pb-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-lg font-medium capitalize">
            Edit product
          </h3>
        </div>
      </div>

      <EditProduct productId={id} />
    </div>
  );
}
