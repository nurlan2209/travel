"use client";

import { signOut } from "next-auth/react";

export function LogoutButton({
  label = "Sign out",
  callbackUrl = "/",
  className = ""
}: {
  label?: string;
  callbackUrl?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl })}
      className={`rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-sm text-white transition hover:bg-white/30 ${className}`}
    >
      {label}
    </button>
  );
}
