"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AppLanguage } from "@/lib/constants";

type Settings = {
  brandTitle: string;
  brandSubtitle: string;
  instagramHandle: string;
  footerAddress: string;
  topFrameText: string;
  bottomFrameText: string;
};

const defaults: Settings = {
  brandTitle: "Этно-тур с MNU Travel",
  brandSubtitle: "Откройте для себя свободу и тайны кочевой жизни",
  instagramHandle: "@mnutravel",
  footerAddress: "Зона отдыха Balqaragai, Астана",
  topFrameText: "Этно-тур с MNU Travel",
  bottomFrameText: "Почувствуй атмосферу этно-тура с MNU Travel"
};

const posterSettingsUi = {
  kz: {
    saved: "Баптаулар сақталды",
    saveError: "Сақтау қатесі",
    loading: "Баптаулар жүктелуде...",
    brandTitle: "Бренд тақырыбы",
    brandSubtitle: "Бренд қосымша тақырыбы",
    instagramHandle: "Instagram аккаунты",
    footerAddress: "Төменгі адрес",
    topFrameText: "Жоғарғы рамка мәтіні",
    bottomFrameText: "Төменгі рамка мәтіні",
    saving: "Сақталуда...",
    saveBtn: "Постер баптауларын сақтау"
  },
  ru: {
    saved: "Настройки сохранены",
    saveError: "Ошибка сохранения",
    loading: "Загрузка настроек...",
    brandTitle: "Brand title",
    brandSubtitle: "Brand subtitle",
    instagramHandle: "Instagram handle",
    footerAddress: "Footer address",
    topFrameText: "Top frame text",
    bottomFrameText: "Bottom frame text",
    saving: "Сохранение...",
    saveBtn: "Сохранить настройки постеров"
  },
  en: {
    saved: "Settings saved",
    saveError: "Save error",
    loading: "Loading settings...",
    brandTitle: "Brand title",
    brandSubtitle: "Brand subtitle",
    instagramHandle: "Instagram handle",
    footerAddress: "Footer address",
    topFrameText: "Top frame text",
    bottomFrameText: "Bottom frame text",
    saving: "Saving...",
    saveBtn: "Save poster settings"
  }
} as const;

export function PosterSettingsPanel({ lang = "ru" }: { lang?: AppLanguage }) {
  const ui = posterSettingsUi[lang];
  const [form, setForm] = useState<Settings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/settings/poster", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setForm({
            brandTitle: data.brandTitle,
            brandSubtitle: data.brandSubtitle,
            instagramHandle: data.instagramHandle,
            footerAddress: data.footerAddress,
            topFrameText: data.topFrameText,
            bottomFrameText: data.bottomFrameText
          });
        }
      }
      setLoading(false);
    }

    void load();
  }, []);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/settings/poster", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setSaving(false);
    if (response.ok) {
      setMessage(ui.saved);
    } else {
      const err = await response.json();
      setMessage(err.message || ui.saveError);
    }
  }

  if (loading) {
    return <p className="text-sm text-white/80">{ui.loading}</p>;
  }

  return (
    <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-white/20 bg-white/8 p-5">
      {message ? <p className="rounded-lg bg-white/15 p-2 text-sm">{message}</p> : null}

      <Field label={ui.brandTitle} value={form.brandTitle} onChange={(value) => setForm((prev) => ({ ...prev, brandTitle: value }))} />
      <Field label={ui.brandSubtitle} value={form.brandSubtitle} onChange={(value) => setForm((prev) => ({ ...prev, brandSubtitle: value }))} />
      <Field label={ui.instagramHandle} value={form.instagramHandle} onChange={(value) => setForm((prev) => ({ ...prev, instagramHandle: value }))} />
      <Field label={ui.footerAddress} value={form.footerAddress} onChange={(value) => setForm((prev) => ({ ...prev, footerAddress: value }))} />
      <Field label={ui.topFrameText} value={form.topFrameText} onChange={(value) => setForm((prev) => ({ ...prev, topFrameText: value }))} />
      <Field label={ui.bottomFrameText} value={form.bottomFrameText} onChange={(value) => setForm((prev) => ({ ...prev, bottomFrameText: value }))} />

      <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {saving ? ui.saving : ui.saveBtn}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white"
      />
    </label>
  );
}
