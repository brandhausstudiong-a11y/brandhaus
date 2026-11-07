import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDiscount(
  price: number,
  discountPercentage: number
) {
  const discountAmount = (price * discountPercentage) / 100;

  return {
    originalPrice: price,
    discountAmount,
    discountedPrice: price - discountAmount,
  };
}