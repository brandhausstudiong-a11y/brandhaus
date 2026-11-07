"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

const MAX_IMAGES = 8;

interface ProductImageUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  error?: string;
  disabled?: boolean;
}

export function ProductImageUpload({
  files,
  onFilesChange,
  error,
  disabled = false,
}: ProductImageUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [previews, setPreviews] = useState<
    string[]
  >([]);

  /* ------------------------------------------------------------------------ */
  /* Create Previews                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const urls = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(urls);

    return () => {
      urls.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [files]);

  /* ------------------------------------------------------------------------ */
  /* File Picker                                                              */
  /* ------------------------------------------------------------------------ */

  const openFilePicker = () => {
    if (disabled) return;

    inputRef.current?.click();
  };

  /* ------------------------------------------------------------------------ */
  /* Upload Selection                                                         */
  /* ------------------------------------------------------------------------ */

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (disabled) return;

    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (!selectedFiles.length) return;

    const remainingSlots =
      MAX_IMAGES - files.length;

    const acceptedFiles = selectedFiles
      .filter((file) => {
        if (!file.type.startsWith("image/")) {
          // toastError(
          //   `${file.name} is not an image.`
          // );
          toast.error(`${file.name} is not an image.`);

          return false;
        }

        // 10MB per image
        if (file.size > 10 * 1024 * 1024) {
          // toastError(
          //   `${file.name} is larger than 10MB.`
          // );
          toast.error(`${file.name} is larger than 10MB.`);

          return false;
        }

        return true;
      })
      .slice(0, remainingSlots);

    if (!acceptedFiles.length) {
      event.target.value = "";
      return;
    }

    onFilesChange([
      ...files,
      ...acceptedFiles,
    ]);

    event.target.value = "";
  };

  /* ------------------------------------------------------------------------ */
  /* Remove Image                                                              */
  /* ------------------------------------------------------------------------ */

  const removeImage = (index: number) => {
    if (disabled) return;

    onFilesChange(
      files.filter((_, i) => i !== index)
    );
  };

  return (
    <section className="w-full">
      {/* Header */}
      <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
        Upload Images
      </h2>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleImageUpload}
        disabled={disabled}
        className="hidden"
      />

      {/* Cover */}
      {previews.length > 0 && (
        <div className="mb-8">
          <div className="relative w-full overflow-hidden bg-neutral-200">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={previews[0]}
                alt="Product cover preview"
                fill
                className="object-contain"
                unoptimized
              />

              <button
                type="button"
                onClick={() =>
                  removeImage(0)
                }
                disabled={disabled}
                className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-neutral-950/80 text-white transition hover:bg-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Remove cover image"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              <span className="text-2xl font-normal text-neutral-950">
                Cover
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Image Slots */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({
          length: MAX_IMAGES,
        }).map((_, index) => {
          const preview = previews[index];

          return (
            <div
              key={index}
              className="relative aspect-square overflow-hidden bg-neutral-200"
            >
              {preview ? (
                <>
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={disabled}
                    className="relative block size-full cursor-pointer disabled:cursor-not-allowed"
                    aria-label={`Replace image ${
                      index + 1
                    }`}
                  >
                    <Image
                      src={preview}
                      alt={`Product image ${
                        index + 1
                      }`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeImage(index)
                    }
                    disabled={disabled}
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-neutral-950/80 text-white transition hover:bg-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remove image ${
                      index + 1
                    }`}
                  >
                    <X className="size-3.5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={
                    disabled ||
                    files.length >=
                      MAX_IMAGES
                  }
                  className="flex size-full items-center justify-center bg-neutral-200 transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Upload product image"
                >
                  <span className="flex size-16 items-center justify-center rounded-full bg-emerald-300 text-white">
                    <Plus
                      className="size-10"
                      strokeWidth={2}
                    />
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {/* Helper */}
      <p className="mt-5 text-sm text-neutral-500">
        Upload up to {MAX_IMAGES} images.
        Maximum 10MB per image. The first image
        will be used as the product cover.
      </p>
    </section>
  );
}
