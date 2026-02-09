"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { signIn } from "next-auth/react";

type FormState = {
  fullName: string;
  phone: string;
  university: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function StudentRegisterForm() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    university: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/student/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || "Не удалось зарегистрироваться");
      setLoading(false);
      return;
    }

    const authResult = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
      callbackUrl: "/"
    });

    if (authResult?.error) {
      window.location.href = "/?auth=1";
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#fff8d1_0%,#fff2ac_35%,#fff9df_100%)] px-4 text-[#0A1022]">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-3xl border border-[#0A1022]/15 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-4 text-3xl font-black">Регистрация студента</h1>
        {error ? <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm">ФИО</span>
            <input value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">Номер телефона</span>
            <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">Университет</span>
            <input value={form.university} onChange={(e) => setField("university", e.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm">Почта</span>
            <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">Пароль</span>
            <input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">Подтверждение пароля</span>
            <input type="password" value={form.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required />
          </label>
        </div>

        <button type="submit" className="mt-4 w-full rounded-xl bg-[#8d1111] px-4 py-2 font-semibold text-white" disabled={loading}>
          {loading ? "Создание..." : "Создать аккаунт"}
        </button>

        <p className="mt-4 text-sm text-[#0A1022]/70">Вход и регистрация доступны на главной странице.</p>
      </form>
    </main>
  );
}
