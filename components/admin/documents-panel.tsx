"use client";

import { useMemo, useState } from "react";
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

type UploadResponse = {
  ok: boolean;
  url: string;
  fileName: string;
  fileSize: number;
};

const uiByLang = {
  kz: {
    addCard: "Құжат қосу",
    langRu: "Орыс тілі (RU)",
    langKz: "Қазақ тілі (KZ)",
    langEn: "Ағылшын тілі (EN)",
    title: "Атауы",
    description: "Сипаттама",
    file: "Құжат файлы",
    fileHint: "PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX және т.б. (25MB дейін)",
    chooseFile: "Файл таңдау",
    replaceFile: "Файлды ауыстыру",
    uploadedFile: "Жүктелген файл",
    sortOrder: "Реті",
    active: "Белсенді",
    create: "Қосу",
    saving: "Сақталуда...",
    uploading: "Жүктеу...",
    noRows: "Құжаттар әлі жоқ",
    remove: "Жою",
    open: "Ашу",
    confirmDelete: "Құжатты жою керек пе?",
    loading: "Жүктелуде...",
    createFailed: "Құжатты қосу мүмкін болмады",
    updateFailed: "Құжатты сақтау мүмкін болмады",
    deleteFailed: "Құжатты жою мүмкін болмады",
    uploadFailed: "Файлды жүктеу мүмкін болмады",
    fileRequired: "Алдымен құжат файлын жүктеңіз"
  },
  ru: {
    addCard: "Добавить документ",
    langRu: "Русский (RU)",
    langKz: "Казахский (KZ)",
    langEn: "Английский (EN)",
    title: "Название",
    description: "Описание",
    file: "Файл документа",
    fileHint: "PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX и др. (до 25MB)",
    chooseFile: "Выбрать файл",
    replaceFile: "Заменить файл",
    uploadedFile: "Загруженный файл",
    sortOrder: "Порядок",
    active: "Активен",
    create: "Добавить",
    saving: "Сохранение...",
    uploading: "Загрузка...",
    noRows: "Документов пока нет",
    remove: "Удалить",
    open: "Открыть",
    confirmDelete: "Удалить документ?",
    loading: "Загрузка...",
    createFailed: "Не удалось добавить документ",
    updateFailed: "Не удалось сохранить документ",
    deleteFailed: "Не удалось удалить документ",
    uploadFailed: "Не удалось загрузить файл",
    fileRequired: "Сначала загрузите файл документа"
  },
  en: {
    addCard: "Add document",
    langRu: "Russian (RU)",
    langKz: "Kazakh (KZ)",
    langEn: "English (EN)",
    title: "Title",
    description: "Description",
    file: "Document file",
    fileHint: "PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, etc. (up to 25MB)",
    chooseFile: "Choose file",
    replaceFile: "Replace file",
    uploadedFile: "Uploaded file",
    sortOrder: "Order",
    active: "Active",
    create: "Create",
    saving: "Saving...",
    uploading: "Uploading...",
    noRows: "No documents yet",
    remove: "Delete",
    open: "Open",
    confirmDelete: "Delete this document?",
    loading: "Loading...",
    createFailed: "Failed to create document",
    updateFailed: "Failed to update document",
    deleteFailed: "Failed to delete document",
    uploadFailed: "Failed to upload file",
    fileRequired: "Upload document file first"
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

function extractFileName(fileUrl: string) {
  const value = fileUrl.trim();
  if (!value) return "";
  const index = value.lastIndexOf("/");
  return index >= 0 ? decodeURIComponent(value.slice(index + 1)) : value;
}

export function DocumentsPanel({ initialDocuments, lang = "ru" }: { initialDocuments: SiteDocument[]; lang?: AppLanguage }) {
  const ui = uiByLang[lang];
  const [documents, setDocuments] = useState<SiteDocument[]>(initialDocuments);
  const [form, setForm] = useState({ ...emptyDocument });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCreateFile, setUploadingCreateFile] = useState(false);
  const [uploadingReplaceId, setUploadingReplaceId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const documentsSorted = useMemo(
    () => [...documents].sort((a, b) => a.sortOrder - b.sortOrder),
    [documents]
  );

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

  async function uploadDocumentFile(file: File) {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/documents/upload", {
      method: "POST",
      body
    });

    if (!response.ok) {
      const errorMessage = await readErrorMessage(response, ui.uploadFailed);
      throw new Error(errorMessage);
    }

    return (await response.json()) as UploadResponse;
  }

  async function onCreateFileChange(file: File | null) {
    if (!file) return;
    setMessage("");
    setUploadingCreateFile(true);
    try {
      const uploaded = await uploadDocumentFile(file);
      setForm((prev) => ({ ...prev, fileUrl: uploaded.url }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ui.uploadFailed;
      setMessage(`${ui.uploadFailed}: ${errorMessage}`);
    } finally {
      setUploadingCreateFile(false);
    }
  }

  async function onReplaceFile(id: string, file: File | null) {
    if (!file) return;
    setMessage("");
    setUploadingReplaceId(id);
    try {
      const uploaded = await uploadDocumentFile(file);
      await onUpdate(id, { fileUrl: uploaded.url });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ui.uploadFailed;
      setMessage(`${ui.uploadFailed}: ${errorMessage}`);
    } finally {
      setUploadingReplaceId(null);
    }
  }

  async function onCreate() {
    if (!form.fileUrl.trim()) {
      setMessage(ui.fileRequired);
      return;
    }

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
      return;
    }
    await loadDocuments();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/20 bg-black/20 p-4">
        <h2 className="mb-4 text-xl font-bold">{ui.addCard}</h2>

        <div className="grid gap-3 xl:grid-cols-3">
          <LanguageFields
            title={ui.langRu}
            titleLabel={ui.title}
            descriptionLabel={ui.description}
            titleValue={form.titleRu}
            descriptionValue={form.descriptionRu}
            onTitleChange={(value) => setForm((prev) => ({ ...prev, titleRu: value }))}
            onDescriptionChange={(value) => setForm((prev) => ({ ...prev, descriptionRu: value }))}
          />
          <LanguageFields
            title={ui.langKz}
            titleLabel={ui.title}
            descriptionLabel={ui.description}
            titleValue={form.titleKz}
            descriptionValue={form.descriptionKz}
            onTitleChange={(value) => setForm((prev) => ({ ...prev, titleKz: value }))}
            onDescriptionChange={(value) => setForm((prev) => ({ ...prev, descriptionKz: value }))}
          />
          <LanguageFields
            title={ui.langEn}
            titleLabel={ui.title}
            descriptionLabel={ui.description}
            titleValue={form.titleEn}
            descriptionValue={form.descriptionEn}
            onTitleChange={(value) => setForm((prev) => ({ ...prev, titleEn: value }))}
            onDescriptionChange={(value) => setForm((prev) => ({ ...prev, descriptionEn: value }))}
          />
        </div>

        <div className="mt-4 rounded-xl border border-white/15 bg-black/15 p-3">
          <p className="text-sm font-semibold text-white">{ui.file}</p>
          <p className="mt-1 text-xs text-white/70">{ui.fileHint}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm">
              {uploadingCreateFile ? ui.uploading : ui.chooseFile}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp"
                disabled={uploadingCreateFile}
                onChange={(event) => void onCreateFileChange(event.target.files?.[0] ?? null)}
              />
            </label>
            {form.fileUrl ? (
              <a href={form.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-[#9fc2ff] underline">
                {ui.uploadedFile}: {extractFileName(form.fileUrl)}
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field
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
          disabled={saving || uploadingCreateFile}
          className="mt-4 rounded-xl bg-[#8d1111] px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? ui.saving : ui.create}
        </button>
        {message ? <p className="mt-2 text-sm text-rose-300">{message}</p> : null}
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-sm text-white/70">{ui.loading}</p> : null}
        {documents.length === 0 ? <p className="text-sm text-white/70">{ui.noRows}</p> : null}

        {documentsSorted.map((document) => (
          <div key={document.id} className="rounded-2xl border border-white/20 bg-white/8 p-4">
            <div className="mb-4 rounded-xl border border-white/15 bg-black/15 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <a href={document.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/30 px-3 py-1 text-sm">
                  {ui.open}
                </a>
                <span className="text-sm text-white/75">{extractFileName(document.fileUrl)}</span>
                <label className="cursor-pointer rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-sm">
                  {uploadingReplaceId === document.id ? ui.uploading : ui.replaceFile}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp"
                    disabled={uploadingReplaceId === document.id}
                    onChange={(event) => void onReplaceFile(document.id, event.target.files?.[0] ?? null)}
                  />
                </label>
                <button type="button" onClick={() => void onDelete(document.id)} className="rounded-lg bg-red-700 px-3 py-1 text-sm font-semibold">
                  {ui.remove}
                </button>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Field
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
            </div>

            <div className="grid gap-3 xl:grid-cols-3">
              <LanguageFields
                title={ui.langRu}
                titleLabel={ui.title}
                descriptionLabel={ui.description}
                titleDefault={document.titleRu}
                descriptionDefault={document.descriptionRu}
                onTitleBlur={(value) => void onUpdate(document.id, { titleRu: value })}
                onDescriptionBlur={(value) => void onUpdate(document.id, { descriptionRu: value })}
              />
              <LanguageFields
                title={ui.langKz}
                titleLabel={ui.title}
                descriptionLabel={ui.description}
                titleDefault={document.titleKz}
                descriptionDefault={document.descriptionKz}
                onTitleBlur={(value) => void onUpdate(document.id, { titleKz: value })}
                onDescriptionBlur={(value) => void onUpdate(document.id, { descriptionKz: value })}
              />
              <LanguageFields
                title={ui.langEn}
                titleLabel={ui.title}
                descriptionLabel={ui.description}
                titleDefault={document.titleEn}
                descriptionDefault={document.descriptionEn}
                onTitleBlur={(value) => void onUpdate(document.id, { titleEn: value })}
                onDescriptionBlur={(value) => void onUpdate(document.id, { descriptionEn: value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguageFields({
  title,
  titleLabel,
  descriptionLabel,
  titleValue,
  descriptionValue,
  onTitleChange,
  onDescriptionChange,
  titleDefault,
  descriptionDefault,
  onTitleBlur,
  onDescriptionBlur
}: {
  title: string;
  titleLabel: string;
  descriptionLabel: string;
  titleValue?: string;
  descriptionValue?: string;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  titleDefault?: string;
  descriptionDefault?: string;
  onTitleBlur?: (value: string) => void;
  onDescriptionBlur?: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-black/15 p-3">
      <p className="mb-2 text-sm font-semibold text-white">{title}</p>
      <div className="space-y-3">
        <Field
          label={titleLabel}
          value={titleValue}
          onChange={onTitleChange}
          defaultValue={titleDefault}
          onBlur={onTitleBlur}
        />
        <Field
          label={descriptionLabel}
          multiline
          value={descriptionValue}
          onChange={onDescriptionChange}
          defaultValue={descriptionDefault}
          onBlur={onDescriptionBlur}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  defaultValue,
  onChange,
  onBlur,
  type = "text",
  multiline = false
}: {
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  type?: "text" | "number";
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/80">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          defaultValue={defaultValue}
          rows={3}
          onChange={(event) => onChange?.(event.target.value)}
          onBlur={(event) => onBlur?.(event.target.value)}
          className="w-full resize-y rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={(event) => onChange?.(event.target.value)}
          onBlur={(event) => onBlur?.(event.target.value)}
          className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white outline-none"
        />
      )}
    </label>
  );
}
