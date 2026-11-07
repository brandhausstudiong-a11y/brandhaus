"use client";

import { Minus, Plus } from "lucide-react";
import { useAppDispatch } from "@/lib/hooks";
import {
  increaseQuantity,
  decreaseQuantity,
} from "@/lib/features/cart/cartSlice";

interface CartQuantitySelectorProps {
  cartId: string;
  quantity: number;
}

export default function CartQuantitySelector({
  cartId,
  quantity,
}: CartQuantitySelectorProps) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => dispatch(decreaseQuantity({ cartId }))}
        className="flex h-7 w-7 items-center justify-center rounded-full border transition hover:scale-95 active:scale-95"
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>

      <span className="min-w-6 text-center text-sm font-medium text-sidebar-foreground">
        {quantity}
      </span>

      <button
        type="button"
        onClick={() => dispatch(increaseQuantity({ cartId }))}
        className="flex h-7 w-7 items-center justify-center rounded-full border transition hover:scale-95 active:scale-95"
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}