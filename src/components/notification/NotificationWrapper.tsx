/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/NotificationWrapper.tsx
"use client";
import React from "react";
import { useSession } from "next-auth/react";
import NotificationBell from "./NotificationBell";

export default function NotificationWrapper() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const userId = user?.id;
  const notificationId = user?.notificationId ?? null;

  if (!userId) return null;
  return <NotificationBell userId={userId} notificationId={notificationId} />;
}
