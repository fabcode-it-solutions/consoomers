"use client";
import React, { useState, useRef, useEffect } from "react";
import { useQuickVote } from "@/hooks/useQuickVote";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { testerProfiles } from "@/db/schema/tester";

type QuickVoteTooltipProps = { 
  productId: string; 
  userId?: string;  
  productPrice?: string | number;  
};

export default function QuickVoteTooltip({ productId }: QuickVoteTooltipProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const { options, loading, submitting, error, hasVoted, submitVote } = useQuickVote(productId);

  // Debug: Log session info
  useEffect(() => {
    console.log("🔐 Session data:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      testerProfiles:session?.user
    });
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleSelect = (value: string) => {
    setSelected((prev) => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one option!");
      return;
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in to vote");
      return;
    }

    console.log("🎯 Submitting vote with:", { 
      productId, 
      userId: session.user.id, 
      selected 
    });

    try {
      await submitVote(selected);
      toast.success("Thank you for your feedback!");
      setSelected([]);
      setOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit vote";
      console.error("🔴 Submit error:", errorMsg);
      toast.error(errorMsg);
    }
  };

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <div className="relative inline-block">
        <button 
          onClick={() => toast.error("Please log in to vote")} 
          className="!bg-gray-400 mt-2 px-[45px] py-[10px] flex justify-center tracking-[0.05em]"
        >
          Login to Vote
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button 
        onClick={() => setOpen(s => !s)} 
        disabled={loading || hasVoted} 
        className="!bg-[#ffd400] mt-2 px-[35px] md:px-[45px] py-[10px] flex justify-center tracking-[0.05em] disabled:opacity-50"
      >
        {loading ? "Loading..." : hasVoted ? "Vote Submitted" : "Quick Vote"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="relative bg-white w-full max-w-md sm:max-w-xl md:max-w-2xl h-[90vh] sm:h-auto rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl">
              <h3 className="text-md text-red-600 rounded-sm px-2 py-1 bg-white">
                You can only use Quick Vote one time for a product.
              </h3>
              <button 
                onClick={() => setOpen(false)} 
                className="text-white text-2xl font-bold hover:opacity-75"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 bg-gray-50">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <p className="text-xl text-gray-800 mb-2 font-semibold">
                Which of these best match your reaction to this product?
              </p>
              <p className="text-sm text-gray-500 mb-3">Choose as many as you like</p>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : options.length > 0 ? (
                <div className="space-y-3">
                  {options.map(opt => (
                    <label 
                      key={opt.value} 
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-200 ${
                        selected.includes(opt.value) 
                          ? "bg-blue-50 ring-1 ring-blue-400" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        value={opt.value} 
                        checked={selected.includes(opt.value)} 
                        onChange={() => handleSelect(opt.value)} 
                        disabled={submitting} 
                        className="appearance-none w-5 h-5 border-2 border-blue-400 rounded-full checked:bg-blue-600 checked:border-blue-600 disabled:opacity-50"
                      />
                      <span className="text-base sm:text-lg text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No vote options available.</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 bg-gray-100 border-t gap-3">
              <div className="flex gap-10 justify-center mx-auto w-full sm:w-auto">
                <button 
                  onClick={() => setOpen(false)} 
                  disabled={submitting} 
                  className="w-full sm:w-auto bg-gray-500 hover:bg-gray-400 text-white disabled:opacity-50 py-[14.5px] px-[30px] cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting || selected.length === 0} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 py-[14.5px] px-[30px] cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}