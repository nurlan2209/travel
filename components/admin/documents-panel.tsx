"use client";

import { useState } from "react";
import type { AppLanguage } from "@/lib/constants";

type SiteDocument = {
  id: string;
  titleRu: string;
  titleKz: string;
  titleEn: string;
  descriptionRu: string;
  descriptionKz: string;
  descriptionEn: string;
  fileUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const uiByLang = {
  kz: {
    addCard: "Құжат қосу",
    titleRu: "Атауы (RU)",
    titleKz: "Атауы (KZ)",
    titleEn: "Атауы (EN)",
    descriptionRu: "Сипаттама (RU)",
    descriptionKz: "Сипаттама (KZ)",
    descriptionEn: "Сипаттама (EN)",
    fileUrl: "Құжат сілтемесі",
    sortOrder: "Реті",
    active: "Белсенді",
    create: "Қосу",
    saving: "Сақталуда...",
    noRows: "Құжаттар әлі жоқ",
    update: "Сақтау",
    remove: "Жою",
    open: "Ашу",
    confirmDelete: "Құжатты жою керек пе?",
    loading: "Жүктелуде...",
    createFailed: "Құжатты қосу мүмкін болмады",
    updateFailed: "Құжатты сақтау мүмкін болмады",
    deleteFailed: "Құжатты жою мүмкін болмады"
  },
  ru: {
    addCard: "Добавить документ",
    titleRu: "Название (RU)",
    titleKz: "Название (KZ)",
    titleEn: "Название (EN)",
    descriptionRu: "Описание (RU)",
    descriptionKz: "Описание (KZ)",
    descriptionEn: "Описание (EN)",
    fileUrl: "Ссылка на документ",
    sortOrder: "Порядок",
    active: "Активен",
    create: "Добавить",
    saving: "Сохранение...",
    noRows: "Документов пока нет",
    update: "Сохранить",
    remove: "Удалить",
    open: "Открыть",
    confirmDelete: "Удалить документ?",
    loading: "Загрузка...",
    createFailed: "Не удалось добавить документ",
    updateFailed: "Не удалось сохранить документ",
    deleteFailed: "Не удалось удалить документ"
  },
  en: {
    addCard: "Add document",
    titleRu: "Title (RU)",
    titleKz: "Title (KZ)",
    titleEn: "Title (EN)",
    descriptionRu: "Description (RU)",
    descriptionKz: "Description (KZ)",
    descriptionEn: "Description (EN)",
    fileUrl: "Document URL",
    sortOrder: "Order",
    active: "Active",
    create: "Create",
    saving: "Saving...",
    noRows: "No documents yet",
    update: "Save",
    remove: "Delete",
    open: "Open",
    confirmDelete: "Delete this document?",
    loading: "Loading...",
    createFailed: "Failed to create document",
    updateFailed: "Failed to update document",
    deleteFailed: "Failed to delete document"
  }
} as const;

const emptyDocument = {
  titleRu: "",
  titleKz: "",
  titleEn: "",
  descriptionRu: "",
  descriptionKz: "",
  descriptionEn: "",
  fileUrl: "",
  sortOrder: 0,
  isActive: true
};

export function DocumentsPanel({ initialDocuments, lang = "ru" }: { initialDocuments: SiteDocument[]; lang?: AppLanguage }) {
  const ui = uiByLang[lang];
  const [documents, setDocuments] = useState<SiteDocument[]>(initialDocuments);
  const [form, setForm] = useState({ ...emptyDocument });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function readErrorMessage(response: Response, fallback: string) {
    try {
      const body = (await response.json()) as { message?: string };
      if (body?.message) return body.message;
      return fallback;
    } catch {
      return fallback;
    }
  }

  async function loadDocuments() {
    setLoading(true);
    const response = await fetch("/api/admin/documents", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as SiteDocument[];
      setDocuments(data);
    } else {
      const errorMessage = await readErrorMessage(response, ui.loading);
      console.error("[DocumentsPanel] loadDocuments failed", { status: response.status, errorMessage });
    }
    setLoading(false);
  }

  async function onCreate() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      const errorMessage = await readErrorMessage(response, ui.createFailed);
      setMessage(`${ui.createFailed}: ${errorMessage}`);
      console.error("[DocumentsPanel] onCreate failed", { status: response.status, errorMessage, payload: form });
      setSaving(false);
      return;
    }

    setForm({ ...emptyDocument });
    await loadDocuments();
    setSaving(false);
  }

  async function onUpdate(id: string, payload: Partial<SiteDocument>) {
    const response = await fetch(`/api/admin/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorMessage = await readErrorMessage(response, ui.updateFailed);
      setMessage(`${ui.updateFailed}: ${errorMessage}`);
      console.error("[DocumentsPanel] onUpdate failed", { id, status: response.status, errorMessage, payload });
      return;
    }
    await loadDocuments();
  }

  async function onDelete(id: string) {
    const accepted = window.confirm(ui.confirmDelete);
    if (!accepted) return;
    const response = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const errorMessage = await readErrorMessage(response, ui.deleteFailed);
      setMessage(`${ui.deleteFailed}: ${errorMessage}`);
      console.error("[DocumentsPanel] onDelete failed", { id, status: response.status, errorMessage });
      return;
    }
    await loadDocuments();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/20 bg-black/20 p-4">
        <h2 className="mb-4 text-xl font-bold">{ui.addCard}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={ui.titleRu} value={form.titleRu} onChange={(value) => setForm((prev) => ({ ...prev, titleRu: value }))} />
          <Input label={ui.titleKz} value={form.titleKz} onChange={(value) => setForm((prev) => ({ ...prev, titleKz: value }))} />
          <Input label={ui.titleEn} value={form.titleEn} onChange={(value) => setForm((prev) => ({ ...prev, titleEn: value }))} />
          <Input label={ui.fileUrl} value={form.fileUrl} onChange={(value) => setForm((prev) => ({ ...prev, fileUrl: value }))} />
          <Input label={ui.descriptionRu} value={form.descriptionRu} onChange={(value) => setForm((prev) => ({ ...prev, descriptionRu: value }))} />
          <Input label={ui.descriptionKz} value={form.descriptionKz} onChange={(value) => setForm((prev) => ({ ...prev, descriptionKz: value }))} />
          <Input label={ui.descriptionEn} value={form.descriptionEn} onChange={(value) => setForm((prev) => ({ ...prev, descriptionEn: value }))} />
          <Input
            label={ui.sortOrder}
            type="number"
            value={String(form.sortOrder)}
            onChange={(value) => setForm((prev) => ({ ...prev, sortOrder: Number(value) || 0 }))}
          />
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            {ui.active}
          </label>
        </div>
        <button
          type="button"
          onClick={() => void onCreate()}
          disabled={saving}
          className="mt-4 rounded-xl bg-[#8d1111] px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? ui.saving : ui.create}
        </button>
        {message ? <p className="mt-2 text-sm text-rose-300">{message}</p> : null}
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-sm text-white/70">{ui.loading}</p> : null}
        {documents.length === 0 ? <p className="text-sm text-white/70">{ui.noRows}</p> : null}

        {documents.map((document) => (
          <div key={document.id} className="rounded-2xl border border-white/20 bg-white/8 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input label={ui.titleRu} defaultValue={document.titleRu} onBlur={(value) => void onUpdate(document.id, { titleRu: value })} />
              <Input label={ui.titleKz} defaultValue={document.titleKz} onBlur={(value) => void onUpdate(document.id, { titleKz: value })} />
              <Input label={ui.titleEn} defaultValue={document.titleEn} onBlur={(value) => void onUpdate(document.id, { titleEn: value })} />
              <Input label={ui.fileUrl} defaultValue={document.fileUrl} onBlur={(value) => void onUpdate(document.id, { fileUrl: value })} />
              <Input label={ui.descriptionRu} defaultValue={document.descriptionRu} onBlur={(value) => void onUpdate(document.id, { descriptionRu: value })} />
              <Input label={ui.descriptionKz} defaultValue={document.descriptionKz} onBlur={(value) => void onUpdate(document.id, { descriptionKz: value })} />
              <Input label={ui.descriptionEn} defaultValue={document.descriptionEn} onBlur={(value) => void onUpdate(document.id, { descriptionEn: value })} />
              <Input
                label={ui.sortOrder}
                type="number"
                defaultValue={String(document.sortOrder)}
                onBlur={(value) => void onUpdate(document.id, { sortOrder: Number(value) || 0 })}
              />
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input type="checkbox" checked={document.isActive} onChange={(event) => void onUpdate(document.id, { isActive: event.target.checked })} />
                {ui.active}
              </label>
            </div>

            <div className="mt-3 flex gap-2">
              <a href={document.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/30 px-3 py-1 text-sm">
                {ui.open}
              </a>
              <button type="button" onClick={() => void onDelete(document.id)} className="rounded-lg bg-red-700 px-3 py-1 text-sm font-semibold">
                {ui.remove}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  defaultValue,
  onChange,
  onBlur,
  type = "text"
}: {
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/80">{label}</span>
      <input
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => onChange?.(event.target.value)}
        onBlur={(event) => onBlur?.(event.target.value)}
        className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white"
      />
    </label>
  );
}
