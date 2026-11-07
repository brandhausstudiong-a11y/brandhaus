import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
    id: string; // Unique cart item id
    productId: string;
    variantId: string;
    sku: string;
    slug: string;
    category: string;
    name: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
    percentageDiscount: number;
    featuredImage: string;
}

interface CartState {
  items: CartItem[];
}

type AddToCartPayload = Omit<CartItem, "id" | "quantity"> & {
  quantity?: number;
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Add item to cart
     *
     * If the same product + color + size already exists,
     * simply increase its quantity.
     */
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const payload = action.payload;

      const existingItem = state.items.find(
        (item) =>
          item.productId === payload.productId &&
          item.color === payload.color &&
          item.size === payload.size
      );

      if (existingItem) {
        existingItem.quantity += payload.quantity ?? 1;
        return;
      }

      state.items.push({
        id: nanoid(),
        quantity: payload.quantity ?? 1,
        ...payload,
      });
    },

    /**
     * Remove an entire cart item
     */
    removeFromCart: (
      state,
      action: PayloadAction<{ cartId: string }>
    ) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload.cartId
      );
    },

    /**
     * Increase quantity
     */
    increaseQuantity: (
      state,
      action: PayloadAction<{ cartId: string }>
    ) => {
      const item = state.items.find(
        (item) => item.id === action.payload.cartId
      );

      if (item) {
        item.quantity += 1;
      }
    },

    /**
     * Decrease quantity
     *
     * If quantity reaches 0,
     * remove item from cart.
     */
    decreaseQuantity: (
      state,
      action: PayloadAction<{ cartId: string }>
    ) => {
      const item = state.items.find(
        (item) => item.id === action.payload.cartId
      );

      if (!item) return;

      if (item.quantity === 1) {
        state.items = state.items.filter(
          (item) => item.id !== action.payload.cartId
        );
        return;
      }

      item.quantity -= 1;
    },

    /**
     * Empty cart
     */
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;