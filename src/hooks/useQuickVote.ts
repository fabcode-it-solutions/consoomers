// hooks/useQuickVote.ts
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useQuickVote(productId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const url = `/api/quickvotes?productId=${productId}${userId ? `&userId=${userId}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();
        setOptions(Array.isArray(data.options) ? data.options : []);
        setHasVoted(data.hasVoted ?? false);
      } catch (err) {
        console.error("Fetch options error:", err);
        setError("Failed to load vote options");
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [productId, userId]);

  const submitVote = async (selected: string[]) => {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    if (!userId) {
      throw new Error("You must be logged in to vote");
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log("📤 Submitting vote:", { productId, userId, selected });

      const res = await fetch("/api/quickvotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId, selected }),
      });

      console.log("📥 Response status:", res.status, res.statusText);

      // Get response text first to handle both JSON and non-JSON responses
      const text = await res.text();
      console.log("📥 Raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}`);
      }

      console.log("📥 Parsed response:", data);

      if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
      }

      setHasVoted(true);
      return data;
    } catch (err) {
      console.error("❌ Vote submit error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to submit vote";
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { options, loading, submitting, error, hasVoted, submitVote };
}