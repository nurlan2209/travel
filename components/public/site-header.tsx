"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, Pencil, UserRound, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import type { AppLanguage } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { StudentAuthModal } from "@/components/public/student-auth-modal";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { t } from "@/lib/i18n";

export function SiteHeader({ lang, solidOnScrollTargetId }: { lang: AppLanguage; solidOnScrollTargetId?: string }) {
  const { data: session } = useSession();
  const dict = t(lang);
  const [open, setOpen] = useState(false);
  const [isSolid, setIsSolid] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItems = [
    { href: "/#home", label: dict.navHome },
    { href: "/#tours", label: dict.navTours },
    { href: "/#documents", label: dict.navDocuments },
    { href: "/#about", label: dict.navAbout },
    { href: "/#contact", label: dict.navContact }
  ];
  const authLabel = lang === "kz" ? "Кіру" : lang === "en" ? "Sign in" : "Войти";
  const role = session?.user?.role;
  const isStudent = role === "STUDENT";
  const isAdminSide = role === "ADMIN" || role === "MANAGER";
  const quickHref = isStudent ? "/student" : "/admin/applications";
  const quickLabel = isStudent ? (lang === "en" ? "Profile" : "Профиль") : (lang === "en" ? "Admin" : "Админка");
  const profileLabel = lang === "en" ? "Profile" : lang === "kz" ? "Профиль" : "Профиль";
  const toursLabel = lang === "en" ? "My tours" : lang === "kz" ? "Менің турларым" : "Мои туры";
  const logoutLabel = lang === "en" ? "Sign out" : lang === "kz" ? "Шығу" : "Выйти";
  const studentDefault = lang === "en" ? "Student" : "Студент";
  const languageLabel = lang === "en" ? "Language" : lang === "kz" ? "Тіл" : "Язык";
  const studentDisplayName = studentName || session?.user?.email?.split("@")[0] || studentDefault;

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
    if (!solidOnScrollTargetId) {
      const timeoutId = window.setTimeout(() => {
        setIsSolid(false);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    const updateHeaderState = () => {
      const target = document.getElementById(solidOnScrollTargetId);
      if (!target) {
        setIsSolid(window.scrollY > 12);
        return;
      }
      const rect = target.getBoundingClientRect();
      const targetBottom = window.scrollY + rect.top + rect.height;
      setIsSolid(window.scrollY + 80 >= targetBottom);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("resize", updateHeaderState);
    return () => {
      window.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("resize", updateHeaderState);
    };
  }, [solidOnScrollTargetId]);

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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isSolid ? "liquid-nav-shell liquid-nav-shell--solid shadow-lg" : "liquid-nav-shell liquid-nav-shell--hero"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden h-20 items-center lg:flex">
          <div className="header-desktop-left flex items-center">
            <Link href="/#home" className="flex items-center">
              <div className="relative h-17 w-20">
                <Image src="/лого_mnutravel.svg" alt="Logo" fill className="object-contain" />
              </div>
            </Link>
          </div>

          <div className="header-desktop-nav flex flex-1 justify-center">
            <nav className={`liquid-nav-group header-nav ${isSolid ? "liquid-nav-group--dark" : "liquid-nav-group--light"}`}>
              <span className="liquid-nav-group__backdrop" />
              <span className="liquid-nav-group__edge liquid-nav-group__edge--top" />
              <span className="liquid-nav-group__edge liquid-nav-group__edge--bottom" />
              <span className="liquid-nav-group__edge liquid-nav-group__edge--left" />
              <span className="liquid-nav-group__edge liquid-nav-group__edge--right" />
              <div className="liquid-nav-group__row">
                {navItems.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className={`liquid-nav-group__item rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      isSolid ? "text-[#0A1022] hover:text-[#0D3B8E]" : "text-white hover:text-[#FFD428]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="header-desktop-right flex items-center justify-end gap-3">
            {isStudent ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className={`header-profile-btn inline-flex h-10 w-10 items-center justify-center rounded-xl p-0 transition-all ${
                    isSolid
                      ? "border border-[#0A1022]/15 bg-white/70 text-[#0A1022] hover:bg-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                  aria-label={profileLabel}
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
                      <Link href="/student/profile" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-white/15">
                        <Pencil size={16} />
                        {profileLabel}
                      </Link>
                      <Link href="/student" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-white/15">
                        <UserRound size={16} />
                        {toursLabel}
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
                        {logoutLabel}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : isAdminSide ? (
              <Link
                href={quickHref}
                className={`header-profile-btn rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  isSolid
                    ? "border border-[#0A1022]/15 bg-white/70 text-[#0A1022] hover:bg-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {quickLabel}
              </Link>
            ) : (
              <StudentAuthModal lang={lang} darkText={isSolid} />
            )}

            <div className="header-theme-toggle flex">
              <ThemeToggle darkText={isSolid} />
            </div>
            <div className="header-lang-switcher flex">
              <LanguageSwitcher current={lang} variant={isSolid ? "dark" : "light"} />
            </div>
          </div>
        </div>

        <div className="flex h-20 items-center justify-between lg:hidden">
          <Link href="/#home" className="flex items-center">
            <div className="relative h-17 w-20">
              <Image src="/лого_mnutravel.svg" alt="Logo" fill className="object-contain" />
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle className="h-9 w-9" darkText={isSolid} />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`lg:hidden liquid-glass-btn p-2.5 rounded-lg ${isSolid ? "text-[#0A1022]" : "text-white"}`}
              aria-label="Menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open ? (
          <div className={`lg:hidden mt-2 pb-4 rounded-xl border ${isSolid ? "glass-card border-white/60" : "border-white/35 bg-black/65 backdrop-blur-md"}`}>
            <nav className="flex flex-col space-y-1 p-2">
              {navItems.map((item) => (
                <Link
                  key={`${item.href}-mobile`}
                  href={item.href}
                  className={`px-4 py-3 text-sm font-medium rounded-lg ${
                    isSolid ? "text-[#0A1022] hover:text-[#0D3B8E] hover:bg-white/45" : "text-white hover:text-[#FFD428] hover:bg-white/10"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {isStudent ? (
                <>
                  <p className={`px-4 py-2 text-sm font-semibold ${isSolid ? "text-[#0A1022]" : "text-white"}`}>{studentDisplayName}</p>
                  <Link href="/student/profile" className={`px-4 py-3 text-sm font-semibold rounded-lg ${isSolid ? "text-[#0A1022] bg-white/40" : "text-white bg-white/10"}`} onClick={() => setOpen(false)}>
                    {profileLabel}
                  </Link>
                  <Link href="/student" className={`px-4 py-3 text-sm font-semibold rounded-lg ${isSolid ? "text-[#0A1022] bg-white/40" : "text-white bg-white/10"}`} onClick={() => setOpen(false)}>
                    {toursLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void signOut({ callbackUrl: "/" });
                    }}
                    className={`px-4 py-3 text-left text-sm font-semibold rounded-lg ${isSolid ? "text-[#0A1022] bg-white/40" : "text-white bg-white/10"}`}
                  >
                    {logoutLabel}
                  </button>
                </>
              ) : isAdminSide ? (
                <Link href={quickHref} className={`px-4 py-3 text-sm font-semibold rounded-lg ${isSolid ? "text-[#0A1022] bg-white/40" : "text-white bg-white/10"}`} onClick={() => setOpen(false)}>
                  {quickLabel}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new CustomEvent("mnu:open-auth-modal", { detail: { reason: "default" } }));
                  }}
                  className={`px-4 py-3 text-left text-sm font-semibold rounded-lg ${isSolid ? "text-[#0A1022] bg-white/40" : "text-white bg-white/10"}`}
                >
                  {authLabel}
                </button>
              )}
              <div className={`mt-1 rounded-xl px-2 py-2 ${isSolid ? "bg-white/40" : "bg-white/10"}`}>
                <div className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${isSolid ? "text-[#0A1022]/70" : "text-white/70"}`}>{languageLabel}</div>
                <div className={`inline-flex rounded-lg p-1 ${isSolid ? "bg-[#0A1022]/12" : "bg-black/25"}`}>
                  {(["kz", "ru", "en"] as const).map((item) => {
                    const href = `?lang=${item}`;
                    const active = lang === item;
                    return (
                      <Link
                        key={`mobile-lang-${item}`}
                        href={href}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                          active
                            ? isSolid
                              ? "bg-[#0A1022]/12 text-[#0A1022]"
                              : "bg-white/25 text-white"
                            : isSolid
                              ? "text-[#0A1022]/70 hover:text-[#0A1022]"
                              : "text-white/70 hover:text-white"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {item.toUpperCase()}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
