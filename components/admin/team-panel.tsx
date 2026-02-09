"use client";

import { useRef, useState } from "react";
import type { AppLanguage } from "@/lib/constants";

type TeamMember = {
  id: string;
  fullNameRu: string;
  fullNameKz: string;
  fullNameEn: string;
  positionRu: string;
  positionKz: string;
  positionEn: string;
  photoUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const uiByLang = {
  kz: {
    addCard: "Карточка қосу",
    fioRu: "ФИО (RU)",
    fioKz: "ФИО (KZ)",
    fioEn: "ФИО (EN)",
    roleRu: "Лауазым (RU)",
    roleKz: "Лауазым (KZ)",
    roleEn: "Лауазым (EN)",
    photoUrl: "Фото URL",
    uploadPhoto: "Фото жүктеу",
    sortOrder: "Сұрыптау",
    active: "Белсенді",
    create: "Қосу",
    saving: "Сақталуда...",
    noCards: "Команда карточкалары әлі жоқ",
    update: "Сақтау",
    remove: "Жою",
    confirmDelete: "Команда карточкасын жою керек пе?",
    loading: "Жүктелуде...",
    createFailed: "Карточканы қосу мүмкін болмады",
    updateFailed: "Карточканы сақтау мүмкін болмады",
    deleteFailed: "Карточканы жою мүмкін болмады",
    uploadFailed: "Фото жүктеу сәтсіз аяқталды"
  },
  ru: {
    addCard: "Добавить карточку",
    fioRu: "ФИО (RU)",
    fioKz: "ФИО (KZ)",
    fioEn: "ФИО (EN)",
    roleRu: "Должность (RU)",
    roleKz: "Должность (KZ)",
    roleEn: "Должность (EN)",
    photoUrl: "Фото URL",
    uploadPhoto: "Загрузить фото",
    sortOrder: "Порядок",
    active: "Активна",
    create: "Добавить",
    saving: "Сохранение...",
    noCards: "Карточек команды пока нет",
    update: "Сохранить",
    remove: "Удалить",
    confirmDelete: "Удалить карточку команды?",
    loading: "Загрузка...",
    createFailed: "Не удалось добавить карточку",
    updateFailed: "Не удалось сохранить карточку",
    deleteFailed: "Не удалось удалить карточку",
    uploadFailed: "Не удалось загрузить фото"
  },
  en: {
    addCard: "Add card",
    fioRu: "Full name (RU)",
    fioKz: "Full name (KZ)",
    fioEn: "Full name (EN)",
    roleRu: "Position (RU)",
    roleKz: "Position (KZ)",
    roleEn: "Position (EN)",
    photoUrl: "Photo URL",
    uploadPhoto: "Upload photo",
    sortOrder: "Order",
    active: "Active",
    create: "Create",
    saving: "Saving...",
    noCards: "No team cards yet",
    update: "Save",
    remove: "Delete",
    confirmDelete: "Delete team card?",
    loading: "Loading...",
    createFailed: "Failed to create card",
    updateFailed: "Failed to update card",
    deleteFailed: "Failed to delete card",
    uploadFailed: "Failed to upload photo"
  }
} as const;

const emptyMember = {
  fullNameRu: "",
  fullNameKz: "",
  fullNameEn: "",
  positionRu: "",
  positionKz: "",
  positionEn: "",
  photoUrl: "",
  sortOrder: 0,
  isActive: true
};

type UploadSignature = {
  timestamp: number;
  folder: string;
  signature: string;
  apiKey: string;
  cloudName: string;
};

async function uploadFileToCloudinary(file: File): Promise<string> {
  const signatureResponse = await fetch("/api/admin/upload", {
    method: "POST"
  });
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

export function TeamPanel({ initialMembers, lang = "ru" }: { initialMembers: TeamMember[]; lang?: AppLanguage }) {
  const ui = uiByLang[lang];
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [form, setForm] = useState({ ...emptyMember });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const createUploadRef = useRef<HTMLInputElement | null>(null);

  async function readErrorMessage(response: Response, fallback: string) {
    try {
      const body = (await response.json()) as { message?: string; debugInfo?: unknown };
      if (body?.message) {
        if (body.debugInfo) {
          console.error("[TeamPanel] API debug info:", body.debugInfo);
        }
        return body.message;
      }
      return fallback;
    } catch {
      return fallback;
    }
  }

  async function loadMembers() {
    setLoading(true);
    const response = await fetch("/api/admin/team", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as TeamMember[];
      setMembers(data);
    } else {
      const errorMessage = await readErrorMessage(response, ui.loading);
      console.error("[TeamPanel] loadMembers failed", { status: response.status, errorMessage });
    }
    setLoading(false);
  }

  async function onCreate() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      const errorMessage = await readErrorMessage(response, ui.createFailed);
      setMessage(`${ui.createFailed}: ${errorMessage}`);
      console.error("[TeamPanel] onCreate failed", { status: response.status, errorMessage, payload: form });
      setSaving(false);
      return;
    }

    setForm({ ...emptyMember });
    await loadMembers();
    setSaving(false);
  }

  async function onUpdate(id: string, payload: Partial<TeamMember>) {
    const response = await fetch(`/api/admin/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorMessage = await readErrorMessage(response, ui.updateFailed);
      setMessage(`${ui.updateFailed}: ${errorMessage}`);
      console.error("[TeamPanel] onUpdate failed", { id, status: response.status, errorMessage, payload });
      return;
    }
    await loadMembers();
  }

  async function onDelete(id: string) {
    const accepted = window.confirm(ui.confirmDelete);
    if (!accepted) return;
    const response = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const errorMessage = await readErrorMessage(response, ui.deleteFailed);
      setMessage(`${ui.deleteFailed}: ${errorMessage}`);
      console.error("[TeamPanel] onDelete failed", { id, status: response.status, errorMessage });
      return;
    }
    await loadMembers();
  }

  async function onUploadForCreate(file?: File | null) {
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadFileToCloudinary(file);
      setForm((prev) => ({ ...prev, photoUrl: url }));
  } catch {
      setMessage(ui.uploadFailed);
      console.error("[TeamPanel] onUploadForCreate failed");
    } finally {
      setSaving(false);
    }
  }

  async function onUploadForMember(id: string, file?: File | null) {
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadFileToCloudinary(file);
      await onUpdate(id, { photoUrl: url });
  } catch {
      setMessage(ui.uploadFailed);
      console.error("[TeamPanel] onUploadForMember failed", { id });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-2xl border border-white/20 bg-white/8 p-4">
        <h2 className="text-lg font-bold text-white">{ui.addCard}</h2>
        {message ? <p className="rounded-lg bg-red-500/20 p-2 text-sm text-red-100">{message}</p> : null}
        <div className="grid gap-3 md:grid-cols-2">
          <Input label={ui.fioRu} value={form.fullNameRu} onChange={(value) => setForm((prev) => ({ ...prev, fullNameRu: value }))} />
          <Input label={ui.roleRu} value={form.positionRu} onChange={(value) => setForm((prev) => ({ ...prev, positionRu: value }))} />
          <Input label={ui.fioKz} value={form.fullNameKz} onChange={(value) => setForm((prev) => ({ ...prev, fullNameKz: value }))} />
          <Input label={ui.roleKz} value={form.positionKz} onChange={(value) => setForm((prev) => ({ ...prev, positionKz: value }))} />
          <Input label={ui.fioEn} value={form.fullNameEn} onChange={(value) => setForm((prev) => ({ ...prev, fullNameEn: value }))} />
          <Input label={ui.roleEn} value={form.positionEn} onChange={(value) => setForm((prev) => ({ ...prev, positionEn: value }))} />
          <Input label={ui.photoUrl} value={form.photoUrl} onChange={(value) => setForm((prev) => ({ ...prev, photoUrl: value }))} />
          <label className="block">
            <span className="mb-1 block text-xs text-white/80">{ui.uploadPhoto}</span>
            <input
              ref={createUploadRef}
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white"
              onChange={(event) => void onUploadForCreate(event.target.files?.[0])}
            />
          </label>
          <Input
            label={ui.sortOrder}
            type="number"
            value={String(form.sortOrder)}
            onChange={(value) => setForm((prev) => ({ ...prev, sortOrder: Number(value) || 0 }))}
          />
          <label className="inline-flex items-center gap-2 self-end text-sm text-white">
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
          disabled={saving}
          onClick={() => void onCreate()}
          className="rounded-xl bg-[#8d1111] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? ui.saving : ui.create}
        </button>
      </section>

      <section className="space-y-3">
        {loading ? <p className="text-sm text-white/80">{ui.loading}</p> : null}
        {!loading && members.length === 0 ? <p className="text-sm text-white/70">{ui.noCards}</p> : null}
        {members.map((member) => (
          <article key={member.id} className="rounded-2xl border border-white/20 bg-white/8 p-4">
            <div className="mb-3 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={member.photoUrl} alt={member.fullNameRu} className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex gap-2">
                <label className="rounded-xl bg-white/15 px-3 py-2 text-sm text-white hover:bg-white/25 cursor-pointer">
                  {ui.uploadPhoto}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => void onUploadForMember(member.id, event.target.files?.[0])}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void onDelete(member.id)}
                  className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  {ui.remove}
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input label={ui.fioRu} defaultValue={member.fullNameRu} onBlur={(value) => void onUpdate(member.id, { fullNameRu: value })} />
              <Input label={ui.roleRu} defaultValue={member.positionRu} onBlur={(value) => void onUpdate(member.id, { positionRu: value })} />
              <Input label={ui.fioKz} defaultValue={member.fullNameKz} onBlur={(value) => void onUpdate(member.id, { fullNameKz: value })} />
              <Input label={ui.roleKz} defaultValue={member.positionKz} onBlur={(value) => void onUpdate(member.id, { positionKz: value })} />
              <Input label={ui.fioEn} defaultValue={member.fullNameEn} onBlur={(value) => void onUpdate(member.id, { fullNameEn: value })} />
              <Input label={ui.roleEn} defaultValue={member.positionEn} onBlur={(value) => void onUpdate(member.id, { positionEn: value })} />
              <Input label={ui.photoUrl} defaultValue={member.photoUrl} onBlur={(value) => void onUpdate(member.id, { photoUrl: value })} />
              <Input
                label={ui.sortOrder}
                type="number"
                defaultValue={String(member.sortOrder)}
                onBlur={(value) => void onUpdate(member.id, { sortOrder: Number(value) || 0 })}
              />
              <label className="inline-flex items-center gap-2 self-end text-sm text-white">
                <input
                  type="checkbox"
                  defaultChecked={member.isActive}
                  onChange={(event) => void onUpdate(member.id, { isActive: event.target.checked })}
                />
                {ui.active}
              </label>
            </div>
            <button
              type="button"
              onClick={() => void loadMembers()}
              className="mt-3 rounded-xl bg-white/20 px-3 py-2 text-sm text-white hover:bg-white/30"
            >
              {ui.update}
            </button>
          </article>
        ))}
      </section>
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
  type?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/80">{label}</span>
      <input
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        onBlur={onBlur ? (event) => onBlur(event.target.value) : undefined}
        className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white"
      />
    </label>
  );
}
