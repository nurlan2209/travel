"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle, LogIn, Send, X } from "lucide-react";
import type { AppLanguage } from "@/lib/constants";

type StudentProfilePayload = {
  fullName: string;
  phone: string;
  university: string;
  user?: {
    email?: string;
  } | null;
} | null;

type Notice = {
  type: "success" | "error" | "info";
  text: string;
};

type ModalProps = {
  lang: AppLanguage;
  tourPostId: string;
  tourTitle: string;
};

type TriggerProps = {
  className: string;
  label: string;
};

const ui = {
  kz: {
    title: "Турға өтінім",
    subtitle: "Таңдалған турға өтінім қалдырыңыз",
    tour: "Тур",
    fullName: "Толық аты-жөні",
    phone: "Телефон",
    university: "Университет",
    email: "Email",
    comment: "Пікір",
    commentPlaceholder: "Сұрақ немесе қосымша мәлімет",
    submit: "Өтінім жіберу",
    loading: "Жүктелуде...",
    authRequired: "Өтінім жіберу үшін аккаунтқа кіру керек",
    loginAndSend: "Кіру және жіберу",
    profileMissing: "Студент профилі толтырылмаған. Алдымен профильді толтырыңыз.",
    profileEdit: "Профильді өңдеу",
    onlyStudent: "Өтінімді тек студент жібере алады",
    submitSuccess: "Өтінім жіберілді, менеджер сізбен байланысады",
    authSuccess: "Кіру сәтті аяқталды. Енді өтінімді жібере аласыз.",
    conflict: "Осы күнге белсенді өтініміңіз бар",
    closed: "Бұл турға өтінім қабылдау жабық",
    contactTip: "Өтінімнен кейін менеджер сізге хабарласады"
  },
  ru: {
    title: "Заявка на тур",
    subtitle: "Оставьте заявку на выбранный тур",
    tour: "Тур",
    fullName: "ФИО",
    phone: "Номер телефона",
    university: "Университет",
    email: "Почта",
    comment: "Комментарий",
    commentPlaceholder: "Вопросы и пожелания",
    submit: "Отправить заявку",
    loading: "Загрузка...",
    authRequired: "Для отправки заявки нужно войти в аккаунт",
    loginAndSend: "Войти и отправить",
    profileMissing: "Профиль студента не заполнен. Сначала заполните профиль.",
    profileEdit: "Изменить профиль",
    onlyStudent: "Заявку может отправлять только студент",
    submitSuccess: "Заявка отправлена, менеджер свяжется с вами",
    authSuccess: "Вы успешно вошли. Теперь отправьте заявку.",
    conflict: "У вас уже есть активная заявка на эту дату",
    closed: "Набор на этот тур закрыт",
    contactTip: "После заявки менеджер свяжется с вами"
  },
  en: {
    title: "Tour Application",
    subtitle: "Submit an application for this tour",
    tour: "Tour",
    fullName: "Full name",
    phone: "Phone number",
    university: "University",
    email: "Email",
    comment: "Comment",
    commentPlaceholder: "Questions or preferences",
    submit: "Submit Application",
    loading: "Loading...",
    authRequired: "Sign in to submit your application",
    loginAndSend: "Sign in and submit",
    profileMissing: "Student profile is not filled in. Update profile first.",
    profileEdit: "Edit profile",
    onlyStudent: "Only student accounts can submit applications",
    submitSuccess: "Application sent, manager will contact you",
    authSuccess: "Signed in successfully. Now submit your application.",
    conflict: "You already have an active application on that date",
    closed: "Applications for this tour are closed",
    contactTip: "Manager will contact you after submission"
  }
} as const;

export function OpenTourApplicationButton({ className, label }: TriggerProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent("mnu:open-tour-application"))}
    >
      {label}
    </button>
  );
}

export function TourApplicationModal({ lang, tourPostId, tourTitle }: ModalProps) {
  const text = ui[lang];
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [comment, setComment] = useState("");
  const [profile, setProfile] = useState<StudentProfilePayload>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const pendingAuthSubmitRef = useRef(false);
  const studentProfile = session?.user?.role === "STUDENT" ? profile : null;
  const isStudentProfileComplete = Boolean(
    studentProfile?.fullName?.trim() &&
    studentProfile?.phone?.trim() &&
    studentProfile?.university?.trim()
  );

  const loadProfile = useCallback(async () => {
    if (session?.user?.role !== "STUDENT") {
      setProfile(null);
      return;
    }
    setLoadingProfile(true);
    const response = await fetch("/api/student/profile", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as StudentProfilePayload;
    if (!response.ok) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }
    setProfile(payload);
    setLoadingProfile(false);
  }, [session?.user?.role]);

  useEffect(() => {
    function onOpen() {
      setMounted(true);
      window.setTimeout(() => setOpen(true), 0);
    }
    window.addEventListener("mnu:open-tour-application", onOpen);
    return () => window.removeEventListener("mnu:open-tour-application", onOpen);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => {
      setMounted(false);
    }, 220);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [mounted, loadProfile, session?.user?.id]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    function onAuthSuccess(event: Event) {
      const custom = event as CustomEvent<{ role?: string }>;
      if (custom.detail?.role === "STUDENT") {
        setNotice({ type: "info", text: text.authSuccess });
        void loadProfile();
      } else if (pendingAuthSubmitRef.current) {
        setNotice({ type: "error", text: text.onlyStudent });
      }
      pendingAuthSubmitRef.current = false;
    }

    window.addEventListener("mnu:auth-success", onAuthSuccess as EventListener);
    return () => window.removeEventListener("mnu:auth-success", onAuthSuccess as EventListener);
  }, [loadProfile, text.authSuccess, text.onlyStudent]);

  useEffect(() => {
    if (!mounted) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeModal, mounted]);

  function openAuthModalForApplication() {
    pendingAuthSubmitRef.current = true;
    window.dispatchEvent(
      new CustomEvent("mnu:open-auth-modal", {
        detail: { reason: "application" }
      })
    );
  }

  async function submitApplication() {
    setSubmitting(true);
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tourPostId,
        comment: comment.trim() || undefined
      })
    });

    const payload = await response.json().catch(() => ({} as { code?: string; message?: string }));
    if (!response.ok) {
      if (payload.code === "DATE_CONFLICT") {
        setNotice({ type: "error", text: text.conflict });
      } else if (payload.code === "TOUR_CLOSED") {
        setNotice({ type: "error", text: text.closed });
      } else if (payload.code === "PROFILE_REQUIRED") {
        setNotice({ type: "error", text: text.profileMissing });
      } else if (payload.code === "AUTH_REQUIRED") {
        setNotice({ type: "error", text: text.authRequired });
      } else {
        setNotice({ type: "error", text: payload.message || text.authRequired });
      }
      setSubmitting(false);
      return;
    }

    setNotice({ type: "success", text: payload.message || text.submitSuccess });
    setSubmitting(false);
    setComment("");
    window.setTimeout(() => closeModal(), 900);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (status !== "authenticated") {
      setNotice({ type: "error", text: text.authRequired });
      openAuthModalForApplication();
      return;
    }

    if (session.user.role !== "STUDENT") {
      setNotice({ type: "error", text: text.onlyStudent });
      return;
    }

    if (!isStudentProfileComplete) {
      setNotice({ type: "error", text: text.profileMissing });
      return;
    }

    await submitApplication();
  }

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeModal}
    >
      <div
        className={`mx-auto mt-8 w-[min(92vw,760px)] rounded-3xl border border-white/25 bg-[#1a1a1d]/65 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 sm:mt-14 sm:p-6 ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black">{text.title}</h3>
            <p className="text-sm text-white/75">{text.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {notice ? (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-green-400/40 bg-green-500/10 text-green-100"
                : notice.type === "info"
                  ? "border-blue-400/40 bg-blue-500/10 text-blue-100"
                  : "border-red-400/40 bg-red-500/12 text-red-100"
            }`}
          >
            {notice.text}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-white/90">{text.tour}</span>
            <input
              type="text"
              value={tourTitle}
              readOnly
              className="w-full rounded-xl border border-white/25 bg-black/30 px-4 py-3 text-white/95"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-white/90">{text.fullName}</span>
              <input
                type="text"
                value={studentProfile?.fullName || ""}
                readOnly
                className="w-full rounded-xl border border-white/25 bg-black/30 px-4 py-3 text-white/85"
                placeholder={loadingProfile ? text.loading : ""}
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-white/90">{text.phone}</span>
              <input
                type="text"
                value={studentProfile?.phone || ""}
                readOnly
                className="w-full rounded-xl border border-white/25 bg-black/30 px-4 py-3 text-white/85"
                placeholder={loadingProfile ? text.loading : ""}
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-white/90">{text.university}</span>
              <input
                type="text"
                value={studentProfile?.university || ""}
                readOnly
                className="w-full rounded-xl border border-white/25 bg-black/30 px-4 py-3 text-white/85"
                placeholder={loadingProfile ? text.loading : ""}
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-white/90">{text.email}</span>
              <input
                type="text"
                value={studentProfile?.user?.email || session?.user?.email || ""}
                readOnly
                className="w-full rounded-xl border border-white/25 bg-black/30 px-4 py-3 text-white/85"
                placeholder={loadingProfile ? text.loading : ""}
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-white/90">{text.comment}</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-white/25 bg-black/30 px-4 py-3 text-white/95 outline-none"
              placeholder={text.commentPlaceholder}
            />
          </label>

          <div className="mt-1 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="flex items-center gap-2 text-white/75">
              <CheckCircle size={14} />
              {text.contactTip}
            </p>
            {session?.user?.role === "STUDENT" ? (
              <Link href="/student/profile" className="font-semibold text-[#FFD428] underline">
                {text.profileEdit}
              </Link>
            ) : null}
          </div>

          <div className="pt-1">
            {status !== "authenticated" ? (
              <button
                type="button"
                onClick={openAuthModalForApplication}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-6 py-3.5 text-base font-bold text-[#0A1022] shadow-xl transition hover:from-[#FFC000] hover:to-[#FFB000]"
              >
                <LogIn size={18} />
                {text.loginAndSend}
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-6 py-3.5 text-base font-bold text-[#0A1022] shadow-xl transition hover:from-[#FFC000] hover:to-[#FFB000] disabled:opacity-70"
              >
                <Send size={18} />
                {submitting ? text.loading : text.submit}
              </button>
            )}
          </div>

          {session?.user?.role && session.user.role !== "STUDENT" ? (
            <p className="mt-2 flex items-center gap-1 text-sm text-red-200">
              <AlertCircle size={14} />
              {text.onlyStudent}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
