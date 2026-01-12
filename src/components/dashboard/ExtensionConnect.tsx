"use client";

import { useState } from "react";

export default function ExtensionConnect() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function enableExtension() {
    try {
      setStatus("loading");
      const res = await fetch("/api/auth/token");

      if (!res.ok) {
        const error = await res.json();

        alert(`Failed to connect: ${error.error || "Please log in first"}`);
        setStatus("error");
        return;
      }

      const data = await res.json();


      window.postMessage(
        {
          type: "AUTH_TOKEN",
          token: data.token,
        },
        "*"
      );

      setStatus("success");
      alert("Extension connected! You can now use the Chrome extension to save applications.");
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {

      alert("Failed to connect extension. Please try again.");
      setStatus("error");
    }
  }

  return (
    <button
      onClick={enableExtension}
      disabled={status === "loading"}
      className={`px-4 py-2 rounded-xl transition text-sm font-medium ${
        status === "success"
          ? "bg-green-600 text-white"
          : status === "error"
          ? "bg-red-600 text-white"
          : "bg-black text-white hover:bg-slate-800"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {status === "loading" ? "Connecting..." : 
       status === "success" ? "Connected" : 
       "Connect Chrome Extension"}
    </button>
  );
}
