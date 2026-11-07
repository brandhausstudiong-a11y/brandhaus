"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CollectionItem = {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  description: string;
};

interface EditCollectionProps {
  collection: CollectionItem;
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

export default function EditCollection({
  collection,
}: EditCollectionProps) {
  const router = useRouter();

  const [name, setName] = useState(collection.name);
  const [slug, setSlug] = useState(collection.slug);
  const [description, setDescription] = useState(
    collection.description
  );

  const [coverImage, setCoverImage] = useState(
    collection.coverImage
  );

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    slug?: string;
    coverImage?: string;
    description?: string;
  }>({});

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setImageFile(file);
    setCoverImage(imageUrl);

    setErrors((current) => ({
      ...current,
      coverImage: undefined,
    }));
  };

  const removeImage = () => {
    setCoverImage("");
    setImageFile(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Collection name is required.";
    }

    if (!slug.trim()) {
      newErrors.slug = "Slug is required.";
    }

    if (!coverImage) {
      newErrors.coverImage = "Cover image is required.";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    /*
     * Submit your form/API request here.
     *
     * imageFile contains the new cover image if
     * the user selected one.
     *
     * Example:
     *
     * const formData = new FormData();
     * formData.append("name", name);
     * formData.append("slug", slug);
     * formData.append("description", description);
     * formData.append("coverImage", coverImage);
     *
     * if (imageFile) {
     *   formData.append("imageFile", imageFile);
     * }
     *
     * await fetch(`/api/collections/${collection.id}`, {
     *   method: "PUT",
     *   body: formData,
     * });
     */

    router.push("/admin/collections");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <section className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        {/* Heading */}
        <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
            Edit collection
        </h2>

        <form
            onSubmit={handleSubmit}
            className="space-y-8"
        >
            {/* Collection Name */}
            <div className="space-y-3">
            <Label
                htmlFor="collection-name"
                className="text-base font-semibold text-neutral-700"
            >
                Collection Name
            </Label>

            <Input
                id="collection-name"
                name="name"
                value={name}
                onChange={(event) => {
                setName(event.target.value);

                if (errors.name) {
                    setErrors((current) => ({
                    ...current,
                    name: undefined,
                    }));
                }
                }}
                placeholder="Summer Collection"
                aria-invalid={!!errors.name}
                className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                errors.name
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }`}
            />

            <FormError message={errors.name} />
            </div>

            {/* Slug */}
            <div className="space-y-3">
            <Label
                htmlFor="collection-slug"
                className="text-base font-semibold text-neutral-700"
            >
                Slug
            </Label>

            <Input
                id="collection-slug"
                name="slug"
                value={slug}
                onChange={(event) => {
                setSlug(event.target.value);

                if (errors.slug) {
                    setErrors((current) => ({
                    ...current,
                    slug: undefined,
                    }));
                }
                }}
                placeholder="summer-collection"
                aria-invalid={!!errors.slug}
                className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                errors.slug
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }`}
            />

            <FormError message={errors.slug} />
            </div>

            {/* Description */}
            <div className="space-y-3">
            <Label
                htmlFor="collection-description"
                className="text-base font-semibold text-neutral-700"
            >
                Description
            </Label>

            <Textarea
                id="collection-description"
                name="description"
                value={description}
                onChange={(event) => {
                setDescription(event.target.value);

                if (errors.description) {
                    setErrors((current) => ({
                    ...current,
                    description: undefined,
                    }));
                }
                }}
                placeholder="Describe this collection..."
                aria-invalid={!!errors.description}
                className={`min-h-[160px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                errors.description
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }`}
            />

            <FormError message={errors.description} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
            <button
                type="submit"
                className="h-[50px] rounded-none bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700"
            >
                Save Changes
            </button>

            <button
                type="button"
                onClick={() => router.push("/admin/collections")}
                className="h-[50px] rounded-none border border-neutral-300 px-8 text-base font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
            >
                Cancel
            </button>
            </div>
        </form>
        </section>
        <section className="bg-primary-foreground p-4 rounded-lg 2xl:col-span-2">

            {/* Cover Image */}
            <div className="space-y-3">
            <Label
                htmlFor="collection-cover-image"
                className="text-base font-semibold text-neutral-700"
            >
                Cover Image
            </Label>

            <div
                className={`relative flex min-h-[220px] items-center justify-center overflow-hidden bg-neutral-200 ${
                errors.coverImage
                    ? "ring-1 ring-red-500"
                    : ""
                }`}
            >
                {coverImage ? (
                <>
                    <img
                    src={coverImage}
                    alt={`${name} cover`}
                    className="h-[220px] w-full object-cover"
                    />

                    {/* Replace Image */}
                    <label
                    htmlFor="collection-cover-image"
                    className="absolute bottom-3 left-3 cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100"
                    >
                    Replace Image
                    </label>

                    {/* Remove */}
                    <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100"
                    aria-label="Remove cover image"
                    >
                    <X className="h-5 w-5" />
                    </button>
                </>
                ) : (
                <label
                    htmlFor="collection-cover-image"
                    className="flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center gap-3 text-neutral-500 transition-colors hover:bg-neutral-300"
                >
                    <ImagePlus className="h-8 w-8" />

                    <span className="text-sm font-medium">
                    Upload cover image
                    </span>

                    <span className="text-xs text-neutral-400">
                    PNG, JPG or WEBP
                    </span>
                </label>
                )}

                <input
                id="collection-cover-image"
                name="coverImage"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="sr-only"
                />
            </div>

            <FormError message={errors.coverImage} />
            </div>
        </section>
    </div>
  );
}