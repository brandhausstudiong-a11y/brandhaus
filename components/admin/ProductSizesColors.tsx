"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const availableSizes = ["XS", "SM", "M", "L", "XL", "XXL"];

const availableColors = [
  {
    name: "Green",
    value: "#20E98A",
  },
  {
    name: "White",
    value: "#FFFFFF",
  },
  {
    name: "Red",
    value: "#FF1616",
  },
  {
    name: "Black",
    value: "#000000",
  },
  {
    name: "Orange",
    value: "#FF4B24",
  },
  {
    name: "Blue",
    value: "#2563EB",
  },
];

interface ProductSizesColorsProps {
  errors?: {
    sizes?: string;
    colors?: string;
  };
}

export function ProductSizesColors({
  errors = {},
}: ProductSizesColorsProps) {
  const [openPanel, setOpenPanel] = useState<"sizes" | "colors" | null>(
    null
  );

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [tempSizes, setTempSizes] = useState<string[]>([]);
  const [tempColors, setTempColors] = useState<string[]>([]);

  /*
   * Open Sizes panel
   */
  const openSizesPanel = () => {
    setTempSizes(selectedSizes);
    setOpenPanel("sizes");
  };

  /*
   * Open Colors panel
   */
  const openColorsPanel = () => {
    setTempColors(selectedColors);
    setOpenPanel("colors");
  };

  /*
   * Toggle size
   */
  const toggleSize = (size: string) => {
    setTempSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size]
    );
  };

  /*
   * Toggle color
   */
  const toggleColor = (color: string) => {
    setTempColors((current) =>
      current.includes(color)
        ? current.filter((item) => item !== color)
        : [...current, color]
    );
  };

  /*
   * Save selected sizes
   */
  const addSizes = () => {
    setSelectedSizes(tempSizes);
    setOpenPanel(null);
  };

  /*
   * Save selected colors
   */
  const addColors = () => {
    setSelectedColors(tempColors);
    setOpenPanel(null);
  };

  return (
    <>
      {/* Sizes & Colors */}
      <section className="w-full">
        <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950">
          Sizes &amp; Colors
        </h2>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          {/* =========================
              SIZES
          ========================== */}
          <div>
            <h3 className="mb-5 text-base font-semibold text-neutral-700">
              Sizes
            </h3>

            {/* Trigger */}
            <button
              type="button"
              onClick={openSizesPanel}
              className="group flex items-center gap-3"
            >
              <span className="text-lg text-neutral-500 transition-colors group-hover:text-neutral-800">
                Pick available sizes
              </span>

              <span className="flex size-7 items-center justify-center rounded-full border-2 border-emerald-300 text-emerald-400 transition-colors group-hover:bg-emerald-300 group-hover:text-white">
                <Plus className="size-5" strokeWidth={2} />
              </span>
            </button>

            {/* Selected Sizes */}
            {selectedSizes.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {selectedSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={openSizesPanel}
                    className="flex h-16 min-w-16 items-center justify-center bg-neutral-200 px-5 text-lg font-normal text-neutral-600 transition-colors hover:bg-neutral-300"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

            {errors.sizes && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {errors.sizes}
              </p>
            )}
          </div>

          {/* =========================
              COLORS
          ========================== */}
          <div>
            <h3 className="mb-5 text-base font-semibold text-neutral-700">
              Colors
            </h3>

            {/* Trigger */}
            <button
              type="button"
              onClick={openColorsPanel}
              className="group flex items-center gap-3"
            >
              <span className="text-lg text-neutral-500 transition-colors group-hover:text-neutral-800">
                Pick available colors
              </span>

              <span className="flex size-7 items-center justify-center rounded-full border-2 border-emerald-300 text-emerald-400 transition-colors group-hover:bg-emerald-300 group-hover:text-white">
                <Plus className="size-5" strokeWidth={2} />
              </span>
            </button>

            {/* Selected Colors */}
            {selectedColors.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {selectedColors.map((colorName) => {
                  const color = availableColors.find(
                    (item) => item.name === colorName
                  );

                  if (!color) return null;

                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={openColorsPanel}
                      aria-label={color.name}
                      className="size-10 border border-neutral-300 transition-transform hover:scale-105"
                      style={{
                        backgroundColor: color.value,
                      }}
                    />
                  );
                })}
              </div>
            )}

            {errors.colors && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {errors.colors}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SIZES DIALOG
      ====================================================== */}
      <Dialog
        open={openPanel === "sizes"}
        onOpenChange={(open) => {
          if (!open) setOpenPanel(null);
        }}
      >
        <DialogContent className="max-w-2xl rounded-xl border-0 bg-neutral-100 p-8 sm:p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-medium tracking-tight text-neutral-950">
              Pick Available Sizes
            </DialogTitle>
          </DialogHeader>

          <div className="mt-8">
            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size) => {
                const isSelected = tempSizes.includes(size);

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`flex h-16 min-w-16 items-center justify-center px-5 text-lg transition-colors ${
                      isSelected
                        ? "bg-neutral-950 text-white"
                        : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button
              type="button"
              onClick={addSizes}
              className="h-16 min-w-56 rounded-md bg-emerald-300 px-8 text-lg font-medium text-white transition-colors hover:bg-emerald-400"
            >
              Add Sizes
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          COLORS DIALOG
      ====================================================== */}
      <Dialog
        open={openPanel === "colors"}
        onOpenChange={(open) => {
          if (!open) setOpenPanel(null);
        }}
      >
        <DialogContent className="max-w-3xl rounded-xl border-0 bg-neutral-100 p-8 sm:p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-medium tracking-tight text-neutral-950">
              Pick Available Colors
            </DialogTitle>
          </DialogHeader>

          <div className="mt-8">
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => {
                const isSelected = tempColors.includes(color.name);

                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => toggleColor(color.name)}
                    className={`flex h-16 items-center gap-5 bg-neutral-200 px-4 pr-7 transition-all ${
                      isSelected
                        ? "ring-2 ring-emerald-300"
                        : "hover:bg-neutral-300"
                    }`}
                  >
                    {/* Color Swatch */}
                    <span
                      className="size-8 shrink-0 border border-neutral-300"
                      style={{
                        backgroundColor: color.value,
                      }}
                    />

                    {/* Color Name */}
                    <span className="text-lg text-neutral-600">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button
              type="button"
              onClick={addColors}
              className="h-16 min-w-64 rounded-md bg-emerald-300 px-8 text-lg font-medium text-white transition-colors hover:bg-emerald-400"
            >
              Add Colors
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}