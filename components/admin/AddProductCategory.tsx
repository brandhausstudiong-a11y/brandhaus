"use client";

import * as React from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

import { ProductImageUpload } from "@/components/admin/ProductImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface AddProductCategoryProps {
  errors?: {
    name?: string;
    slug?: string;
    description?: string;
    categoryGroupId?: string;
    image?: string;
  };
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  categoryGroupId: string;
  image: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
  categoryGroupId?: string;
  image?: string;
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

/**
 * Converts a category name into a URL-friendly slug.
 *
 * Example:
 * "Men's T-Shirts" → "mens-t-shirts"
 */
function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// const fetcher = async (url: string) => {
//   const response = await fetch(url, {
//     method: "GET",
//     cache: "no-store",
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(
//       data?.message || "Failed to fetch category groups."
//     );
//   }

//   if (!Array.isArray(data.groups)) {
//     throw new Error("Invalid category group response.");
//   }

//   return data.groups as CategoryGroup[];
// };

const fetcher = async (url: string): Promise<CategoryGroup[]> => {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to fetch category groups."
    );
  }

  // Support the expected API response:
  // { groups: [...] }
  if (Array.isArray(data?.groups)) {
    return data.groups as CategoryGroup[];
  }

  // Support:
  // { categoryGroups: [...] }
  if (Array.isArray(data?.categoryGroups)) {
    return data.categoryGroups as CategoryGroup[];
  }

  // Support a direct array response:
  // [...]
  if (Array.isArray(data)) {
    return data as CategoryGroup[];
  }

  throw new Error("Invalid category group response.");
};

export function AddProductCategory({
  errors: serverErrors = {},
}: AddProductCategoryProps) {
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    slug: "",
    description: "",
    categoryGroupId: "",
    image: "",
  });

  const [errors, setErrors] =
    React.useState<FormErrors>(serverErrors);

  const [isSubmitting, setIsSubmitting] =
    React.useState(false);

  const [slugManuallyEdited, setSlugManuallyEdited] =
    React.useState(false);

  /*
   * Fetch category groups from:
   *
   * GET /api/store/category-groups
   */
  const {
    data: categoryGroups = [],
    error: categoryGroupsError,
    isLoading: isLoadingGroups,
    mutate: mutateCategoryGroups,
  } = useSWR<CategoryGroup[]>(
    "/api/admin/category-groups",
    fetcher
  );

  /**
   * Update a form field.
   */
  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for the field being edited.
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  /**
   * Category name change.
   *
   * Automatically generates a slug unless
   * the user has manually edited the slug.
   */
  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: slugManuallyEdited
        ? prev.slug
        : generateSlug(value),
    }));

    setErrors((prev) => ({
      ...prev,
      name: undefined,
      slug: undefined,
    }));
  };

  /**
   * Slug change.
   *
   * Once the user edits the slug manually,
   * automatic slug generation is disabled.
   */
  const handleSlugChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setSlugManuallyEdited(true);

    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(value),
    }));

    setErrors((prev) => ({
      ...prev,
      slug: undefined,
    }));
  };

  /**
   * Validate form.
   */
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    const name = formData.name.trim();
    const slug = formData.slug.trim();
    const description = formData.description.trim();
    const categoryGroupId =
      formData.categoryGroupId.trim();

    // Name
    if (!name) {
      newErrors.name = "Category name is required.";
    } else if (name.length < 3) {
      newErrors.name =
        "Category name must be at least 3 characters.";
    } else if (name.length > 100) {
      newErrors.name =
        "Category name must not exceed 100 characters.";
    }

    // Slug
    if (!slug) {
      newErrors.slug = "Slug is required.";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens.";
    } else if (slug.length > 100) {
      newErrors.slug =
        "Slug must not exceed 100 characters.";
    }

    // Category Group
    if (!categoryGroupId) {
      newErrors.categoryGroupId =
        "Category group is required.";
    }

    // Description
    if (description.length > 500) {
      newErrors.description =
        "Description must not exceed 500 characters.";
    }

    return newErrors;
  };

  /**
   * Submit form.
   */
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      toast.error("Please fix the errors in the form.");

      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            description:
              formData.description.trim() || null,
            categoryGroupId:
              formData.categoryGroupId,
            image:
              formData.image.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }

        throw new Error(
          data.message || "Failed to create category."
        );
      }

      toast.success(
        data.message || "Category added successfully."
      );

      // Reset form
      setFormData({
        name: "",
        slug: "",
        description: "",
        categoryGroupId: "",
        image: "",
      });

      setSlugManuallyEdited(false);

      // Refresh the ProductCategoryList
      await mutate("/api/admin/categories");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while adding the category."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryGroupError =
    categoryGroupsError instanceof Error
      ? categoryGroupsError.message
      : null;

  return (
    <section>
      {/* General Information */}
      <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
        Add new category
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Category Name */}
        <div className="space-y-3">
          <Label
            htmlFor="category-name"
            className="text-base font-semibold text-neutral-700"
          >
            Category Name
          </Label>

          <Input
            id="category-name"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="T-Shirts"
            required
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
            htmlFor="category-slug"
            className="text-base font-semibold text-neutral-700"
          >
            Slug
          </Label>

          <Input
            id="category-slug"
            name="slug"
            value={formData.slug}
            onChange={handleSlugChange}
            placeholder="t-shirts"
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            aria-invalid={!!errors.slug}
            className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
              errors.slug
                ? "focus-visible:ring-red-500"
                : "focus-visible:ring-neutral-400"
            }`}
          />

          <p className="text-sm text-neutral-500">
            Use lowercase letters, numbers, and hyphens.
          </p>

          <FormError message={errors.slug} />
        </div>

        {/* Category Group */}
        <div className="space-y-3">
          <Label
            htmlFor="category-group"
            className="text-base font-semibold text-neutral-700"
          >
            Category Group
          </Label>

          <div className="relative">
            <select
              id="category-group"
              name="categoryGroupId"
              value={formData.categoryGroupId}
              onChange={handleChange}
              required
              disabled={
                isLoadingGroups ||
                !!categoryGroupError ||
                isSubmitting
              }
              aria-invalid={!!errors.categoryGroupId}
              className={`h-[50px] w-full appearance-none rounded-none border-0 bg-neutral-200 px-8 pr-16 text-xl text-neutral-700 outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60 ${
                errors.categoryGroupId
                  ? "focus:ring-red-500"
                  : "focus:ring-neutral-400"
              }`}
            >
              <option value="" disabled>
                {isLoadingGroups
                  ? "Loading category groups..."
                  : categoryGroupError
                    ? "Unable to load groups"
                    : categoryGroups.length === 0
                      ? "No category groups found"
                      : "Select category group"}
              </option>

              {categoryGroups.map((group) => (
                <option
                  key={group.id}
                  value={group.id}
                >
                  {group.name}
                </option>
              ))}
            </select>

            <ChevronDown
              className="pointer-events-none absolute right-6 top-1/2 size-5 -translate-y-1/2 text-neutral-500"
              strokeWidth={1.8}
            />
          </div>

          {categoryGroupError ? (
            <FormError
              message={categoryGroupError}
            />
          ) : (
            <FormError
              message={errors.categoryGroupId}
            />
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label
            htmlFor="category-description"
            className="text-base font-semibold text-neutral-700"
          >
            Description
          </Label>

          <Textarea
            id="category-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe this product category..."
            aria-invalid={!!errors.description}
            className={`min-h-[140px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-lg text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
              errors.description
                ? "focus-visible:ring-red-500"
                : "focus-visible:ring-neutral-400"
            }`}
          />

          <FormError
            message={errors.description}
          />
        </div>

        {/* Category Image */}
        {/* <div className="space-y-3">
          <Label
            htmlFor="category-image"
            className="text-base font-semibold text-neutral-700"
          >
            Category Image
          </Label>

          <ProductImageUpload name="image" />

          <FormError message={errors.image} />
        </div> */}

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingGroups ||
              !!categoryGroupError
            }
            className="h-[50px] rounded-none bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Adding Category..."
              : "Add Category"}
          </button>
        </div>
      </form>
    </section>
  );
}