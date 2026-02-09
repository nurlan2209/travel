"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { evaluatePasswordRules } from "@/lib/password-rules";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const passwordRules = evaluatePasswordRules(password);
  const missingRules = [
    !passwordRules.minLength ? "Минимум 8 символов" : null,
    !passwordRules.hasLower ? "1 строчная буква" : null,
    !passwordRules.hasUpper ? "1 заглавная буква" : null,
    !passwordRules.hasDigit ? "1 цифра" : null
  ].filter(Boolean) as string[];
  const showPasswordHint = password.length > 0 && missingRules.length > 0;

  async function onRequestCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch("/api/student/password/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || "Не удалось отправить код");
      return;
    }
    setMessage("Код отправлен на почту");
    setStep("confirm");
  }

  async function onConfirm(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch("/api/student/password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password, confirmPassword })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || "Не удалось сменить пароль");
      return;
    }
    setMessage("Пароль обновлен. Теперь можно войти.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#fff8d1_0%,#fff2ac_35%,#fff9df_100%)] px-4 text-[#0A1022]">
      <form onSubmit={step === "request" ? onRequestCode : onConfirm} className="w-full max-w-md rounded-3xl border border-[#0A1022]/15 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-4 text-3xl font-black">Восстановление пароля</h1>
        {error ? <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-700">{message}</p> : null}

        <label className="mb-3 block">
          <span className="mb-1 block text-sm">Почта</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required />
        </label>

        {step === "confirm" ? (
          <>
            <label className="mb-3 block">
              <span className="mb-1 block text-sm">6-значный код</span>
              <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required maxLength={6} />
            </label>
            <label className="relative mb-3 block">
              <span className="mb-1 block text-sm">Новый пароль</span>
              {showPasswordHint ? (
                <div className="pointer-events-none absolute -top-1 left-0 z-20 -translate-y-full rounded-lg border border-red-300/60 bg-[#fff3f3] px-3 py-2 text-[11px] text-red-800 shadow-lg">
                  <ul className="space-y-0.5">
                    {missingRules.map((rule) => (
                      <li key={rule}>• {rule}</li>
                    ))}
                  </ul>
                  <span className="absolute left-4 top-full h-2 w-2 rotate-45 border-r border-b border-red-300/60 bg-[#fff3f3]" />
                </div>
              ) : null}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl border bg-white px-3 py-2 ${
                  showPasswordHint ? "border-red-300/80" : "border-[#0A1022]/20"
                }`}
                required
              />
            </label>
            <label className="mb-4 block">
              <span className="mb-1 block text-sm">Подтверждение пароля</span>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white px-3 py-2" required />
            </label>
          </>
        ) : null}

        <button type="submit" className="w-full rounded-xl bg-[#0D3B8E] px-4 py-2 font-semibold text-white">
          {step === "request" ? "Отправить код" : "Обновить пароль"}
        </button>
      </form>
    </main>
  );
}
