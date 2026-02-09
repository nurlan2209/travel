export const LANGUAGES = ["kz", "ru", "en"] as const;

export type AppLanguage = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "kz";

export const ROLE_LABELS = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  STUDENT: "Student"
} as const;
