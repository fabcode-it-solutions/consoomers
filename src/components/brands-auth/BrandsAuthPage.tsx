"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

export default function BrandsAuthPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/brands-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
        toast.success("Access granted for this brand"); 
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-[300px]">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-8 rounded-md shadow-md w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Enter Access Password</h2>
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-md p-2 mb-3 bg-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex justify-center items-center ">
        <Button
          type="submit"
          className="text-white"
        >
          Enter
        </Button>
        </div>
      </form>
    </div>
  );
}
