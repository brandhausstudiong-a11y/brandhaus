import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> =
  useSelector;


// import { useAppDispatch, useAppSelector } from "@/store/hooks";

// const dispatch = useAppDispatch();
// const cart = useAppSelector((state) => state.cart.items);