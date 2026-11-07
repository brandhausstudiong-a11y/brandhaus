"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { useRef } from "react";
import { store } from "@/lib/store";

export function StoreProviders({
  children,
}: {
  children: React.ReactNode;
}) {
   const persistorRef = useRef(persistStore(store));
  return (
    <Provider store={store}>
      <PersistGate 
        persistor={persistorRef.current}
        loading={null}>
        {children}
      </PersistGate>
    </Provider>
  );
}