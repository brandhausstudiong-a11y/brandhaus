"use client";

import * as React from "react";
// import useSWR from "swr";
import { mutate } from "swr";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Brand {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  featuredImage: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface FormData {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  featuredImage: string;
  sortOrder: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
  shortDescription?: string;
  longDescription?: string;
  featuredImage?: string;
  sortOrder?: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  data?: Brand;
  brand?: Brand;
}

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

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

export default function AddBrand() {
  const [formData, setFormData] =
    React.useState<FormData>({
      name: "",
      slug: "",
      shortDescription: "",
      longDescription: "",
      featuredImage: "",
      sortOrder: "0",
    });

  const [errors, setErrors] =
    React.useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    React.useState(false);

  const [slugManuallyEdited, setSlugManuallyEdited] =
    React.useState(false);

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

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    const name = formData.name.trim();
    const slug = formData.slug.trim();
    const shortDescription =
      formData.shortDescription.trim();
    const longDescription =
      formData.longDescription.trim();

    if (!name) {
      newErrors.name = "Brand name is required.";
    } else if (name.length < 2) {
      newErrors.name =
        "Brand name must be at least 2 characters.";
    } else if (name.length > 100) {
      newErrors.name =
        "Brand name must not exceed 100 characters.";
    }

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

    if (shortDescription.length > 300) {
      newErrors.shortDescription =
        "Short description must not exceed 300 characters.";
    }

    if (longDescription.length > 2000) {
      newErrors.longDescription =
        "Long description must not exceed 2000 characters.";
    }

    const sortOrder = Number(formData.sortOrder);

    if (
      formData.sortOrder !== "" &&
      (!Number.isInteger(sortOrder) || sortOrder < 0)
    ) {
      newErrors.sortOrder =
        "Sort order must be a positive whole number.";
    }

    return newErrors;
  };

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
        "/api/admin/brands",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            shortDescription:
              formData.shortDescription.trim() || null,
            longDescription:
              formData.longDescription.trim() || null,
            featuredImage:
              formData.featuredImage.trim() || null,
            sortOrder:
              Number(formData.sortOrder) || 0,
            isActive: true,
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create brand."
        );
      }

      toast.success(
        data.message || "Brand added successfully."
      );

      setFormData({
        name: "",
        slug: "",
        shortDescription: "",
        longDescription: "",
        featuredImage: "",
        sortOrder: "0",
      });

      setSlugManuallyEdited(false);

      await mutate("/api/admin/brands");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while adding the brand."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
        Add new brand
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Brand Name */}
        <div className="space-y-3">
          <Label
            htmlFor="brand-name"
            className="text-base font-semibold text-neutral-700"
          >
            Brand Name
          </Label>

          <Input
            id="brand-name"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Nike"
            required
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
            htmlFor="brand-slug"
            className="text-base font-semibold text-neutral-700"
          >
            Slug
          </Label>

          <Input
            id="brand-slug"
            name="slug"
            value={formData.slug}
            onChange={handleSlugChange}
            placeholder="nike"
            required
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

        {/* Short Description */}
        <div className="space-y-3">
          <Label
            htmlFor="brand-short-description"
            className="text-base font-semibold text-neutral-700"
          >
            Short Description
          </Label>

          <Textarea
            id="brand-short-description"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="A short description of the brand..."
            className={`min-h-[100px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-lg text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
              errors.shortDescription
                ? "focus-visible:ring-red-500"
                : "focus-visible:ring-neutral-400"
            }`}
          />

          <FormError
            message={errors.shortDescription}
          />
        </div>

        {/* Long Description */}
        <div className="space-y-3">
          <Label
            htmlFor="brand-long-description"
            className="text-base font-semibold text-neutral-700"
          >
            Long Description
          </Label>

          <Textarea
            id="brand-long-description"
            name="longDescription"
            value={formData.longDescription}
            onChange={handleChange}
            placeholder="Tell customers more about this brand..."
            className={`min-h-[160px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-lg text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
              errors.longDescription
                ? "focus-visible:ring-red-500"
                : "focus-visible:ring-neutral-400"
            }`}
          />

          <FormError
            message={errors.longDescription}
          />
        </div>

        {/* Featured Image */}
        <div className="space-y-3">
          <Label
            htmlFor="brand-featured-image"
            className="text-base font-semibold text-neutral-700"
          >
            Featured Image URL
          </Label>

          <Input
            id="brand-featured-image"
            name="featuredImage"
            value={formData.featuredImage}
            onChange={handleChange}
            placeholder="https://..."
            className="h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-lg text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-400"
          />
        </div>

        {/* Sort Order */}
        <div className="space-y-3">
          <Label
            htmlFor="brand-sort-order"
            className="text-base font-semibold text-neutral-700"
          >
            Sort Order
          </Label>

          <Input
            id="brand-sort-order"
            name="sortOrder"
            type="number"
            min={0}
            value={formData.sortOrder}
            onChange={handleChange}
            className="h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-400"
          />

          <FormError message={errors.sortOrder} />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[50px] rounded-none bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Adding Brand..."
              : "Add Brand"}
          </button>
        </div>
      </form>
    </section>
  );
}