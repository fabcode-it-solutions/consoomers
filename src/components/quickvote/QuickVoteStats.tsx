/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

export type QuickVoteOption = {
  value: string;
  label: string;
};

export function useQuickVote(productId: string) {
  const [options, setOptions] = useState<QuickVoteOption[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    async function fetchVoteData() {
      setLoading(true);
      try {
        // Replace this with your actual API call
        const response = await fetch(`/api/votes/${productId}`);
        const data = await response.json();

        setOptions(data.options); // array of { value, label }
        setStats(data.stats); // object { optionValue: voteCount }
        setHasVoted(data.hasVoted ?? false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch votes");
      } finally {
        setLoading(false);
      }
    }

    fetchVoteData();
  }, [productId]);

  const submitVote = async (selected: string[]) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/votes/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected }),
      });

      const data = await response.json();
      setStats(data.stats); // update stats after voting
      setHasVoted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    options,
    stats,
    loading,
    submitting,
    error,
    hasVoted,
    submitVote,
  };
}
