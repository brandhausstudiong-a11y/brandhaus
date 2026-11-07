"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  value?: number;
  min?: number;
  max?: number;
  onChange?: (quantity: number) => void;
}

export default function QuantitySelector({
  value = 1,
  min = 1,
  max = 99,
  onChange,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(value);

  useEffect(() => {
    setQuantity(value);
  }, [value]);

  const updateQuantity = (newQuantity: number) => {
    const clamped = Math.min(max, Math.max(min, newQuantity));
    setQuantity(clamped);
    onChange?.(clamped);
  };

  return (
    <div className="space-y-3">
      <div className="inline-flex items-center overflow-hidden rounded-md border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => updateQuantity(quantity - 1)}
          disabled={quantity <= min}
          aria-label="Decrease quantity"
          className="rounded-none border-r h-12"
        >
          <Minus className="size-4" />
        </Button>

        <div className="flex h-10 min-w-14 items-center justify-center px-4 text-sm font-medium">
          {quantity}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => updateQuantity(quantity + 1)}
          disabled={quantity >= max}
          aria-label="Increase quantity"
          className="rounded-none border-l h-12"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}