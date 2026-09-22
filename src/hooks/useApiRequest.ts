/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const cooldownCache: Record<string, number> = {};

export function useApiRequest<T = unknown>() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [toastEnabled, setToastEnabled] = useState(true);
  const router = useRouter();
  function hasStringMessage(obj: unknown): obj is { message: string } {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "message" in obj &&
      typeof (obj as { message: unknown }).message === "string"
    );
  }

  useEffect(() => {
    if (error && toastEnabled && code != 403) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (result && hasStringMessage(result) && toastEnabled) {
      toast.success(result.message);
    }
  }, [success, result]);

  const request = async ({
    url,
    options,
    tag,
    cache = "no-store",
    enableToast = true, // new flag
  }: {
    url: string;
    options?: FetchOptions;
    tag?: string;
    cache?: "force-cache" | "no-store";
    enableToast?: boolean;
  }): Promise<T | null> => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    setResult(null);
    setToastEnabled(enableToast);

    const now = Date.now();
    const cooldownUntil = cooldownCache[url];
    if (cooldownUntil && now < cooldownUntil) {
      const wait = Math.ceil((cooldownUntil - now) / 1000);
      setError(`Too many failed attempts. Try again in ${wait}s.`);
      setLoading(false);
      return null;
    }

    try {
      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        ...(cache && { cache }),
        ...(tag && { next: { tags: [tag] } }),
      };

      const res = await fetch(url, fetchOptions);
      const data = await res.json();

      if (!res.ok) {
        setCode(data.status);
        setError(data?.error || "Something went wrong");
        setResult(data);

        if (data?.error === "Your session has expired. Please login again.") {
          router.push("/accounts/login");
        }

        throw new Error(data?.error || "Something went wrong");
      } else {
        setResult(data);

        setSuccess(true);
        return data;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error, success, result, code, setCode };
}
