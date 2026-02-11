"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tourInputSchema } from "@/lib/validation";
import { z } from "zod";
import type { AppLanguage } from "@/lib/constants";

type TourFormValues = z.input<typeof tourInputSchema>;

type PosterTemplateData = {
  posterA: {
    heroTagline: string;
    featureBlocks: Array<{ title: string; lines: string[] }>;
    priceLabel: string;
  };
  posterB: {
    programTitle: string;
    timeline: Array<{ time: string; text: string }>;
    priceLabel: string;
    registerNote: string;
  };
  posterUrls?: string[];
};

type TourResponse = {
  id: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  coverImage: string;
  gallery: string[];
  price: number;
  studentLimit: number;
  duration: string;
  meetingTime: string;
  tourDate: string;
  place: string;
  location: string;
  translations: Array<{
    language: "KZ" | "RU" | "EN";
    title: string;
    description: string;
    translationStatus?: "MANUAL" | "AUTO_GENERATED" | "AUTO_EDITED";
    translationVersion?: number;
    sourceRuHash?: string | null;
    posterTemplateData: PosterTemplateData;
  }>;
};

type UploadSignature = {
  timestamp: number;
  folder: string;
  signature: string;
  apiKey: string;
  cloudName: string;
};

const EMPTY_POSTER: PosterTemplateData = {
  posterA: {
    heroTagline: "-",
    featureBlocks: [{ title: "-", lines: ["-"] }],
    priceLabel: "-"
  },
  posterB: {
    programTitle: "-",
    timeline: [{ time: "-", text: "-" }],
    priceLabel: "-",
    registerNote: "-"
  },
  posterUrls: []
};

function emptyTranslation() {
  return {
    title: "",
    description: "",
    posterTemplateData: EMPTY_POSTER,
    translationStatus: "MANUAL" as const,
    translationVersion: 1,
    sourceRuHash: null
  };
}

function normalizePosterTemplateData(input: unknown): PosterTemplateData {
  const item = typeof input === "object" && input && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const posterA = typeof item.posterA === "object" && item.posterA && !Array.isArray(item.posterA) ? (item.posterA as Record<string, unknown>) : {};
  const posterB = typeof item.posterB === "object" && item.posterB && !Array.isArray(item.posterB) ? (item.posterB as Record<string, unknown>) : {};
  const rawUrls = Array.isArray(item.posterUrls) ? item.posterUrls : [];
  const posterUrls = rawUrls.filter((v): v is string => typeof v === "string" && v.trim().length > 0);

  return {
    posterA: {
      heroTagline: typeof posterA.heroTagline === "string" && posterA.heroTagline ? posterA.heroTagline : "-",
      featureBlocks:
        Array.isArray(posterA.featureBlocks) && posterA.featureBlocks.length > 0
          ? (posterA.featureBlocks as Array<{ title?: string; lines?: string[] }>).map((block) => ({
              title: block.title && block.title.trim() ? block.title : "-",
              lines: Array.isArray(block.lines) && block.lines.length > 0 ? block.lines.map((line) => line || "-") : ["-"]
            }))
          : [{ title: "-", lines: ["-"] }],
      priceLabel: typeof posterA.priceLabel === "string" && posterA.priceLabel ? posterA.priceLabel : "-"
    },
    posterB: {
      programTitle: typeof posterB.programTitle === "string" && posterB.programTitle ? posterB.programTitle : "-",
      timeline:
        Array.isArray(posterB.timeline) && posterB.timeline.length > 0
          ? (posterB.timeline as Array<{ time?: string; text?: string }>).map((row) => ({
              time: row.time && row.time.trim() ? row.time : "-",
              text: row.text && row.text.trim() ? row.text : "-"
            }))
          : [{ time: "-", text: "-" }],
      priceLabel: typeof posterB.priceLabel === "string" && posterB.priceLabel ? posterB.priceLabel : "-",
      registerNote: typeof posterB.registerNote === "string" && posterB.registerNote ? posterB.registerNote : "-"
    },
    posterUrls
  };
}

async function uploadFileToCloudinary(file: File): Promise<string> {
  const signatureResponse = await fetch("/api/admin/upload", { method: "POST" });
  if (!signatureResponse.ok) {
    throw new Error("UPLOAD_SIGNATURE_FAILED");
  }

  const signature = (await signatureResponse.json()) as UploadSignature;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("folder", signature.folder);
  formData.append("signature", signature.signature);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!uploadResponse.ok) {
    throw new Error("UPLOAD_FAILED");
  }

  const payload = (await uploadResponse.json()) as { secure_url?: string };
  if (!payload.secure_url) {
    throw new Error("UPLOAD_FAILED");
  }
  return payload.secure_url;
}

const tourFormUi = {
  kz: {
    setupTitle: "Турды баптау",
    setupHint: "Негізгі ақпарат -> аударма -> әр тілге постерлер.",
    sectionBasics: "Негізгі",
    sectionMedia: "Баннер, галерея және баға",
    studentLimit: "Студенттер лимиті",
    sectionSchedule: "Тур логистикасы",
    sectionTranslations: "Мәтін аудармалары",
    sectionPosters: "Постерлер (әр тілге бірнеше)",
    slug: "Slug",
    status: "Күйі",
    statusDraft: "Черновик",
    statusPublished: "Жарияланған",
    coverImage: "Тур баннері",
    gallery: "Тур фотолары",
    price: "Бағасы",
    duration: "Ұзақтығы",
    meetingTime: "Жиналу уақыты/орны",
    tourDate: "Тур күні",
    place: "Қайда барамыз (маршрут/орын)",
    location: "Аймақ/қала",
    meetingTimePlaceholder: "Мысалы: 08:30, бас қақпа",
    placePlaceholder: "Мысалы: Түркістан, Қ.А. Ясауи кесенесі",
    locationPlaceholder: "Мысалы: Түркістан облысы",
    title: "Тақырып",
    description: "Сипаттама",
    postersWarning: "Жариялау үшін барлық 3 тілге кемі 1 постер жүктеген дұрыс.",
    publishWithoutPosters: "Кей тілдерде постерлер жоқ. Ескертуімен жариялау керек пе?",
    posterUploadFailed: "Постер жүктеу сәтсіз аяқталды.",
    mediaUploadFailed: "Суретті жүктеу сәтсіз аяқталды.",
    addGallery: "Фото қосу",
    bannerHint: "Негізгі беттегі шапка мен карточкада көрінеді.",
    galleryHint: "Тур бетіндегі галерея үшін бірнеше фото жүктеңіз.",
    removeImage: "Суретті өшіру",
    noBanner: "Баннер жүктелмеген",
    noGallery: "Галереяда фото жоқ",
    addPoster: "Постер қосу",
    upload: "Жүктеу",
    remove: "Өшіру",
    englishPoster: "English постер",
    russianPoster: "Русский постер",
    kazakhPoster: "Қазақша постер",
    noPosters: "Постер әлі жоқ",
    previewDraft: "Черновикті көру",
    saving: "Сақталуда...",
    saveTour: "Турды сақтау"
  },
  ru: {
    setupTitle: "Настройка тура",
    setupHint: "База -> перевод -> постеры для каждого языка.",
    sectionBasics: "Основное",
    sectionMedia: "Баннер, галерея и цена",
    studentLimit: "Лимит студентов",
    sectionSchedule: "Логистика тура",
    sectionTranslations: "Текст и перевод",
    sectionPosters: "Постеры (несколько на язык)",
    slug: "Slug",
    status: "Статус",
    statusDraft: "Черновик",
    statusPublished: "Опубликовано",
    coverImage: "Баннер тура",
    gallery: "Фотографии тура",
    price: "Цена",
    duration: "Длительность",
    meetingTime: "Время/место сбора",
    tourDate: "Дата тура",
    place: "Куда едем (место/маршрут)",
    location: "Регион/город",
    meetingTimePlaceholder: "Например: 08:30, центральный вход",
    placePlaceholder: "Например: Туркестан, мавзолей Яссауи",
    locationPlaceholder: "Например: Туркестанская область",
    title: "Название",
    description: "Описание",
    postersWarning: "Для публикации лучше загрузить хотя бы 1 постер для всех 3 языков.",
    publishWithoutPosters: "В некоторых языках нет постеров. Публиковать с предупреждением?",
    posterUploadFailed: "Не удалось загрузить постер.",
    mediaUploadFailed: "Не удалось загрузить изображение.",
    addGallery: "Добавить фото",
    bannerHint: "Используется как шапка и обложка карточки тура.",
    galleryHint: "Загрузите несколько фото для галереи страницы тура.",
    removeImage: "Удалить фото",
    noBanner: "Баннер не загружен",
    noGallery: "Фотографий пока нет",
    addPoster: "Добавить еще",
    upload: "Загрузить",
    remove: "Удалить",
    englishPoster: "English постер",
    russianPoster: "Русский постер",
    kazakhPoster: "Казахский постер",
    noPosters: "Постеров пока нет",
    previewDraft: "Предпросмотр черновика",
    saving: "Сохранение...",
    saveTour: "Сохранить тур"
  },
  en: {
    setupTitle: "Tour setup",
    setupHint: "Basics -> translation -> posters per language.",
    sectionBasics: "Basics",
    sectionMedia: "Banner, gallery and price",
    studentLimit: "Student limit",
    sectionSchedule: "Tour logistics",
    sectionTranslations: "Text and translation",
    sectionPosters: "Posters (multiple per language)",
    slug: "Slug",
    status: "Status",
    statusDraft: "Draft",
    statusPublished: "Published",
    coverImage: "Tour banner",
    gallery: "Tour photos",
    price: "Price",
    duration: "Duration",
    meetingTime: "Meeting time/place",
    tourDate: "Tour date",
    place: "Destination (route/place)",
    location: "Region/city",
    meetingTimePlaceholder: "e.g. 08:30, main entrance",
    placePlaceholder: "e.g. Turkistan, Yasawi Mausoleum",
    locationPlaceholder: "e.g. Turkistan Region",
    title: "Title",
    description: "Description",
    postersWarning: "For publishing, upload at least one poster for all 3 languages.",
    publishWithoutPosters: "Some languages have no posters. Publish anyway?",
    posterUploadFailed: "Poster upload failed.",
    mediaUploadFailed: "Image upload failed.",
    addGallery: "Add photos",
    bannerHint: "Used as hero and tour card cover.",
    galleryHint: "Upload multiple images for the tour gallery.",
    removeImage: "Remove image",
    noBanner: "Banner is not uploaded yet",
    noGallery: "No gallery photos yet",
    addPoster: "Add more",
    upload: "Upload",
    remove: "Remove",
    englishPoster: "English poster",
    russianPoster: "Russian poster",
    kazakhPoster: "Kazakh poster",
    noPosters: "No posters yet",
    previewDraft: "Preview draft",
    saving: "Saving...",
    saveTour: "Save tour"
  }
} as const;

export function TourForm({ initial, lang = "ru" }: { initial?: TourResponse; lang?: AppLanguage }) {
  const router = useRouter();
  const ui = tourFormUi[lang];
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const uploadRefs = {
    ru: useRef<HTMLInputElement | null>(null),
    kz: useRef<HTMLInputElement | null>(null),
    en: useRef<HTMLInputElement | null>(null)
  };
  const bannerUploadRef = useRef<HTMLInputElement | null>(null);
  const galleryUploadRef = useRef<HTMLInputElement | null>(null);

  const mappedInitial = useMemo(() => {
    const kzRaw = initial?.translations.find((item) => item.language === "KZ");
    const ruRaw = initial?.translations.find((item) => item.language === "RU");
    const enRaw = initial?.translations.find((item) => item.language === "EN");

    const kz = kzRaw ? { ...kzRaw, posterTemplateData: normalizePosterTemplateData(kzRaw.posterTemplateData) } : emptyTranslation();
    const ru = ruRaw ? { ...ruRaw, posterTemplateData: normalizePosterTemplateData(ruRaw.posterTemplateData) } : emptyTranslation();
    const en = enRaw ? { ...enRaw, posterTemplateData: normalizePosterTemplateData(enRaw.posterTemplateData) } : emptyTranslation();

    return {
      slug: initial?.slug ?? "",
      status: initial?.status ?? "DRAFT",
      coverImage: initial?.coverImage ?? "",
      gallery: initial?.gallery ?? [],
      price: initial?.price ?? 0,
      studentLimit: initial?.studentLimit ?? 40,
      duration: initial?.duration ?? "",
      meetingTime: initial?.meetingTime ?? "",
      tourDate: initial?.tourDate ? initial.tourDate.slice(0, 10) : "",
      place: initial?.place ?? "",
      location: initial?.location ?? "",
      translations: { kz, ru, en }
    };
  }, [initial]);

  const [posterUrlsByLang, setPosterUrlsByLang] = useState<Record<"ru" | "kz" | "en", string[]>>({
    ru: mappedInitial.translations.ru.posterTemplateData.posterUrls ?? [],
    kz: mappedInitial.translations.kz.posterTemplateData.posterUrls ?? [],
    en: mappedInitial.translations.en.posterTemplateData.posterUrls ?? []
  });

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourInputSchema),
    defaultValues: mappedInitial
  });

  function removePoster(language: "ru" | "kz" | "en", index: number) {
    setPosterUrlsByLang((prev) => ({
      ...prev,
      [language]: prev[language].filter((_, idx) => idx !== index)
    }));
  }

  function removeGalleryImage(index: number) {
    const current = form.getValues("gallery");
    form.setValue(
      "gallery",
      current.filter((_, idx) => idx !== index),
      { shouldDirty: true, shouldValidate: true }
    );
  }

  async function onUploadPoster(language: "ru" | "kz" | "en", index?: number, file?: File | null) {
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadFileToCloudinary(file);
      setPosterUrlsByLang((prev) => {
        const list = [...prev[language]];
        if (typeof index === "number") {
          list[index] = url;
        } else {
          list.push(url);
        }
        return { ...prev, [language]: list };
      });
    } catch {
      setError(ui.posterUploadFailed);
    } finally {
      setSaving(false);
    }
  }

  async function onUploadBanner(file?: File | null) {
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadFileToCloudinary(file);
      form.setValue("coverImage", url, { shouldDirty: true, shouldValidate: true });
    } catch {
      setError(ui.mediaUploadFailed);
    } finally {
      setSaving(false);
    }
  }

  async function onUploadGallery(files?: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      setSaving(true);
      const uploadedUrls = await Promise.all(Array.from(files).map((file) => uploadFileToCloudinary(file)));
      const current = form.getValues("gallery");
      form.setValue("gallery", [...current, ...uploadedUrls], {
        shouldDirty: true,
        shouldValidate: true
      });
    } catch {
      setError(ui.mediaUploadFailed);
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit(values: TourFormValues) {
    setSaving(true);
    setError("");

    const payload = {
      ...values,
      gallery: values.gallery.filter(Boolean),
      translations: {
        ru: {
          ...values.translations.ru,
          translationStatus: "MANUAL" as const,
          posterTemplateData: {
            ...values.translations.ru.posterTemplateData,
            posterUrls: posterUrlsByLang.ru.filter(Boolean)
          }
        },
        kz: {
          ...values.translations.kz,
          translationStatus:
            values.translations.kz.translationStatus === "AUTO_GENERATED" ? "AUTO_EDITED" : values.translations.kz.translationStatus,
          posterTemplateData: {
            ...values.translations.kz.posterTemplateData,
            posterUrls: posterUrlsByLang.kz.filter(Boolean)
          }
        },
        en: {
          ...values.translations.en,
          translationStatus:
            values.translations.en.translationStatus === "AUTO_GENERATED" ? "AUTO_EDITED" : values.translations.en.translationStatus,
          posterTemplateData: {
            ...values.translations.en.posterTemplateData,
            posterUrls: posterUrlsByLang.en.filter(Boolean)
          }
        }
      }
    };

    const missingLangs = (["ru", "kz", "en"] as const).filter((lng) => (posterUrlsByLang[lng].filter(Boolean).length === 0));
    if (values.status === "PUBLISHED" && missingLangs.length > 0) {
      const accepted = window.confirm(ui.publishWithoutPosters);
      if (!accepted) {
        setSaving(false);
        return;
      }
    }

    const url = initial ? `/api/admin/tours/${initial.id}` : "/api/admin/tours";
    const method = initial ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(data?.message || "Failed to save tour");
      setSaving(false);
      return;
    }

    router.push("/admin/tours");
    router.refresh();
  }

  function renderPosterColumn(language: "en" | "ru" | "kz", title: string) {
    const urls = posterUrlsByLang[language];
    return (
      <div className="space-y-2 rounded-xl border border-white/20 bg-black/20 p-3">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        {urls.length === 0 ? <p className="text-xs text-white/60">{ui.noPosters}</p> : null}
        {urls.map((url, index) => (
          <div key={`${language}-${index}`} className="space-y-2 rounded-lg border border-white/15 bg-white/5 p-2">
            {url ? <img src={url} alt={`${language}-poster-${index + 1}`} className="w-full rounded-lg object-cover" /> : null}
            <button
              type="button"
              onClick={() => removePoster(language, index)}
              className="w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
            >
              {ui.remove}
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => uploadRefs[language].current?.click()}
            className="rounded-lg bg-white/20 px-3 py-2 text-xs font-semibold text-white"
          >
            {ui.upload}
          </button>
          <input
            ref={uploadRefs[language]}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void onUploadPoster(language, undefined, event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </div>
      </div>
    );
  }

  const bannerUrl = form.watch("coverImage");
  const galleryImages = form.watch("gallery");
  const slugValue = form.watch("slug");
  const statusValue = form.watch("status");
  const previewHref = initial?.id && slugValue && statusValue === "DRAFT" ? `/tours/${encodeURIComponent(slugValue)}?lang=${lang}&preview=1` : null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <section className="rounded-2xl border border-white/20 bg-white/8 p-4">
        <h2 className="text-base font-bold text-white">{ui.setupTitle}</h2>
        <p className="mt-1 text-sm text-white/70">{ui.setupHint}</p>
      </section>

      {error ? <p className="rounded-xl bg-red-500/20 p-3 text-sm text-red-100">{error}</p> : null}

      {form.watch("status") === "PUBLISHED" &&
      (posterUrlsByLang.ru.filter(Boolean).length === 0 ||
        posterUrlsByLang.kz.filter(Boolean).length === 0 ||
        posterUrlsByLang.en.filter(Boolean).length === 0) ? (
        <p className="rounded-xl bg-yellow-500/20 p-3 text-sm text-yellow-100">{ui.postersWarning}</p>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{ui.sectionBasics}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={ui.slug} {...form.register("slug")} />
          <Select
            label={ui.status}
            {...form.register("status")}
            options={[
              { value: "DRAFT", label: ui.statusDraft },
              { value: "PUBLISHED", label: ui.statusPublished }
            ]}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{ui.sectionMedia}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input type="hidden" {...form.register("coverImage")} />
          <div className="space-y-2 md:col-span-2">
            <span className="block text-xs text-white/80">{ui.coverImage}</span>
            <div className="rounded-xl border border-white/30 bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-white/65">{ui.bannerHint}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => bannerUploadRef.current?.click()}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    {ui.upload}
                  </button>
                  {bannerUrl ? (
                    <button
                      type="button"
                      onClick={() => form.setValue("coverImage", "", { shouldDirty: true, shouldValidate: true })}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      {ui.remove}
                    </button>
                  ) : null}
                </div>
              </div>
              {bannerUrl ? (
                <img src={bannerUrl} alt="tour-banner" className="h-52 w-full rounded-lg object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-white/25 bg-black/20 text-sm text-white/50">
                  {ui.noBanner}
                </div>
              )}
              <input
                ref={bannerUploadRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  void onUploadBanner(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <span className="block text-xs text-white/80">{ui.gallery}</span>
            <div className="rounded-xl border border-white/30 bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-white/65">{ui.galleryHint}</p>
                <button
                  type="button"
                  onClick={() => galleryUploadRef.current?.click()}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  {ui.addGallery}
                </button>
              </div>
              {galleryImages.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryImages.map((url, index) => (
                    <div key={`gallery-${index}`} className="space-y-2 rounded-lg border border-white/20 bg-white/5 p-2">
                      <img src={url} alt={`gallery-${index + 1}`} className="h-28 w-full rounded-md object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="w-full rounded-lg bg-red-600 px-2 py-1.5 text-xs font-semibold text-white"
                      >
                        {ui.removeImage}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-white/25 bg-black/20 text-sm text-white/50">
                  {ui.noGallery}
                </div>
              )}
              <input
                ref={galleryUploadRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  void onUploadGallery(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </div>
          </div>
          <Input label={ui.price} type="number" {...form.register("price", { valueAsNumber: true })} />
          <Input label={ui.studentLimit} type="number" {...form.register("studentLimit", { valueAsNumber: true })} />
          <Input label={ui.duration} {...form.register("duration")} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{ui.sectionSchedule}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={ui.meetingTime} placeholder={ui.meetingTimePlaceholder} {...form.register("meetingTime")} />
          <Input label={ui.tourDate} type="date" {...form.register("tourDate")} />
          <Input label={ui.place} placeholder={ui.placePlaceholder} {...form.register("place")} />
          <Input label={ui.location} placeholder={ui.locationPlaceholder} {...form.register("location")} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{ui.sectionTranslations}</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/20 bg-black/20 p-3">
            <h4 className="mb-2 text-sm font-bold uppercase text-white">RU</h4>
            <Input label={ui.title} {...form.register("translations.ru.title")} />
            <Input label={ui.description} {...form.register("translations.ru.description")} />
          </div>
          <div className="rounded-xl border border-white/20 bg-black/20 p-3">
            <h4 className="mb-2 text-sm font-bold uppercase text-white">KZ</h4>
            <Input label={ui.title} {...form.register("translations.kz.title")} />
            <Input label={ui.description} {...form.register("translations.kz.description")} />
          </div>
          <div className="rounded-xl border border-white/20 bg-black/20 p-3">
            <h4 className="mb-2 text-sm font-bold uppercase text-white">EN</h4>
            <Input label={ui.title} {...form.register("translations.en.title")} />
            <Input label={ui.description} {...form.register("translations.en.description")} />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{ui.sectionPosters}</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {renderPosterColumn("en", ui.englishPoster)}
          {renderPosterColumn("ru", ui.russianPoster)}
          {renderPosterColumn("kz", ui.kazakhPoster)}
        </div>
      </section>

      <div className="sticky bottom-4 z-20 flex justify-end rounded-2xl border border-white/25 bg-black/35 p-3 backdrop-blur-md">
        <div className="flex flex-wrap justify-end gap-2">
          {previewHref ? (
            <Link
              href={previewHref}
              target="_blank"
              className="rounded-xl border border-white/35 bg-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
            >
              {ui.previewDraft}
            </Link>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#8d1111] px-5 py-2 font-semibold text-white disabled:opacity-60"
          >
            {saving ? ui.saving : ui.saveTour}
          </button>
        </div>
      </div>
    </form>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

function Input({ label, ...props }: InputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/80">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white outline-none disabled:opacity-50"
      />
    </label>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ value: string; label: string }>;
};

function Select({ label, options, ...props }: SelectProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/80">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
