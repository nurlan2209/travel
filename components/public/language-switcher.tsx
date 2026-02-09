"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LANGUAGES, type AppLanguage } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export function LanguageSwitcher({ current, variant = "light" }: { current: AppLanguage; variant?: "light" | "dark" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeIndex = LANGUAGES.indexOf(current);

  function onChange(language: AppLanguage) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", language);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className={cn("lang-switcher", variant === "dark" ? "lang-switcher--dark" : "lang-switcher--light")}
      style={{ "--active-index": String(activeIndex) } as CSSProperties}
      role="tablist"
      aria-label="Choose language"
    >
      <span className="lang-switcher__thumb" aria-hidden="true" />
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => onChange(language)}
          role="tab"
          aria-selected={current === language}
          className={cn(
            "lang-switcher__option"
          )}
        >
          <span className={cn("lang-switcher__text", current === language && "lang-switcher__text--active")}>
            {language.toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );
}
