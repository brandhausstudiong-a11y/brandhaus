"use client";

import * as React from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddColorProps {
  errors?: {
    name?: string;
    label?: string;
    hex?: string;
  };
}

interface FormData {
  name: string;
  label: string;
  hex: string;
}

interface FormErrors {
  name?: string;
  label?: string;
  hex?: string;
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
 * Convert a color name into a clean label.
 *
 * Example:
 * "midnight black" → "Midnight Black"
 */
function generateLabel(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Normalize HEX color.
 *
 * #fff → #FFFFFF
 * #ff0000 → #FF0000
 */
function normalizeHex(value: string) {
  let hex = value.trim();

  if (!hex.startsWith("#")) {
    hex = `#${hex}`;
  }

  return hex.toUpperCase();
}

export function AddColor({
  errors: serverErrors = {},
}: AddColorProps) {
  const [formData, setFormData] =
    React.useState<FormData>({
      name: "",
      label: "",
      hex: "#000000",
    });

  const [errors, setErrors] =
    React.useState<FormErrors>(serverErrors);

  const [isSubmitting, setIsSubmitting] =
    React.useState(false);

  /**
   * Handle color name.
   *
   * The label is automatically generated from
   * the color name.
   */
  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setFormData((prev) => ({
      ...prev,
      name: value,
      label: generateLabel(value),
    }));

    setErrors((prev) => ({
      ...prev,
      name: undefined,
      label: undefined,
    }));
  };

  /**
   * Handle HEX text input.
   */
  const handleHexChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setFormData((prev) => ({
      ...prev,
      hex: value,
    }));

    setErrors((prev) => ({
      ...prev,
      hex: undefined,
    }));
  };

  /**
   * Handle native color picker.
   */
  const handleColorPickerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.toUpperCase();

    setFormData((prev) => ({
      ...prev,
      hex: value,
    }));

    setErrors((prev) => ({
      ...prev,
      hex: undefined,
    }));
  };

  /**
   * Validate form.
   */
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    const name = formData.name.trim();
    const label = formData.label.trim();
    const hex = normalizeHex(formData.hex);

    /*
     * Name validation
     */
    if (!name) {
      newErrors.name = "Color name is required.";
    } else if (name.length < 2) {
      newErrors.name =
        "Color name must be at least 2 characters.";
    } else if (name.length > 100) {
      newErrors.name =
        "Color name must not exceed 100 characters.";
    }

    /*
     * Label validation
     */
    if (!label) {
      newErrors.label = "Color label is required.";
    } else if (label.length < 2) {
      newErrors.label =
        "Color label must be at least 2 characters.";
    } else if (label.length > 100) {
      newErrors.label =
        "Color label must not exceed 100 characters.";
    }

    /*
     * HEX validation
     *
     * Supports:
     * #FFF
     * #FFFFFF
     */
    if (!hex) {
      newErrors.hex = "Hex color is required.";
    } else if (
      !/^#([A-F0-9]{3}|[A-F0-9]{6})$/i.test(hex)
    ) {
      newErrors.hex =
        "Enter a valid HEX color, e.g. #000000.";
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
        "/api/admin/colors",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            label: formData.label.trim(),
            hex: normalizeHex(formData.hex),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }

        throw new Error(
          data.message ||
            "Failed to create product color."
        );
      }

      toast.success(
        data.message ||
          "Product color added successfully."
      );

      /*
       * Reset form.
       */
      setFormData({
        name: "",
        label: "",
        hex: "#000000",
      });

      setErrors({});

      /*
       * IMPORTANT:
       * Refresh the ProductColorList SWR cache.
       */
      await mutate("/api/admin/colors");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while adding the color."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      {/* General Information */}
      <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950 capitalize">
        Add new color
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Color Name */}
        <div className="space-y-3">
          <Label
            htmlFor="color-name"
            className="text-base font-semibold text-neutral-700"
          >
            Color Name
          </Label>

          <Input
            id="color-name"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Midnight Black"
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

        {/* Color Label */}
        <div className="space-y-3">
          <Label
            htmlFor="color-label"
            className="text-base font-semibold text-neutral-700"
          >
            Color Label
          </Label>

          <Input
            id="color-label"
            name="label"
            value={formData.label}
            onChange={(event) => {
              const value = event.target.value;

              setFormData((prev) => ({
                ...prev,
                label: value,
              }));

              setErrors((prev) => ({
                ...prev,
                label: undefined,
              }));
            }}
            placeholder="Midnight Black"
            required
            disabled={isSubmitting}
            aria-invalid={!!errors.label}
            className={`h-[50px] rounded-none border-0 bg-neutral-200 px-8 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-1 ${
              errors.label
                ? "focus-visible:ring-red-500"
                : "focus-visible:ring-neutral-400"
            }`}
          />

          <FormError message={errors.label} />
        </div>

        {/* Color Hex Code */}
        <div className="space-y-3">
          <Label
            htmlFor="color-hex"
            className="text-base font-semibold text-neutral-700"
          >
            Color Hex Code
          </Label>

          <div
            className={`flex h-[50px] items-center bg-neutral-200 ${
              errors.hex
                ? "ring-1 ring-red-500"
                : ""
            }`}
          >
            {/* Color Picker */}
            <div className="relative h-full w-[60px] shrink-0 overflow-hidden">
              <input
                type="color"
                id="color-picker"
                value={
                  /^#[0-9A-Fa-f]{6}$/.test(
                    formData.hex
                  )
                    ? formData.hex
                    : "#000000"
                }
                onChange={handleColorPickerChange}
                disabled={isSubmitting}
                className="absolute inset-0 h-[100px] w-[100px] cursor-pointer -translate-x-5 -translate-y-5 border-0 p-0 disabled:cursor-not-allowed"
              />
            </div>

            {/* Hex Input */}
            <Input
              id="color-hex"
              name="hex"
              value={formData.hex}
              onChange={handleHexChange}
              onBlur={() => {
                if (formData.hex.trim()) {
                  setFormData((prev) => ({
                    ...prev,
                    hex: normalizeHex(prev.hex),
                  }));
                }
              }}
              placeholder="#000000"
              required
              disabled={isSubmitting}
              aria-invalid={!!errors.hex}
              className="h-full rounded-none border-0 bg-transparent px-4 text-xl text-neutral-700 shadow-none placeholder:text-neutral-500 focus-visible:ring-0"
            />
          </div>

          <FormError message={errors.hex} />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[50px] rounded-none bg-green-600 px-8 text-base font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Adding Color..."
              : "Add Color"}
          </button>
        </div>
      </form>
    </section>
  );
}