"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
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
    forgotTitle: "Құпиясөзді қалпына келтіру",
    forgotSubtitle: "Email енгізіңіз, код жібереміз",
    codeLabel: "6 таңбалы код",
    newPassword: "Жаңа құпиясөз",
    sendCode: "Код жіберу",
    sendingCode: "Жіберілуде...",
    updatePassword: "Құпиясөзді жаңарту",
    updatingPassword: "Жаңартылуда...",
    codeSent: "Код email-ге жіберілді",
    resetDone: "Құпиясөз жаңартылды. Енді кіре аласыз.",
    backToLogin: "Кіруге оралу",
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
    forgotTitle: "Восстановление пароля",
    forgotSubtitle: "Введите email, отправим код",
    codeLabel: "6-значный код",
    newPassword: "Новый пароль",
    sendCode: "Отправить код",
    sendingCode: "Отправка...",
    updatePassword: "Обновить пароль",
    updatingPassword: "Обновление...",
    codeSent: "Код отправлен на почту",
    resetDone: "Пароль обновлен. Теперь можно войти.",
    backToLogin: "Вернуться ко входу",
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
    forgotTitle: "Reset password",
    forgotSubtitle: "Enter your email to receive code",
    codeLabel: "6-digit code",
    newPassword: "New password",
    sendCode: "Send code",
    sendingCode: "Sending...",
    updatePassword: "Update password",
    updatingPassword: "Updating...",
    codeSent: "Code sent to your email",
    resetDone: "Password updated. You can sign in now.",
    backToLogin: "Back to sign in",
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
  const [notice, setNotice] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<"request" | "confirm">("request");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [reg, setReg] = useState<RegisterState>(initialRegister);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const hasAutoOpenedRef = useRef(false);
  const regPasswordRules = evaluatePasswordRules(reg.password);
  const regPasswordMissing = [
    !regPasswordRules.minLength ? text.ruleMin : null,
    !regPasswordRules.hasLower ? text.ruleLower : null,
    !regPasswordRules.hasUpper ? text.ruleUpper : null,
    !regPasswordRules.hasDigit ? text.ruleDigit : null
  ].filter(Boolean) as string[];
  const showRegisterPasswordHint = reg.password.length > 0 && regPasswordMissing.length > 0;
  const forgotPasswordRules = evaluatePasswordRules(forgotPassword);
  const forgotPasswordMissing = [
    !forgotPasswordRules.minLength ? text.ruleMin : null,
    !forgotPasswordRules.hasLower ? text.ruleLower : null,
    !forgotPasswordRules.hasUpper ? text.ruleUpper : null,
    !forgotPasswordRules.hasDigit ? text.ruleDigit : null
  ].filter(Boolean) as string[];
  const showForgotPasswordHint = forgotPassword.length > 0 && forgotPasswordMissing.length > 0;

  const resetForgotState = useCallback(() => {
    setForgotMode(false);
    setForgotStep("request");
    setForgotCode("");
    setForgotPassword("");
    setForgotConfirmPassword("");
  }, []);

  const openModal = useCallback((reason: OpenReason = "default") => {
    setOpenReason(reason);
    setMounted(true);
    setError("");
    setNotice("");
    resetForgotState();
    requestAnimationFrame(() => setVisible(true));
  }, [resetForgotState]);

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
    setError("");
    setNotice("");
    resetForgotState();
    setFormAnimKey((prev) => prev + 1);
  }

  useEffect(() => {
    function onOpenModal(event: Event) {
      const custom = event as CustomEvent<{ reason?: string }>;
      const reason = custom.detail?.reason === "application" ? "application" : "default";
      setTab("login");
      setError("");
      setNotice("");
      resetForgotState();
      setFormAnimKey((prev) => prev + 1);
      openModal(reason);
    }

    window.addEventListener("mnu:open-auth-modal", onOpenModal as EventListener);
    return () => window.removeEventListener("mnu:open-auth-modal", onOpenModal as EventListener);
  }, [openModal, resetForgotState]);

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
  }, [authQuery, openModal]);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

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
    setNotice("");

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

  async function onForgotRequest(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const response = await fetch("/api/student/password/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail.trim() })
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    if (!response.ok) {
      setError(payload.message || text.invalidLogin);
      setLoading(false);
      return;
    }

    setNotice(text.codeSent);
    setForgotStep("confirm");
    setLoading(false);
  }

  async function onForgotConfirm(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const response = await fetch("/api/student/password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: forgotEmail.trim(),
        code: forgotCode.trim(),
        password: forgotPassword,
        confirmPassword: forgotConfirmPassword
      })
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    if (!response.ok) {
      setError(payload.message || text.invalidLogin);
      setLoading(false);
      return;
    }

    setNotice(text.resetDone);
    setLoginEmail(forgotEmail.trim());
    setForgotMode(false);
    setForgotStep("request");
    setForgotCode("");
    setForgotPassword("");
    setForgotConfirmPassword("");
    setTab("login");
    setLoading(false);
  }

  const modalHeightClass = forgotMode
    ? forgotStep === "request"
      ? "h-[360px]"
      : "h-[500px]"
    : tab === "register"
      ? "h-[480px]"
      : "h-[360px]";

  return (
    <>
      <button
        type="button"
        onClick={() => openModal("default")}
        className={`liquid-glass-btn relative hidden lg:inline-flex items-center justify-center rounded-xl px-8 py-2 text-sm font-semibold transition ${
          darkText ? "text-[#0A1022]" : "text-white"
        }`}
      >
        <span className="liquid-glass-btn__backdrop" />
        <span className="liquid-glass-btn__edge liquid-glass-btn__edge--top" />
        <span className="liquid-glass-btn__edge liquid-glass-btn__edge--bottom" />
        <span className="liquid-glass-btn__edge liquid-glass-btn__edge--left" />
        <span className="liquid-glass-btn__edge liquid-glass-btn__edge--right" />
        <span className="relative z-[2]">{text.open}</span>
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
            className={`w-full max-w-md origin-top overflow-hidden rounded-[30px] border border-white/25 bg-[#1a1a1d]/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-[height,transform,opacity] duration-280 ease-[cubic-bezier(0.22,1,0.36,1)] ${modalHeightClass} ${
              visible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-5 scale-95 opacity-0"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              {forgotMode ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setNotice("");
                    resetForgotState();
                    setFormAnimKey((prev) => prev + 1);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-black/35 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-black/45"
                >
                  <ArrowLeft size={16} />
                  {text.backToLogin}
                </button>
              ) : (
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
              )}

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
              {forgotMode ? text.forgotTitle : tab === "register" ? text.createTitle : text.welcomeTitle}
            </h3>
            {forgotMode ? <p className="mb-3 text-sm text-white/70">{text.forgotSubtitle}</p> : null}

            {error ? (
              <p className="mb-3 rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="mb-3 rounded-xl bg-green-500/20 px-3 py-2 text-sm text-green-100">
                {notice}
              </p>
            ) : null}

            <div className="relative mt-1">
              {forgotMode ? (
                <form
                  key={`forgot-${forgotStep}-${formAnimKey}`}
                  onSubmit={forgotStep === "request" ? onForgotRequest : onForgotConfirm}
                  className="space-y-3 animate-[authFormIn_240ms_cubic-bezier(0.22,1,0.36,1)]"
                >
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    placeholder={text.emailPlaceholder}
                    className="w-full rounded-xl border border-white/20 bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                    required
                    disabled={forgotStep === "confirm"}
                  />

                  {forgotStep === "confirm" ? (
                    <>
                      <input
                        value={forgotCode}
                        onChange={(event) => setForgotCode(event.target.value)}
                        placeholder={text.codeLabel}
                        className="w-full rounded-xl border border-white/20 bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                        required
                        maxLength={6}
                      />
                      <div className="relative">
                        {showForgotPasswordHint ? (
                          <div className="pointer-events-none absolute -top-1 left-0 z-20 -translate-y-full rounded-lg border border-red-300/60 bg-[#2f1111]/95 px-3 py-2 text-[11px] text-red-100 shadow-xl">
                            <ul className="space-y-0.5">
                              {forgotPasswordMissing.map((rule) => (
                                <li key={rule}>• {rule}</li>
                              ))}
                            </ul>
                            <span className="absolute left-4 top-full h-2 w-2 rotate-45 border-r border-b border-red-300/60 bg-[#2f1111]/95" />
                          </div>
                        ) : null}
                        <input
                          type="password"
                          value={forgotPassword}
                          onChange={(event) => setForgotPassword(event.target.value)}
                          placeholder={text.newPassword}
                          className={`w-full rounded-xl border bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none ${
                            showForgotPasswordHint ? "border-red-300/70" : "border-white/20"
                          }`}
                          required
                        />
                      </div>
                      <input
                        type="password"
                        value={forgotConfirmPassword}
                        onChange={(event) => setForgotConfirmPassword(event.target.value)}
                        placeholder={text.confirmPassword}
                        className="w-full rounded-xl border border-white/20 bg-black/38 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                        required
                      />
                    </>
                  ) : null}

                  <button
                    type="submit"
                    className="auth-submit-btn mt-1 w-full rounded-xl bg-white px-4 py-3 text-base font-bold text-[#1A2D47] shadow-lg"
                    disabled={loading}
                  >
                    {forgotStep === "request"
                      ? loading ? text.sendingCode : text.sendCode
                      : loading ? text.updatingPassword : text.updatePassword}
                  </button>
                </form>
              ) : tab === "login" ? (
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
                  className="auth-submit-btn mt-1 w-full rounded-xl bg-white px-4 py-3 text-base font-bold text-[#1A2D47] shadow-lg"
                  disabled={loading}
                >
                  {loading ? text.signingInBtn : text.signInBtn}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(loginEmail);
                    setError("");
                    setNotice("");
                    setForgotMode(true);
                    setForgotStep("request");
                    setFormAnimKey((prev) => prev + 1);
                  }}
                  className="block w-full text-center text-sm !text-white underline"
                >
                  {text.forgot}
                </button>
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
                  className="auth-submit-btn mt-1 w-full rounded-xl bg-white px-4 py-3 text-base font-bold text-[#1A2D47] shadow-lg"
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
