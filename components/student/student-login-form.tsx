"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function StudentLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/"
    });

    if (result?.error) {
      setError("Неверный email или пароль");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#fff8d1_0%,#fff2ac_35%,#fff9df_100%)] px-4 text-[#0A1022]">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-[#0A1022]/15 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-4 text-3xl font-black">Вход студента</h1>
        {error ? <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-700">{error}</p> : null}

        <label className="mb-3 block">
          <span className="mb-1 block text-sm">Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm">Пароль</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required />
        </label>

        <button type="submit" className="w-full rounded-xl bg-[#0D3B8E] px-4 py-2 font-semibold text-white" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>

        <div className="mt-4 flex items-center justify-end text-sm">
          <Link href="/student/forgot-password" className="!text-white hover:text-white/90">Забыли пароль?</Link>
        </div>
      </form>
    </main>
  );
}
