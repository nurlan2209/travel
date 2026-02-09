"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { getSession, signIn } from "next-auth/react";
import type { AppLanguage } from "@/lib/constants";
import { t } from "@/lib/i18n";

export function LoginForm({ lang }: { lang: AppLanguage }) {
  const dict = t(lang);
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
      redirect: false
    });

    if (result?.error) {
      setError(dict.loginInvalid);
      setLoading(false);
      return;
    }

    const nextSession = await getSession();
    if (nextSession?.user?.role === "STUDENT") {
      window.location.href = "/";
      return;
    }

    window.location.href = "/admin/applications";
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#1f3a5f_0%,#091525_50%,#050910_100%)] px-4 text-white">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
        <h1 className="mb-4 text-3xl font-black">{dict.loginTitle}</h1>
        {error ? <p className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm">{error}</p> : null}

        <label className="mb-3 block">
          <span className="mb-1 block text-sm">{dict.loginEmail}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2"
            required
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm">{dict.loginPassword}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2"
            required
          />
        </label>

        <button type="submit" className="w-full rounded-xl bg-[#8d1111] px-4 py-2 font-semibold" disabled={loading}>
          {loading ? dict.loginSigningIn : dict.loginSignIn}
        </button>

        <p className="mt-4 text-center text-sm text-white/80">
          Авторизация выполняется через главную страницу.
        </p>
      </form>
    </main>
  );
}
