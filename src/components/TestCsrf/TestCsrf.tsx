/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
export default function TestCSRF() {
  const [csrfToken, setCsrfToken] = useState("");
  const [result, setResult] = useState("");

  async function load() {
    const res = await fetch("/api/csrf-token", { credentials: "include" });
    const data = await res.json();
    console.log(data,"data")
    setCsrfToken(res.headers.get("x-csrf-token") || data.csrfToken || "");
  }
  useEffect(() => { load(); }, []);

  async function send(method: string, body?: any) {
    const res = await fetch("/api/test-csrf", {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      body: body ? JSON.stringify(body) : undefined,
    });
    setResult(await res.text());
  }

  return (
    <div>
      <div>CSRF TOKEN: {csrfToken || "Not loaded"}</div>
      <button onClick={() => load()}>Refresh CSRF Token</button>
      <button onClick={() => send("POST", { test: "hello" })}>POST</button>
      <button onClick={() => send("PUT", { test: "put" })}>PUT</button>
      <button onClick={() => send("DELETE")}>DELETE</button>
      <pre>{result}</pre>
    </div>
  );
}
