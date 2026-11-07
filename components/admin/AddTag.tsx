"use client";

import * as React from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  name: string;
  slug: string;
  sortOrder: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
  sortOrder?: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
  errors?: FormErrors;
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

export default function AddTag() {
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    slug: "",
    sortOrder: "0",
  });

  const [errors, setErrors] =
    React.useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    React.useState(false);

  const [slugManuallyEdited, setSlugManuallyEdited] =
    React.useState(false);

  /*
   * Handle tag name
   */
  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const name = event.target.value;

    setFormData((previous) => ({
      ...previous,
      name,
      ...(slugManuallyEdited
        ? {}
        : { slug: generateSlug(name) }),
    }));

    setErrors((previous) => ({
      ...previous,
      name: undefined,
      slug: undefined,
    }));
  };

  /*
   * Handle slug
   */
  const handleSlugChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const slug = event.target.value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

    setSlugManuallyEdited(true);

    setFormData((previous) => ({
      ...previous,
      slug,
    }));

    setErrors((previous) => ({
      ...previous,
      slug: undefined,
    }));
  };

  /*
   * Handle sort order
   */
  const handleSortOrderChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    // Allow the input to be empty while editing.
    if (value === "") {
      setFormData((previous) => ({
        ...previous,
        sortOrder: "",
      }));

      return;
    }

    if (!/^\d+$/.test(value)) return;

    setFormData((previous) => ({
      ...previous,
      sortOrder: value,
    }));

    setErrors((previous) => ({
      ...previous,
      sortOrder: undefined,
    }));
  };

  /*
   * Validate form
   */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const name = formData.name.trim();
    const slug = formData.slug.trim();

    if (!name) {
      newErrors.name = "Tag name is required.";
    } else if (name.length < 2) {
      newErrors.name =
        "Tag name must be at least 2 characters.";
    } else if (name.length > 100) {
      newErrors.name =
        "Tag name must not exceed 100 characters.";
    }

    if (!slug) {
      newErrors.slug = "Slug is required.";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {
      newErrors.slug =
        "Use lowercase letters, numbers, and hyphens only.";
    } else if (slug.length > 100) {
      newErrors.slug =
        "Slug must not exceed 100 characters.";
    }

    if (
      formData.sortOrder !== "" &&
      (!/^\d+$/.test(formData.sortOrder) ||
        Number(formData.sortOrder) < 0)
    ) {
      newErrors.sortOrder =
        "Sort order must be a non-negative number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * Submit
   */
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/admin/tags",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            sortOrder:
              formData.sortOrder === ""
                ? 0
                : Number(formData.sortOrder),
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }

        throw new Error(
          data.message ||
            data.error ||
            "Failed to create tag."
        );
      }

      toast.success(
        data.message || "Tag added successfully."
      );

      /*
       * Reset form
       */
      setFormData({
        name: "",
        slug: "",
        sortOrder: "0",
      });

      setErrors({});
      setSlugManuallyEdited(false);

      /*
       * Refresh TagList
       */
      await mutate("/api/admin/tags");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while adding the tag."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
        Add new tag
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Name */}
        <div className="space-y-3">
          <Label
            htmlFor="tag-name"
            className="text-base font-semibold text-neutral-700"
          >
            Tag Name
          </Label>

          <Input
            id="tag-name"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="New Arrival"
            required
            disabled={isSubmitting}
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
            htmlFor="tag-slug"
            className="text-base font-semibold text-neutral-700"
          >
            Slug
          </Label>

          <Input
            id="tag-slug"
            name="slug"
            value={formData.slug}
            onChange={handleSlugChange}
            placeholder="new-arrival"
            required
            disabled={isSubmitting}
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

        {/* Sort Order */}
        <div className="space-y-3">
          <Label
            htmlFor="tag-sort-order"
            className="text-base font-semibold text-neutral-700"
          >
            Sort Order
          </Label>

          <Input
            id="tag-sort-order"
            name="sortOrder"
            type="number"
            min="0"
            value={formData.sortOrder}
            onChange={handleSortOrderChange}
            placeholder="0"
            disabled={isSubmitting}
            aria-invalid={!!errors.sortOrder}
            className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
              errors.sortOrder
                ? "focus-visible:ring-red-500"
                : "focus-visible:ring-neutral-400"
            }`}
          />

          <p className="text-sm text-neutral-500">
            Lower numbers appear first.
          </p>

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
              ? "Adding Tag..."
              : "Add Tag"}
          </button>
        </div>
      </form>
    </section>
  );
}