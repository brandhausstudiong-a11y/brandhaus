"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { ProductColor } from "@/types/product";
import { Badge } from "./ui/badge";

interface ProductColorsProps {
  colors: ProductColor[];
  defaultColor?: string;
  onChange?: (color: ProductColor) => void;
}

export default function ProductColors({
  colors,
  defaultColor,
  onChange,
}: ProductColorsProps) {
  const [selected, setSelected] = useState(defaultColor ?? "");

  useEffect(() => {
    if (defaultColor) {
      setSelected(defaultColor);
    } else if (!selected && colors.length) {
      setSelected(colors[0].id);
    }
  }, [defaultColor, colors]);

  const handleChange = (value: string) => {
    setSelected(value);

    const color = colors.find((c) => c.id === value);

    if (color) {
      onChange?.(color);
    }
  };

  const selectedColor = colors.find(
    (color) => color.id === selected
  );

  return (
    <div className="space-y-3">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
          Color
        </h3>

        <span className="text-sm font-medium capitalize">
          <Badge variant="secondary">{selectedColor?.label ?? "--"}</Badge>
        </span>
      </div>

      {/* Swatches */}

      <RadioGroup
        value={selected}
        onValueChange={handleChange}
        className="flex flex-wrap gap-3 pl-2"
      >
        {colors.map((color) => {
          const isSelected = selected === color.id;

          return (
            <label
              key={color.id}
              className={cn(
                "relative flex size-9 md:size-6 cursor-pointer items-center justify-center rounded-full transition-all",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                isSelected
                  ? "ring-2 ring-black ring-offset-2"
                  : "hover:scale-110"
              )}
            >
              <RadioGroupItem
                value={color.id}
                className="sr-only"
              />

              <span
                className="absolute inset-0 rounded-full border border-neutral-300"
                style={{
                  backgroundColor: color.hex,
                }}
              />

              {/* {isSelected && (
                <Check
                  className={cn(
                    "relative z-10 size-4",
                    color.value.toLowerCase() === "#ffffff"
                      ? "text-black"
                      : "text-white"
                  )}
                  strokeWidth={3}
                />
              )} */}
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}