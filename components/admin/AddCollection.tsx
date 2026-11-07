"use client";

import * as React from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { mutate } from "swr";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


// ============================================================
// TYPES
// ============================================================

export type CollectionItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
};

interface AddCollectionProps {
  onSuccess?: () => void;
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
  coverImage?: string;
}


// ============================================================
// HELPERS
// ============================================================

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


// ============================================================
// FORM ERROR
// ============================================================

function FormError({
  message,
}: {
  message?: string;
}) {
  if (!message) return null;

  return (
    <p className="text-sm font-medium text-red-600">
      {message}
    </p>
  );
}


// ============================================================
// COMPONENT
// ============================================================

export function AddCollection({
  onSuccess,
}: AddCollectionProps) {

  // ----------------------------------------------------------
  // Form state
  // ----------------------------------------------------------

  const [formData, setFormData] =
    React.useState<FormData>({
      name: "",
      slug: "",
      description: "",
    });

  const [errors, setErrors] =
    React.useState<FormErrors>({});


  // ----------------------------------------------------------
  // Image state
  // ----------------------------------------------------------

  const [coverImageFile, setCoverImageFile] =
    React.useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    React.useState<string>("");


  // ----------------------------------------------------------
  // Submission state
  // ----------------------------------------------------------

  const [isSubmitting, setIsSubmitting] =
    React.useState(false);


  // ----------------------------------------------------------
  // Track whether slug was manually edited
  // ----------------------------------------------------------

  const [slugManuallyEdited, setSlugManuallyEdited] =
    React.useState(false);


  // ==========================================================
  // CLEANUP IMAGE PREVIEW
  // ==========================================================

  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);


  // ==========================================================
  // NAME CHANGE
  // ==========================================================

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const value = event.target.value;

    setFormData((current) => ({
      ...current,
      name: value,

      slug: slugManuallyEdited
        ? current.slug
        : generateSlug(value),
    }));

    setErrors((current) => ({
      ...current,
      name: undefined,
    }));
  };


  // ==========================================================
  // SLUG CHANGE
  // ==========================================================

  const handleSlugChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const value = event.target.value;

    setSlugManuallyEdited(true);

    setFormData((current) => ({
      ...current,
      slug: generateSlug(value),
    }));

    setErrors((current) => ({
      ...current,
      slug: undefined,
    }));
  };


  // ==========================================================
  // DESCRIPTION CHANGE
  // ==========================================================

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {

    const value = event.target.value;

    setFormData((current) => ({
      ...current,
      description: value,
    }));

    setErrors((current) => ({
      ...current,
      description: undefined,
    }));
  };


  // ==========================================================
  // IMAGE CHANGE
  // ==========================================================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = event.target.files?.[0];

    if (!file) return;


    // --------------------------------------------------------
    // Validate file type
    // --------------------------------------------------------

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {

      setErrors((current) => ({
        ...current,
        coverImage:
          "Please upload a PNG, JPG or WEBP image.",
      }));

      event.target.value = "";

      return;
    }


    // --------------------------------------------------------
    // Validate file size
    // --------------------------------------------------------

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {

      setErrors((current) => ({
        ...current,
        coverImage:
          "Image must be smaller than 10MB.",
      }));

      event.target.value = "";

      return;
    }


    // --------------------------------------------------------
    // Create preview
    // --------------------------------------------------------

    const previewUrl =
      URL.createObjectURL(file);

    setCoverImageFile(file);
    setImagePreview(previewUrl);

    setErrors((current) => ({
      ...current,
      coverImage: undefined,
    }));

  };


  // ==========================================================
  // REMOVE IMAGE
  // ==========================================================

  const removeImage = () => {

    setCoverImageFile(null);
    setImagePreview("");

    const input =
      document.getElementById(
        "collection-cover-image"
      ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }

    setErrors((current) => ({
      ...current,
      coverImage: undefined,
    }));
  };


  // ==========================================================
  // VALIDATE FORM
  // ==========================================================

  const validate = () => {

    const newErrors: FormErrors = {};


    // --------------------------------------------------------
    // Name
    // --------------------------------------------------------

    const name =
      formData.name.trim();

    if (!name) {

      newErrors.name =
        "Collection name is required.";

    } else if (name.length < 2) {

      newErrors.name =
        "Collection name must be at least 2 characters.";

    } else if (name.length > 100) {

      newErrors.name =
        "Collection name cannot exceed 100 characters.";

    }


    // --------------------------------------------------------
    // Slug
    // --------------------------------------------------------

    const slug =
      formData.slug.trim();

    if (!slug) {

      newErrors.slug =
        "Slug is required.";

    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {

      newErrors.slug =
        "Slug can only contain lowercase letters, numbers and hyphens.";

    } else if (slug.length > 120) {

      newErrors.slug =
        "Slug cannot exceed 120 characters.";

    }


    // --------------------------------------------------------
    // Description
    // --------------------------------------------------------

    if (formData.description.length > 1000) {

      newErrors.description =
        "Description cannot exceed 1000 characters.";

    }


    // --------------------------------------------------------
    // Cover image
    // --------------------------------------------------------

    if (!coverImageFile) {

      newErrors.coverImage =
        "Cover image is required.";

    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (!validate()) {
      return;
    }


    setIsSubmitting(true);


    try {

      // ------------------------------------------------------
      // Build multipart form data
      // ------------------------------------------------------

      const payload = new FormData();

      payload.append(
        "name",
        formData.name.trim()
      );

      payload.append(
        "slug",
        formData.slug.trim()
      );

      payload.append(
        "description",
        formData.description.trim()
      );

      if (coverImageFile) {
        payload.append(
          "coverImage",
          coverImageFile
        );
      }


      // ------------------------------------------------------
      // Submit
      // ------------------------------------------------------


      const response = await fetch(
        "/api/admin/collections",
        {
          method: "POST",
          body: payload,
        }
      );

      const result = await response.json();


      // ------------------------------------------------------
      // Handle API errors
      // ------------------------------------------------------

      if (!response.ok) {

        throw new Error(
          result.message ||
          "Failed to create collection."
        );
      }


      // ------------------------------------------------------
      // Success
      // ------------------------------------------------------

      toast.success(
        "Collection created successfully."
      );


      // ------------------------------------------------------
      // Refresh collection list
      // ------------------------------------------------------

      await mutate(
        "/api/admin/collections"
      );


      // ------------------------------------------------------
      // Reset form
      // ------------------------------------------------------

      setFormData({
        name: "",
        slug: "",
        description: "",
      });

      setErrors({});

      setCoverImageFile(null);

      setImagePreview("");

      setSlugManuallyEdited(false);


      // ------------------------------------------------------
      // Reset file input
      // ------------------------------------------------------

      const input =
        document.getElementById(
          "collection-cover-image"
        ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }


      // ------------------------------------------------------
      // Callback
      // ------------------------------------------------------

      onSuccess?.();


    } catch (error) {

      console.error(
        "Create collection error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create collection."
      );

    } finally {

      setIsSubmitting(false);

    }
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="
        grid
        grid-cols-1
        gap-4
        lg:grid-cols-2
        xl:grid-cols-3
        2xl:grid-cols-4
      "
    >

      {/* =====================================================
          COLLECTION DETAILS
      ====================================================== */}

      <section
        className="
          rounded-lg
          bg-primary-foreground
          p-4
          lg:col-span-2
          xl:col-span-2
          2xl:col-span-2
        "
      >

        <h2
          className="
            mb-12
            text-2xl
            font-medium
            tracking-tight
            text-neutral-950
          "
        >
          Add new collection
        </h2>


        <div className="space-y-8">

          {/* =================================================
              NAME
          ================================================= */}

          <div className="space-y-3">

            <Label
              htmlFor="collection-name"
              className="
                text-base
                font-semibold
                text-neutral-700
              "
            >
              Collection Name
            </Label>

            <Input
              id="collection-name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Summer Collection"
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              className={`
                h-[50px]
                rounded-none
                border-0
                bg-neutral-200
                px-8
                text-xl
                text-neutral-700
                shadow-none
                placeholder:text-neutral-500
                focus-visible:ring-1
                ${
                  errors.name
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }
              `}
            />

            <FormError
              message={errors.name}
            />

          </div>


          {/* =================================================
              SLUG
          ================================================= */}

          <div className="space-y-3">

            <Label
              htmlFor="collection-slug"
              className="
                text-base
                font-semibold
                text-neutral-700
              "
            >
              Slug
            </Label>

            <Input
              id="collection-slug"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="summer-collection"
              disabled={isSubmitting}
              aria-invalid={!!errors.slug}
              className={`
                h-[50px]
                rounded-none
                border-0
                bg-neutral-200
                px-8
                text-xl
                text-neutral-700
                shadow-none
                placeholder:text-neutral-500
                focus-visible:ring-1
                ${
                  errors.slug
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }
              `}
            />

            <FormError
              message={errors.slug}
            />

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="space-y-3">

            <Label
              htmlFor="collection-description"
              className="
                text-base
                font-semibold
                text-neutral-700
              "
            >
              Description
            </Label>

            <Textarea
              id="collection-description"
              name="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Describe this collection..."
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
              className={`
                min-h-[160px]
                resize-none
                rounded-none
                border-0
                bg-neutral-200
                px-8
                py-5
                text-xl
                text-neutral-700
                shadow-none
                placeholder:text-neutral-500
                focus-visible:ring-1
                ${
                  errors.description
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-neutral-400"
                }
              `}
            />

            <FormError
              message={errors.description}
            />

          </div>


          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="pt-2">

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                flex
                h-[50px]
                items-center
                justify-center
                gap-2
                rounded-none
                bg-green-600
                px-8
                text-base
                font-semibold
                text-white
                transition-colors
                hover:bg-green-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Collection"
              )}

            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          COVER IMAGE
      ====================================================== */}

      <section
        className="
          rounded-lg
          bg-primary-foreground
          p-4
          2xl:col-span-2
        "
      >

        <div className="space-y-3">

          <Label
            htmlFor="collection-cover-image"
            className="
              text-base
              font-semibold
              text-neutral-700
            "
          >
            Cover Image
          </Label>


          <div
            className={`
              relative
              flex
              min-h-[220px]
              items-center
              justify-center
              overflow-hidden
              bg-neutral-200
              ${
                errors.coverImage
                  ? "ring-1 ring-red-500"
                  : ""
              }
            `}
          >

            {imagePreview ? (

              <>
                {/* Preview */}

                <img
                  src={imagePreview}
                  alt="Collection cover preview"
                  className="
                    h-[220px]
                    w-full
                    object-cover
                  "
                />


                {/* Remove */}

                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isSubmitting}
                  className="
                    absolute
                    right-3
                    top-3
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-neutral-700
                    shadow-sm
                    transition-colors
                    hover:bg-neutral-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                  aria-label="Remove cover image"
                >
                  <X className="size-5" />
                </button>

              </>

            ) : (

              <label
                htmlFor="collection-cover-image"
                className="
                  flex
                  h-full
                  min-h-[220px]
                  w-full
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  gap-3
                  text-neutral-500
                  transition-colors
                  hover:bg-neutral-300
                "
              >

                <ImagePlus className="size-8" />

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
              disabled={isSubmitting}
              className="sr-only"
            />

          </div>


          <FormError
            message={errors.coverImage}
          />

        </div>

      </section>

    </form>
  );
}