"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { AppLanguage } from "@/lib/constants";

const langOrder: AppLanguage[] = ["kz", "ru", "en"];

export function AdminLangSwitcher({ currentLang }: { currentLang: AppLanguage }) {
  const router = useRouter();
  const activeIndex = langOrder.indexOf(currentLang);

  async function onChange(lang: AppLanguage) {
    await fetch("/api/admin/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang })
    });
    router.refresh();
  }

  return (
    <div
      className="lang-switcher lang-switcher--light"
      style={{ "--active-index": String(activeIndex) } as CSSProperties}
      role="tablist"
      aria-label="Admin language switcher"
    >
      <span className="lang-switcher__thumb" aria-hidden="true" />
      {langOrder.map((lang) => (
        <button
          key={lang}
          type="button"
          className="lang-switcher__option"
          onClick={() => onChange(lang)}
          role="tab"
          aria-selected={currentLang === lang}
          aria-label={lang.toUpperCase()}
        >
          <span className={`lang-switcher__text ${currentLang === lang ? "lang-switcher__text--active" : ""}`}>{lang.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
