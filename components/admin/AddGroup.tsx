"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { mutate } from "swr";

interface AddGroupProps {
  errors?: {
    name?: string;
    slug?: string;
    description?: string;
  };
}

interface FormData {
  name: string;
  slug: string;
  description: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

export function AddGroup({ errors: serverErrors = {} }: AddGroupProps) {
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    slug: "",
    description: "",
  });

  const [errors, setErrors] =
    React.useState<FormErrors>(serverErrors);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Convert a group name into a slug
  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for the field being edited
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const name = e.target.value.toLowerCase();

    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));

    setErrors((prev) => ({
      ...prev,
      name: undefined,
      slug: undefined,
    }));
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    const name = formData.name.trim();
    const slug = formData.slug.trim();
    const description = formData.description.trim();

    if (!name) {
      newErrors.name = "Group name is required.";
    } else if (name.length < 3) {
      newErrors.name = "Group name must be at least 3 characters.";
    } else if (name.length > 100) {
      newErrors.name = "Group name must not exceed 100 characters.";
    }

    if (!slug) {
      newErrors.slug = "Slug is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens.";
    } else if (slug.length > 100) {
      newErrors.slug = "Slug must not exceed 100 characters.";
    }

    if (description.length > 500) {
      newErrors.description =
        "Description must not exceed 500 characters.";
    }

    return newErrors;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Validate before making the API request
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      toast.error("Please fix the errors in the form.");

      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const request = fetch("/api/admin/category-groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
      }),
    }).then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors returned by the API
        if (data.errors) {
          setErrors(data.errors);
        }

        throw new Error(
          data.message || "Failed to create category group."
        );
      }

      return data;
    });

    toast.promise(request, {
      loading: "Adding Group...",
      success: (data) => {
        // Reset the form after successful creation
        setFormData({
          name: "",
          slug: "",
          description: "",
        });

        return data.message || "Group added successfully.";
      },
      error: (error) => {
        return error instanceof Error
          ? error.message
          : "Something went wrong while adding the group.";
      },
    });

    try {
      await request;
      await mutate("/api/admin/category-groups");
    } catch {
      // Error is already handled by toast.promise()
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950 capitalize">
        Add new group
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Group Name */}
        <div className="space-y-3">
          <Label
            htmlFor="group-name"
            className="text-base font-semibold text-neutral-700"
          >
            Group Name
          </Label>

          <Input
            id="group-name"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Clothing"
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
            htmlFor="group-slug"
            className="text-base font-semibold text-neutral-700"
          >
            Slug
          </Label>

          <Input
            id="group-slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="clothing"
            disabled={isSubmitting}
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
            htmlFor="group-description"
            className="text-base font-semibold text-neutral-700"
          >
            Description
          </Label>

          <Textarea
            id="group-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe this product group..."
            disabled={isSubmitting}
            aria-invalid={!!errors.description}
            className={`min-h-[120px] resize-none rounded-none border-0 bg-neutral-200 px-8 py-5 text-lg text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
              errors.description
                ? "focus-visible:ring-red-500"
                : "focus-visible:ring-neutral-400"
            }`}
          />

          <FormError message={errors.description} />
        </div>

        {/* Submit Button */}
        <div className="mt-6 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[50px] rounded-none bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Adding Group..." : "Add Group"}
          </button>
        </div>
      </form>
    </section>
  );
}
