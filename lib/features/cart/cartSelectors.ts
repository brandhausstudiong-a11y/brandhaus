import { RootState } from "@/lib/store";
import { calculateDiscount } from "@/lib/utils";
import { createSelector } from "@reduxjs/toolkit";

export const selectCartItems = (state: RootState) =>
  state.cart.items;

export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

export const selectSubtotal = (state: RootState) =>
  state.cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

export const selectTotalDiscount = createSelector(
  [selectCartItems],
  (cartItems) =>
    cartItems.reduce((sum, item) => {
      return sum + item.percentageDiscount;
    }, 0)
);

export const selectTotal = createSelector(
  [selectSubtotal, selectTotalDiscount],
  (subtotal, totalDiscount) => subtotal
);