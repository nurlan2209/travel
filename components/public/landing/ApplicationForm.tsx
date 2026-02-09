"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle, LogIn, Send } from "lucide-react";

interface ApplicationFormProps {
  lang: "kz" | "ru" | "en";
}

type TourOption = {
  id: string;
  title: string;
};

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

const formUi = {
  kz: {
    title: "Өтінім қалдыру",
    subtitle: "Тек авторизацияланған студент өтінім жібере алады",
    fullName: "Толық аты-жөні",
    phone: "Телефон",
    university: "Университет",
    email: "Email",
    tour: "Тур",
    tourPlaceholder: "Турды таңдаңыз",
    comment: "Пікір",
    commentPlaceholder: "Сұрақ немесе қосымша мәлімет",
    submit: "Өтінім жіберу",
    loading: "Жүктелуде...",
    authRequired: "Өтінім жіберу үшін аккаунтқа кіру керек",
    loginAndSend: "Кіру және жіберу",
    profileMissing: "Студент профилі толтырылмаған. Алдымен профильді толтырыңыз.",
    profileEdit: "Профильді өңдеу",
    onlyStudent: "Өтінімді тек студент жібере алады",
    fillTour: "Турды таңдаңыз",
    submitSuccess: "Өтінім жіберілді, менеджер сізбен байланысады",
    authSuccess: "Кіру сәтті аяқталды. Енді өтінімді жібере аласыз.",
    conflict: "Осы күнге белсенді өтініміңіз бар",
    closed: "Бұл турға өтінім қабылдау жабық",
    contactTip: "Өтінімнен кейін менеджер сізге хабарласады"
  },
  ru: {
    title: "Оставить заявку",
    subtitle: "Отправка заявки доступна только авторизованному студенту",
    fullName: "ФИО",
    phone: "Номер телефона",
    university: "Университет",
    email: "Почта",
    tour: "Тур",
    tourPlaceholder: "Выберите тур",
    comment: "Комментарий",
    commentPlaceholder: "Вопросы и пожелания",
    submit: "Отправить заявку",
    loading: "Загрузка...",
    authRequired: "Для отправки заявки нужно войти в аккаунт",
    loginAndSend: "Войти и отправить",
    profileMissing: "Профиль студента не заполнен. Сначала заполните профиль.",
    profileEdit: "Изменить профиль",
    onlyStudent: "Заявку может отправлять только студент",
    fillTour: "Выберите тур",
    submitSuccess: "Заявка отправлена, менеджер свяжется с вами",
    authSuccess: "Вы успешно вошли. Теперь отправьте заявку.",
    conflict: "У вас уже есть активная заявка на эту дату",
    closed: "Набор на этот тур закрыт",
    contactTip: "После заявки менеджер свяжется с вами"
  },
  en: {
    title: "Submit Application",
    subtitle: "Only authenticated students can submit applications",
    fullName: "Full name",
    phone: "Phone number",
    university: "University",
    email: "Email",
    tour: "Tour",
    tourPlaceholder: "Choose a tour",
    comment: "Comment",
    commentPlaceholder: "Questions or preferences",
    submit: "Submit Application",
    loading: "Loading...",
    authRequired: "Sign in to submit your application",
    loginAndSend: "Sign in and submit",
    profileMissing: "Student profile is not filled in. Update profile first.",
    profileEdit: "Edit profile",
    onlyStudent: "Only student accounts can submit applications",
    fillTour: "Choose a tour",
    submitSuccess: "Application sent, manager will contact you",
    authSuccess: "Signed in successfully. Now submit your application.",
    conflict: "You already have an active application on that date",
    closed: "Applications for this tour are closed",
    contactTip: "Manager will contact you after submission"
  }
} as const;

export default function ApplicationForm({ lang }: ApplicationFormProps) {
  const ui = formUi[lang];
  const { data: session, status } = useSession();
  const [tourOptions, setTourOptions] = useState<TourOption[]>([]);
  const [tourPostId, setTourPostId] = useState("");
  const [comment, setComment] = useState("");
  const [profile, setProfile] = useState<StudentProfilePayload>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const pendingAuthSubmitRef = useRef(false);
  const studentProfile = session?.user?.role === "STUDENT" ? profile : null;

  useEffect(() => {
    async function loadTours() {
      const response = await fetch(`/api/tours?lang=${lang}&status=published`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as Array<{ id: string; translation: { title: string } | null; place: string }>;
      setTourOptions(
        data.map((item) => ({
          id: item.id,
          title: item.translation?.title || item.place
        }))
      );
    }

    void loadTours();
  }, [lang]);

  useEffect(() => {
    if (session?.user?.role !== "STUDENT") {
      return;
    }

    async function loadProfile() {
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
    }

    void loadProfile();
  }, [session?.user?.id, session?.user?.role]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    function onAuthSuccess(event: Event) {
      const custom = event as CustomEvent<{ role?: string }>;
      if (custom.detail?.role === "STUDENT") {
        setNotice({ type: "info", text: ui.authSuccess });
      } else if (pendingAuthSubmitRef.current) {
        setNotice({ type: "error", text: ui.onlyStudent });
      }
      pendingAuthSubmitRef.current = false;
    }

    window.addEventListener("mnu:auth-success", onAuthSuccess as EventListener);
    return () => window.removeEventListener("mnu:auth-success", onAuthSuccess as EventListener);
  }, [ui.authSuccess, ui.onlyStudent]);

  function openAuthModalForApplication() {
    pendingAuthSubmitRef.current = true;
    window.dispatchEvent(
      new CustomEvent("mnu:open-auth-modal", {
        detail: { reason: "application" }
      })
    );
  }

  async function submitApplication() {
    if (!tourPostId) {
      setNotice({ type: "error", text: ui.fillTour });
      return;
    }

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
        setNotice({ type: "error", text: ui.conflict });
      } else if (payload.code === "TOUR_CLOSED") {
        setNotice({ type: "error", text: ui.closed });
      } else if (payload.code === "AUTH_REQUIRED") {
        setNotice({ type: "error", text: ui.authRequired });
      } else {
        setNotice({ type: "error", text: payload.message || ui.authRequired });
      }
      setSubmitting(false);
      return;
    }

    setComment("");
    setTourPostId("");
    setNotice({ type: "success", text: payload.message || ui.submitSuccess });
    setSubmitting(false);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (status !== "authenticated") {
      setNotice({ type: "error", text: ui.authRequired });
      openAuthModalForApplication();
      return;
    }

    if (session.user.role !== "STUDENT") {
      setNotice({ type: "error", text: ui.onlyStudent });
      return;
    }

    if (!profile) {
      setNotice({ type: "error", text: ui.profileMissing });
      return;
    }

    await submitApplication();
  }

  return (
    <section id="application" className="bg-gradient-to-b from-[#FFF9DF] to-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-4xl font-bold text-[#0A1022] md:text-5xl">{ui.title}</h2>
          <p className="text-lg text-[#0A1022]/70">{ui.subtitle}</p>
        </div>

        <div className="mx-auto max-w-3xl">
          {notice ? (
            <div
              className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                notice.type === "success"
                  ? "border-green-400/40 bg-green-500/10 text-green-800"
                  : notice.type === "info"
                    ? "border-blue-400/40 bg-blue-500/10 text-blue-800"
                    : "border-red-400/40 bg-red-500/10 text-red-700"
              }`}
            >
              {notice.text}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="glass-card rounded-2xl border border-white/60 p-8 shadow-xl md:p-10">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-[#0A1022]">{ui.fullName}</span>
                <input
                  type="text"
                  value={studentProfile?.fullName || ""}
                  readOnly
                  className="w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-[#0A1022]/80"
                  placeholder={loadingProfile ? ui.loading : ""}
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold text-[#0A1022]">{ui.phone}</span>
                <input
                  type="text"
                  value={studentProfile?.phone || ""}
                  readOnly
                  className="w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-[#0A1022]/80"
                  placeholder={loadingProfile ? ui.loading : ""}
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold text-[#0A1022]">{ui.university}</span>
                <input
                  type="text"
                  value={studentProfile?.university || ""}
                  readOnly
                  className="w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-[#0A1022]/80"
                  placeholder={loadingProfile ? ui.loading : ""}
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold text-[#0A1022]">{ui.email}</span>
                <input
                  type="text"
                  value={studentProfile?.user?.email || session?.user?.email || ""}
                  readOnly
                  className="w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-[#0A1022]/80"
                  placeholder={loadingProfile ? ui.loading : ""}
                />
              </label>

              <label className="text-sm md:col-span-2">
                <span className="mb-1 block font-semibold text-[#0A1022]">{ui.tour}</span>
                <select
                  value={tourPostId}
                  onChange={(event) => setTourPostId(event.target.value)}
                  className="w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-[#0A1022]"
                >
                  <option value="">{ui.tourPlaceholder}</option>
                  {tourOptions.map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm md:col-span-2">
                <span className="mb-1 block font-semibold text-[#0A1022]">{ui.comment}</span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-[#0A1022]"
                  placeholder={ui.commentPlaceholder}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="flex items-center gap-2 text-[#0A1022]/70">
                <CheckCircle size={14} />
                {ui.contactTip}
              </p>
              {session?.user?.role === "STUDENT" ? (
                <Link href="/student/profile" className="font-semibold text-[#0D3B8E] underline">
                  {ui.profileEdit}
                </Link>
              ) : null}
            </div>

            <div className="mt-6">
              {status !== "authenticated" ? (
                <button
                  type="button"
                  onClick={openAuthModalForApplication}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-8 py-4 text-lg font-bold text-[#0A1022] shadow-xl"
                >
                  <LogIn size={19} />
                  {ui.loginAndSend}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-8 py-4 text-lg font-bold text-[#0A1022] shadow-xl disabled:opacity-70"
                >
                  <Send size={19} />
                  {submitting ? ui.loading : ui.submit}
                </button>
              )}
            </div>

            {session?.user?.role && session.user.role !== "STUDENT" ? (
              <p className="mt-3 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={14} />
                {ui.onlyStudent}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
