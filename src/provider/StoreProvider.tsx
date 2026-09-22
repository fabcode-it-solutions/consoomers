"use client";
import { AppStore, makeStore } from "@/libs/redux/store";
import { useRef } from "react";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return (
    <SessionProvider>
      <Provider store={storeRef.current}>{children}</Provider>
    </SessionProvider>
  );
}
