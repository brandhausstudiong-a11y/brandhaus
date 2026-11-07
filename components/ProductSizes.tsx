"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { ProductSize } from "@/types/product";
import { Badge } from "./ui/badge";


interface ProductSizesProps {
  sizes: ProductSize[];
  defaultSize?: string;
  onChange?: (size: ProductSize) => void;
}

export default function ProductSizes({
  sizes,
  defaultSize,
  onChange,
}: ProductSizesProps) {
  const [selected, setSelected] = useState(defaultSize ?? "");

  useEffect(() => {
    if (defaultSize) {
      setSelected(defaultSize);
    }else if (!selected && sizes.length) {
      setSelected(sizes[0].id);
    }
  }, [defaultSize, sizes]);

  const handleChange = (value: string) => {
    setSelected(value);

    const size = sizes.find((s) => s.id === value);

    if (size) {
      onChange?.(size);
    }
  };

  const selectedSize = sizes.find(
    (size) => size.id === selected
  );

  return (
    <div className="space-y-3">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
          Size
        </h3>

        <span className="text-sm font-medium capitalize">
          <Badge variant="secondary">{selectedSize?.name ?? "--"}</Badge>
        </span>
      </div>

      {/* Sizes */}

      <RadioGroup
        value={selected}
        onValueChange={handleChange}
        className="flex flex-wrap gap-2"
      >
        {sizes.map((size) => (
          <label
            key={size.id}
            className={cn(
              "relative flex h-11 md:h-8 min-w-12 md:min-w-9 cursor-pointer items-center justify-center rounded-md border px-4 text-sm font-medium transition-all",
              selected === size.id
                ? "border-black bg-black text-white"
                : "border-border hover:border-black",
            )}
          >
            <RadioGroupItem
              value={size.id}
              className="absolute inset-0 opacity-0"
            />

            {size.label}
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}