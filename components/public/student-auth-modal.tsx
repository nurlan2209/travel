"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import type { AppLanguage } from "@/lib/constants";
import { evaluatePasswordRules } from "@/lib/password-rules";

type Props = {
  darkText?: boolean;
  lang?: AppLanguage;
};

type OpenReason = "default" | "application";

type RegisterState = {
  fullName: string;
  phone: string;
  university: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialRegister: RegisterState = {
  fullName: "",
  phone: "",
  university: "",
  email: "",
  password: "",
  confirmPassword: ""
};

const ui = {
  kz: {
    open: "Кіру",
    signUp: "Тіркелу",
    signIn: "Кіру",
    createTitle: "Аккаунт жасау",
    welcomeTitle: "Қайта келгеніңізге қуаныштымыз",
    invalidLogin: "Email немесе құпиясөз қате",
    registerFailed: "Тіркелу сәтсіз аяқталды",
    close: "Жабу",
    emailPlaceholder: "Email енгізіңіз",
    passwordPlaceholder: "Құпиясөз енгізіңіз",
    signInBtn: "Кіру",
    signingInBtn: "Кіру...",
    forgot: "Құпиясөзді ұмыттыңыз ба?",
    fullName: "Толық аты-жөні",
    phone: "Телефон",
    university: "Университет",
    confirmPassword: "Құпиясөзді растау",
    passwordRules: "Құпиясөз талаптары",
    ruleMin: "Кемінде 8 таңба",
    ruleLower: "1 кіші әріп",
    ruleUpper: "1 бас әріп",
    ruleDigit: "1 сан",
    createBtn: "Аккаунт жасау",
    creatingBtn: "Жасалуда..."
  },
  ru: {
    open: "Войти",
    signUp: "Регистрация",
    signIn: "Вход",
    createTitle: "Создать аккаунт",
    welcomeTitle: "С возвращением",
    invalidLogin: "Неверный email или пароль",
    registerFailed: "Не удалось зарегистрироваться",
    close: "Закрыть",
    emailPlaceholder: "Введите email",
    passwordPlaceholder: "Введите пароль",
    signInBtn: "Войти",
    signingInBtn: "Вход...",
    forgot: "Забыли пароль?",
    fullName: "ФИО",
    phone: "Телефон",
    university: "Университет",
    confirmPassword: "Подтверждение пароля",
    passwordRules: "Требования к паролю",
    ruleMin: "Минимум 8 символов",
    ruleLower: "1 строчная буква",
    ruleUpper: "1 заглавная буква",
    ruleDigit: "1 цифра",
    createBtn: "Создать аккаунт",
    creatingBtn: "Создание..."
  },
  en: {
    open: "Sign in",
    signUp: "Sign up",
    signIn: "Sign in",
    createTitle: "Create an account",
    welcomeTitle: "Welcome back",
    invalidLogin: "Invalid email or password",
    registerFailed: "Failed to register",
    close: "Close",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    signInBtn: "Sign in",
    signingInBtn: "Signing in...",
    forgot: "Forgot password?",
    fullName: "Full name",
    phone: "Phone",
    university: "University",
    confirmPassword: "Confirm password",
    passwordRules: "Password requirements",
    ruleMin: "At least 8 characters",
    ruleLower: "1 lowercase letter",
    ruleUpper: "1 uppercase letter",
    ruleDigit: "1 number",
    createBtn: "Create an account",
    creatingBtn: "Creating..."
  }
} as const;

export function StudentAuthModal({ darkText = false, lang = "ru" }: Props) {
  const searchParams = useSearchParams();
  const authQuery = searchParams.get("auth");
  const text = ui[lang];
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [openReason, setOpenReason] = useState<OpenReason>("default");
  const [tab, setTab] = useState<"login" | "register">("login");
  const [formAnimKey, setFormAnimKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [reg, setReg] = useState<RegisterState>(initialRegister);
  const hasAutoOpenedRef = useRef(false);
  const regPasswordRules = evaluatePasswordRules(reg.password);
  const regPasswordMissing = [
    !regPasswordRules.minLength ? text.ruleMin : null,
    !regPasswordRules.hasLower ? text.ruleLower : null,
    !regPasswordRules.hasUpper ? text.ruleUpper : null,
    !regPasswordRules.hasDigit ? text.ruleDigit : null
  ].filter(Boolean) as string[];
  const showRegisterPasswordHint = reg.password.length > 0 && regPasswordMissing.length > 0;

  function openModal(reason: OpenReason = "default") {
    setOpenReason(reason);
    setMounted(true);
    setError("");
    requestAnimationFrame(() => setVisible(true));
  }

  function closeModal() {
    setVisible(false);
    window.setTimeout(() => {
      setMounted(false);
    }, 180);
  }

  function setRegField<K extends keyof RegisterState>(key: K, value: RegisterState[K]) {
    setReg((prev) => ({ ...prev, [key]: value }));
  }

  function switchTab(next: "login" | "register") {
    if (next === tab) return;
    setTab(next);
    setFormAnimKey((prev) => prev + 1);
  }

  useEffect(() => {
    function onOpenModal(event: Event) {
      const custom = event as CustomEvent<{ reason?: string }>;
      const reason = custom.detail?.reason === "application" ? "application" : "default";
      setTab("login");
      setFormAnimKey((prev) => prev + 1);
      openModal(reason);
    }

    window.addEventListener("mnu:open-auth-modal", onOpenModal as EventListener);
    return () => window.removeEventListener("mnu:open-auth-modal", onOpenModal as EventListener);
  }, []);

  useEffect(() => {
    if (authQuery === "1" && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      const timer = window.setTimeout(() => {
        openModal("default");
      }, 0);
      return () => window.clearTimeout(timer);
    }
    if (authQuery !== "1") {
      hasAutoOpenedRef.current = false;
    }
  }, [authQuery]);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      redirect: false
    });

    if (result?.error) {
      setError(text.invalidLogin);
      setLoading(false);
      return;
    }

    const nextSession = await getSession();
    const role = nextSession?.user?.role;
    window.dispatchEvent(new CustomEvent("mnu:auth-success", { detail: { role: role ?? null } }));

    if (role === "STUDENT" && openReason === "application") {
      setLoading(false);
      closeModal();
      return;
    }

    if (role === "STUDENT") {
      window.location.href = "/";
      return;
    }

    window.location.href = "/admin/applications";
  }

  async function onRegister(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/student/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg)
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || text.registerFailed);
      setLoading(false);
      return;
    }

    const authResult = await signIn("credentials", {
      email: reg.email,
      password: reg.password,
      redirect: false
    });

    if (authResult?.error) {
      setLoading(false);
      window.location.href = "/?auth=1";
      return;
    }

    const nextSession = await getSession();
    const role = nextSession?.user?.role;
    window.dispatchEvent(new CustomEvent("mnu:auth-success", { detail: { role: role ?? "STUDENT" } }));

    if ((role === "STUDENT" || !role) && openReason === "application") {
      setLoading(false);
      closeModal();
      return;
    }

    if (!role || role === "STUDENT") {
      window.location.href = "/";
      return;
    }

    window.location.href = "/admin/applications";
  }

  return (
    <>
      <button
        type="button"
        onClick={() => openModal("default")}
        className={`hidden lg:inline-flex rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
          darkText
            ? "bg-[#0D3B8E] text-white hover:bg-[#0A2C6B]"
            : "bg-white/20 text-white hover:bg-white/30"
        }`}
      >
        {text.open}
      </button>

      {mounted ? (
        <div
          className={`fixed inset-0 z-[80] flex items-center justify-center p-4 transition-all duration-200 ${
            visible
              ? "bg-black/55 backdrop-blur-sm opacity-100"
              : "bg-black/0 backdrop-blur-sm opacity-0"
          }`}
          onClick={closeModal}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={`w-full max-w-md origin-top overflow-hidden rounded-[30px] border border-white/25 bg-[#1a1a1d]/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-[height,transform,opacity] duration-280 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              tab === "register" ? "h-[460px]" : "h-[360px]"
            } ${
              visible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-5 scale-95 opacity-0"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex rounded-2xl bg-black/55 p-1">
                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className={`min-w-24 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    tab === "login" ? "bg-white/18 text-white" : "text-white/65"
                  }`}
                >
                  {text.signIn}
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("register")}
                  className={`min-w-24 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    tab === "register"
                      ? "bg-white/18 text-white"
                      : "text-white/65"
                  }`}
                >
                  {text.signUp}
                </button>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white/80 hover:bg-black/45"
                aria-label={text.close}
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="mb-4 text-4xl font-black tracking-tight text-white">
              {tab === "register" ? text.createTitle : text.welcomeTitle}
            </h3>

            {error ? (
              <p className="mb-3 rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            <div className="relative mt-1">
              {tab === "login" ? (
                <form
                  key={`login-${formAnimKey}`}
                  onSubmit={onLogin}
                  className="space-y-3 animate-[authFormIn_240ms_cubic-bezier(0.22,1,0.36,1)]"
                >
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={text.emailPlaceholder}
                  className="w-full rounded-xl border border-white/20 bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                  required
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={text.passwordPlaceholder}
                  className="w-full rounded-xl border border-white/20 bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                  required
                />
                <button
                  type="submit"
                  className="mt-1 w-full rounded-xl bg-white px-4 py-3 text-base font-bold text-[#1A2D47] shadow-lg"
                  disabled={loading}
                >
                  {loading ? text.signingInBtn : text.signInBtn}
                </button>
                <a
                  href="/student/forgot-password"
                  className="block text-center text-sm !text-white underline"
                >
                  {text.forgot}
                </a>
              </form>
              ) : (
                <form
                  key={`register-${formAnimKey}`}
                  onSubmit={onRegister}
                  className="space-y-3 animate-[authFormIn_240ms_cubic-bezier(0.22,1,0.36,1)]"
                >
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={reg.fullName}
                    onChange={(e) => setRegField("fullName", e.target.value)}
                    placeholder={text.fullName}
                    className="col-span-2 rounded-xl border border-white/20 bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                    required
                  />
                  <input
                    value={reg.phone}
                    onChange={(e) => setRegField("phone", e.target.value)}
                    placeholder={text.phone}
                    className="rounded-xl border border-white/20 bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                    required
                  />
                  <input
                    value={reg.university}
                    onChange={(e) => setRegField("university", e.target.value)}
                    placeholder={text.university}
                    className="rounded-xl border border-white/20 bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                    required
                  />
                </div>
                <input
                  type="email"
                  value={reg.email}
                  onChange={(e) => setRegField("email", e.target.value)}
                  placeholder={text.emailPlaceholder}
                  className="w-full rounded-xl border border-white/20 bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    {showRegisterPasswordHint ? (
                      <div className="pointer-events-none absolute -top-1 left-0 z-20 -translate-y-full rounded-lg border border-red-300/60 bg-[#2f1111]/95 px-3 py-2 text-[11px] text-red-100 shadow-xl">
                        <ul className="space-y-0.5">
                          {regPasswordMissing.map((rule) => (
                            <li key={rule}>• {rule}</li>
                          ))}
                        </ul>
                        <span className="absolute left-4 top-full h-2 w-2 rotate-45 border-r border-b border-red-300/60 bg-[#2f1111]/95" />
                      </div>
                    ) : null}
                    <input
                      type="password"
                      value={reg.password}
                      onChange={(e) => setRegField("password", e.target.value)}
                      placeholder={text.passwordPlaceholder}
                      className={`w-full rounded-xl border bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none ${
                        showRegisterPasswordHint ? "border-red-300/70" : "border-white/20"
                      }`}
                      required
                    />
                  </div>
                  <input
                    type="password"
                    value={reg.confirmPassword}
                    onChange={(e) =>
                      setRegField("confirmPassword", e.target.value)
                    }
                    placeholder={text.confirmPassword}
                    className="rounded-xl border border-white/20 bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="mt-1 w-full rounded-xl bg-white px-4 py-3 text-base font-bold text-[#1A2D47] shadow-lg"
                  disabled={loading}
                >
                  {loading ? text.creatingBtn : text.createBtn}
                </button>
              </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
