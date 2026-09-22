/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { RootState } from "@/libs/redux/store";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { id } from "zod/v4/locales";

export default function CreateReferral() {
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { data: session } = useSession();
  const referrerId = useSelector((state: RootState) => state.user.user?.id);
  console.log(referrerId, "referrerId");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/referrals/invite-friend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referrerId,
          friendEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Referral created successfully!");
        setFriendEmail("");
      } else {
        setMessage(data.error || "Failed to create referral");
      }
    } catch (error) {
      setMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Referral</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="friendEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Friend&rsquo;s Email
          </label>
          <input
            type="email"
            id="friendEmail"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Referral"}
        </button>
      </form>
      {message && (
        <p
          className={`mt-4 text-sm ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
