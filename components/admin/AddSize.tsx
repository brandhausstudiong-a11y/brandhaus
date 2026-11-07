"use client";

import * as React from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddSizeProps {
  errors?: {
    name?: string;
    label?: string;
  };
}

interface FormData {
  name: string;
  label: string;
}

interface FormErrors {
  name?: string;
  label?: string;
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
 * Converts a size name into a display label.
 *
 * Examples:
 * "extra large" -> "XL"
 * "extra small" -> "XS"
 * "medium"      -> "M"
 * "large"       -> "L"
 * "small"       -> "S"
 * "double extra large" -> "XXL"
 */
function generateSizeLabel(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const sizeLabels: Record<string, string> = {
    "extra small": "XS",
    "small": "S",
    medium: "M",
    large: "L",
    "extra large": "XL",
    "double extra large": "XXL",
    "triple extra large": "XXXL",
    "extra extra small": "XXS",
  };

  return sizeLabels[normalized] ?? "";
}

export function AddSize({ errors = {} }: AddSizeProps) {
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    label: "",
  });

  const [formErrors, setFormErrors] =
    React.useState<FormErrors>(errors);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  /**
   * Update a form field
   */
  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  /**
   * Handle size name change.
   *
   * Automatically generates the label when the label
   * has not been manually customized.
   */
  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const name = event.target.value;

    setFormData((prev) => ({
      ...prev,
      name,
      label:
        !prev.label || prev.label === generateSizeLabel(prev.name)
          ? generateSizeLabel(name)
          : prev.label,
    }));

    setFormErrors((prev) => ({
      ...prev,
      name: undefined,
    }));
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Size name is required.";
    } else if (formData.name.trim().length < 1) {
      newErrors.name = "Size name is invalid.";
    }

    if (!formData.label.trim()) {
      newErrors.label = "Label is required.";
    }

    setFormErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Submit
   */
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/admin/sizes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          label: formData.label.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to add product size."
        );
      }

      toast.success("Product size added successfully.");

      // Refresh the Product Size List
      await mutate("/api/admin/sizes");

      // Reset form
      setFormData({
        name: "",
        label: "",
      });

      setFormErrors({});
    } catch (error) {
      console.error("Add product size error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add product size."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="">
      {/* General Information */}
      <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950 capitalize">
        Add new size
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Size Name */}
          <div className="space-y-3">
            <Label
              htmlFor="size-name"
              className="text-base font-semibold text-neutral-700"
            >
              Size Name
            </Label>

            <Input
              id="size-name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Extra Large"
              disabled={isSubmitting}
              aria-invalid={!!formErrors.name}
              className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                formErrors.name
                  ? "focus-visible:ring-red-500"
                  : "focus-visible:ring-neutral-400"
              }`}
            />

            <FormError message={formErrors.name} />
          </div>

          {/* Label */}
          <div className="space-y-3">
            <Label
              htmlFor="size-label"
              className="text-base font-semibold text-neutral-700"
            >
              Label
            </Label>

            <Input
              id="size-label"
              name="label"
              value={formData.label}
              onChange={(event) =>
                handleChange("label", event.target.value)
              }
              placeholder="XL"
              disabled={isSubmitting}
              aria-invalid={!!formErrors.label}
              className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
                formErrors.label
                  ? "focus-visible:ring-red-500"
                  : "focus-visible:ring-neutral-400"
              }`}
            />

            <FormError message={formErrors.label} />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[50px] rounded-none bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Adding..." : "Add Size"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}