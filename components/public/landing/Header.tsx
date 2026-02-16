"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, Pencil, UserRound, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import type { CSSProperties } from "react";
import { StudentAuthModal } from "@/components/public/student-auth-modal";
import { ThemeToggle } from "@/components/public/theme-toggle";

interface HeaderProps {
  currentLang: "kz" | "ru" | "en";
  onLangChange: (lang: "kz" | "ru" | "en") => void;
}

export default function Header({ currentLang, onLangChange }: HeaderProps) {
  const { data: session } = useSession();
  const [isPastTours, setIsPastTours] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const langOrder: Array<"kz" | "ru" | "en"> = ["kz", "ru", "en"];
  const activeIndex = langOrder.indexOf(currentLang);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const prevIndexRef = useRef(activeIndex);
  const motionTickRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const toursSection = document.getElementById("tours");
      if (!toursSection) {
        setIsPastTours(window.scrollY > 20);
        return;
      }
      const triggerPoint = toursSection.offsetTop - 88;
      setIsPastTours(window.scrollY >= triggerPoint);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const previousIndex = prevIndexRef.current;
    if (previousIndex === activeIndex) return;

    motionTickRef.current += 1;
    const suffix = motionTickRef.current % 2 === 0 ? "a" : "b";
    const direction = activeIndex > previousIndex ? "right" : "left";
    const nextClass = `lang-switcher__thumb--${direction}-${suffix}`;
    const thumb = thumbRef.current;
    if (thumb) {
      thumb.classList.remove(
        "lang-switcher__thumb--right-a",
        "lang-switcher__thumb--right-b",
        "lang-switcher__thumb--left-a",
        "lang-switcher__thumb--left-b"
      );
      void thumb.offsetWidth;
      thumb.classList.add(nextClass);
    }
    prevIndexRef.current = activeIndex;

    if (!thumb) return;

    const resetId = window.setTimeout(() => {
      thumb.classList.remove(nextClass);
    }, 700);
    return () => window.clearTimeout(resetId);
  }, [activeIndex]);

  useEffect(() => {
    if (session?.user?.role !== "STUDENT") return;

    let active = true;
    void fetch("/api/student/profile", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!active) return;
        setStudentName(payload?.fullName || "");
      })
      .catch(() => {
        if (!active) return;
        setStudentName("");
      });

    return () => {
      active = false;
    };
  }, [session?.user?.role]);

  useEffect(() => {
    function onOutsideClick(event: MouseEvent) {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const translations = {
    kz: {
      nav: ["Басты", "Турлар", "Біз туралы", "Құжаттар", "Байланыс"],
      navIds: ["home", "tours", "about", "documents", "contact"],
      language: "Тіл",
      login: "Кіру",
      profile: "Профиль",
      myTours: "Менің турларым",
      logout: "Шығу",
      admin: "Админка",
      studentDefault: "Студент"
    },
    ru: {
      nav: ["Главная", "Туры", "О нас", "Документы", "Контакты"],
      navIds: ["home", "tours", "about", "documents", "contact"],
      language: "Язык",
      login: "Войти",
      profile: "Профиль",
      myTours: "Мои туры",
      logout: "Выйти",
      admin: "Админка",
      studentDefault: "Студент"
    },
    en: {
      nav: ["Home", "Tours", "About", "Documents", "Contacts"],
      navIds: ["home", "tours", "about", "documents", "contact"],
      language: "Language",
      login: "Sign in",
      profile: "Profile",
      myTours: "My tours",
      logout: "Sign out",
      admin: "Admin",
      studentDefault: "Student"
    }
  };

  const role = session?.user?.role;
  const isStudent = role === "STUDENT";
  const isAdminSide = role === "ADMIN" || role === "MANAGER";
  const quickHref = isStudent ? "/student" : "/admin/applications";
  const quickLabel = isStudent ? translations[currentLang].profile : translations[currentLang].admin;
  const studentDisplayName =
    studentName ||
    session?.user?.email?.split("@")[0] ||
    translations[currentLang].studentDefault;

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isPastTours ? "liquid-nav-shell liquid-nav-shell--solid shadow-lg" : "liquid-nav-shell liquid-nav-shell--hero"}`}>
      <svg aria-hidden="true" className="liquid-filter-defs">
        <defs>
          <filter id="nav-distortion" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency="0.012 0.16" numOctaves="2" seed="5" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="11" xChannelSelector="R" yChannelSelector="G" result="dispRed" />
            <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="8" xChannelSelector="R" yChannelSelector="G" result="dispGreen" />
            <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="9" xChannelSelector="R" yChannelSelector="G" result="dispBlue" />
            <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur in="output" stdDeviation="0.55" />
          </filter>
        </defs>
      </svg>

      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex h-20 items-center">
          <div className="header-desktop-left flex items-center">
            <button onClick={() => handleNavClick("home")} className="group flex cursor-pointer items-center space-x-3 lg:ml-4">
              <div className="relative h-17 w-20">
                <Image
                  src="/лого_mnutravel.svg"
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </button>
          </div>

          <div className="header-desktop-nav hidden flex-1 justify-center lg:flex">
            <nav className={`liquid-nav-group header-nav ${isPastTours ? "liquid-nav-group--dark" : "liquid-nav-group--light"}`}>
              <span className="liquid-nav-group__backdrop" />
              <span className="liquid-nav-group__edge liquid-nav-group__edge--top" />
              <span className="liquid-nav-group__edge liquid-nav-group__edge--bottom" />
              <span className="liquid-nav-group__edge liquid-nav-group__edge--left" />
              <span className="liquid-nav-group__edge liquid-nav-group__edge--right" />
              <div className="liquid-nav-group__row">
                {translations[currentLang].nav.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavClick(translations[currentLang].navIds[index])}
                    className={`liquid-nav-group__item px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isPastTours ? "text-[#0A1022] hover:text-[#0D3B8E]" : "text-white hover:text-[#FFD428]"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          <div className="header-desktop-right ml-auto flex items-center gap-3 lg:justify-end">
            {isStudent ? (
              <div className="relative hidden lg:block" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className={`header-profile-btn inline-flex h-10 w-10 items-center justify-center rounded-xl border p-0 transition-all ${
                    isPastTours
                      ? "border-[#0A1022]/15 bg-white/70 text-[#0A1022] hover:bg-white"
                      : "border-white/30 bg-white/20 text-white hover:bg-white/30"
                  }`}
                  aria-label={translations[currentLang].profile}
                  title={studentDisplayName}
                >
                  <UserRound size={18} />
                </button>
                {profileMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-white/25 bg-[#1a1a1d]/60 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="border-b border-white/25 px-4 py-3">
                      <p className="text-base font-bold">{studentDisplayName}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/student/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-white/15"
                      >
                        <Pencil size={16} />
                        {translations[currentLang].profile}
                      </Link>
                      <Link
                        href="/student"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-white/15"
                      >
                        <UserRound size={16} />
                        {translations[currentLang].myTours}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          void signOut({ callbackUrl: "/" });
                        }}
                        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/15"
                      >
                        <LogOut size={16} />
                        {translations[currentLang].logout}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : isAdminSide ? (
              <Link
                href={quickHref}
                className={`header-profile-btn hidden rounded-xl border px-4 py-2 text-sm font-semibold transition-all lg:inline-flex ${
                  isPastTours
                    ? "border-[#0A1022]/15 bg-white/70 text-[#0A1022] hover:bg-white"
                    : "border-white/30 bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {quickLabel}
              </Link>
            ) : (
              <StudentAuthModal darkText={isPastTours} lang={currentLang} />
            )}

            <div className="header-theme-toggle hidden lg:flex">
              <ThemeToggle darkText={isPastTours} />
            </div>

            <div className="header-lang-switcher mr-2 hidden lg:flex">
              <div className={`lang-switcher ${isPastTours ? "lang-switcher--dark" : "lang-switcher--light"}`} style={{ "--active-index": String(activeIndex) } as CSSProperties} role="tablist" aria-label="Choose language">
                <span ref={thumbRef} className="lang-switcher__thumb" aria-hidden="true" />
                {langOrder.map((lang) => (
                  <button key={lang} type="button" className="lang-switcher__option" onClick={() => onLangChange(lang)} role="tab" aria-selected={currentLang === lang} aria-label={lang.toUpperCase()}>
                    <span className={`lang-switcher__text ${currentLang === lang ? "lang-switcher__text--active" : ""}`}>{lang.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <ThemeToggle className="h-9 w-9 lg:hidden" darkText={isPastTours} />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden liquid-glass-btn p-2.5 rounded-lg transition-all shadow-md ${isPastTours ? "text-[#0A1022]" : "text-white"}`}
            >
              <span className="liquid-glass-btn__backdrop" />
              <span className="liquid-glass-btn__edge liquid-glass-btn__edge--top" />
              <span className="liquid-glass-btn__edge liquid-glass-btn__edge--bottom" />
              <span className="liquid-glass-btn__edge liquid-glass-btn__edge--left" />
              <span className="liquid-glass-btn__edge liquid-glass-btn__edge--right" />
              <span className="relative z-[2]">{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</span>
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className={`lg:hidden pb-4 mt-2 rounded-xl shadow-xl border ${isPastTours ? "glass-card border-white/60" : "bg-black/65 backdrop-blur-md border-white/35"}`}>
            <nav className="flex flex-col space-y-1 p-2">
              {translations[currentLang].nav.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(translations[currentLang].navIds[index])}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all text-left ${isPastTours ? "text-[#0A1022] hover:text-[#0D3B8E] hover:bg-white/45" : "text-white hover:text-[#FFD428] hover:bg-white/10"}`}
                >
                  {item}
                </button>
              ))}

              {isStudent ? (
                <>
                  <p className={`px-4 py-2 text-sm font-semibold ${isPastTours ? "text-[#0A1022]" : "text-white"}`}>
                    {studentDisplayName}
                  </p>
                  <Link
                    href="/student/profile"
                    className={`px-4 py-3 text-sm font-semibold rounded-lg ${isPastTours ? "text-[#0A1022] bg-white/40" : "text-white bg-white/10"}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {translations[currentLang].profile}
                  </Link>
                  <Link
                    href="/student"
                    className={`px-4 py-3 text-sm font-semibold rounded-lg ${isPastTours ? "text-[#0A1022] bg-white/40" : "text-white bg-white/10"}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {translations[currentLang].myTours}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      void signOut({ callbackUrl: "/" });
                    }}
                    className={`px-4 py-3 text-left text-sm font-semibold rounded-lg ${isPastTours ? "text-[#0A1022] bg-white/40" : "text-white bg-white/10"}`}
                  >
                    {translations[currentLang].logout}
                  </button>
                </>
              ) : isAdminSide ? (
                <Link
                  href={quickHref}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg ${isPastTours ? "text-[#0A1022] bg-white/40" : "text-white bg-white/10"}`}
                >
                  {quickLabel}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("mnu:open-auth-modal", { detail: { reason: "default" } }));
                  }}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg ${isPastTours ? "text-[#0A1022] bg-white/40" : "text-white bg-white/10"}`}
                >
                  {translations[currentLang].login}
                </button>
              )}
              <div className={`mt-1 rounded-xl px-2 py-2 ${isPastTours ? "bg-white/30" : "bg-white/10"}`}>
                <div className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${isPastTours ? "text-[#0A1022]/70" : "text-white/70"}`}>
                  {translations[currentLang].language}
                </div>
                <div className="inline-flex rounded-lg bg-black/25 p-1">
                  {langOrder.map((lang) => (
                    <button
                      key={`mobile-${lang}`}
                      type="button"
                      onClick={() => onLangChange(lang)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                        currentLang === lang ? "bg-white/25 text-white" : "text-white/70 hover:text-white"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
