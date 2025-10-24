"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store"; // Adjust the path to your store
import { initializeFromClient } from "./slices/authSlice"; // Adjust path as needed
import { ReactNode } from "react";

interface ReduxProviderProps {
  children: ReactNode;
}

export default function ReduxProvider({
  children,
}: ReduxProviderProps): React.ReactElement {
  useEffect(() => {
    store.dispatch(initializeFromClient());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
