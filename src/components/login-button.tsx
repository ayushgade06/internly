"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="px-6 py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition"
    >
      Sign in with Google
    </button>
  );
}
