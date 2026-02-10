"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userCreateSchema } from "@/lib/validation";
import { z } from "zod";
import type { AppLanguage } from "@/lib/constants";
import { evaluatePasswordRules } from "@/lib/password-rules";

type UserCreateValues = z.infer<typeof userCreateSchema>;

const userFormUi = {
  kz: {
    createFailed: "Пайдаланушыны құру мүмкін болмады",
    email: "Email",
    password: "Құпиясөз",
    role: "Рөл",
    roleManager: "Менеджер",
    roleAdmin: "Әкімші",
    roleStudent: "Студент",
    passwordRules: "Құпиясөз талаптары",
    ruleMin: "Кемінде 8 таңба",
    ruleLower: "1 кіші әріп",
    ruleUpper: "1 бас әріп",
    ruleDigit: "1 сан",
    saving: "Сақталуда...",
    create: "Пайдаланушы құру"
  },
  ru: {
    createFailed: "Не удалось создать пользователя",
    email: "Email",
    password: "Пароль",
    role: "Роль",
    roleManager: "Менеджер",
    roleAdmin: "Администратор",
    roleStudent: "Студент",
    passwordRules: "Требования к паролю",
    ruleMin: "Минимум 8 символов",
    ruleLower: "1 строчная буква",
    ruleUpper: "1 заглавная буква",
    ruleDigit: "1 цифра",
    saving: "Сохранение...",
    create: "Создать пользователя"
  },
  en: {
    createFailed: "Failed to create user",
    email: "Email",
    password: "Password",
    role: "Role",
    roleManager: "Manager",
    roleAdmin: "Admin",
    roleStudent: "Student",
    passwordRules: "Password requirements",
    ruleMin: "At least 8 characters",
    ruleLower: "1 lowercase letter",
    ruleUpper: "1 uppercase letter",
    ruleDigit: "1 number",
    saving: "Saving...",
    create: "Create user"
  }
} as const;

export function UserForm({ onDone, lang = "ru" }: { onDone: () => void; lang?: AppLanguage }) {
  const ui = userFormUi[lang];
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const form = useForm<UserCreateValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "MANAGER",
      isActive: true
    }
  });
  const passwordValue = useWatch({ control: form.control, name: "password" }) || "";
  const passwordRules = evaluatePasswordRules(passwordValue);
  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const unmetPasswordRules = [
    !passwordRules.minLength ? ui.ruleMin : null,
    !passwordRules.hasLower ? ui.ruleLower : null,
    !passwordRules.hasUpper ? ui.ruleUpper : null,
    !passwordRules.hasDigit ? ui.ruleDigit : null
  ].filter(Boolean) as string[];
  const showPasswordHint = passwordValue.length > 0 && unmetPasswordRules.length > 0;

  async function onSubmit(values: UserCreateValues) {
    setSaving(true);
    setError("");

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.message || ui.createFailed);
      setSaving(false);
      return;
    }

    form.reset();
    onDone();
    setSaving(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 rounded-2xl border border-white/20 bg-white/8 p-4 md:grid-cols-4">
      {error ? <p className="md:col-span-4 rounded-lg bg-red-500/20 p-2 text-sm text-red-100">{error}</p> : null}
      <label>
        <span className="mb-1 block text-xs text-white/80">{ui.email}</span>
        <input {...form.register("email")} className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white" />
        {emailError ? <p className="mt-1 text-[11px] text-red-200">{emailError}</p> : null}
      </label>
      <label className="relative">
        <span className="mb-1 block text-xs text-white/80">{ui.password}</span>
        {showPasswordHint ? (
          <div className="pointer-events-none absolute -top-1 left-0 z-20 -translate-y-full rounded-lg border border-red-300/60 bg-[#2f1111]/95 px-3 py-2 text-[11px] text-red-100 shadow-xl">
            <ul className="space-y-0.5">
              {unmetPasswordRules.map((rule) => (
                <li key={rule}>• {rule}</li>
              ))}
            </ul>
            <span className="absolute left-4 top-full h-2 w-2 rotate-45 border-r border-b border-red-300/60 bg-[#2f1111]/95" />
          </div>
        ) : null}
        <input
          type="password"
          {...form.register("password")}
          className={`w-full rounded-xl border bg-black/20 px-3 py-2 text-sm text-white ${
            showPasswordHint ? "border-red-300/70" : "border-white/30"
          }`}
        />
        {passwordError ? <p className="mt-1 text-[11px] text-red-200">{passwordError}</p> : null}
      </label>
      <label>
        <span className="mb-1 block text-xs text-white/80">{ui.role}</span>
        <select {...form.register("role")} className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white">
          <option value="MANAGER">{ui.roleManager}</option>
          <option value="ADMIN">{ui.roleAdmin}</option>
          <option value="STUDENT">{ui.roleStudent}</option>
        </select>
      </label>
      <button type="submit" disabled={saving} className="self-end rounded-xl bg-[#8d1111] px-4 py-2 text-sm font-semibold text-white">
        {saving ? ui.saving : ui.create}
      </button>
    </form>
  );
}
