"use client";

import { useEffect, useState } from "react";
import { Pencil, Save, X } from "lucide-react";

type ProfilePayload = {
  fullName: string;
  phone: string;
  university: string;
  avatarUrl?: string | null;
  bio?: string | null;
  user?: { email: string };
};

const emptyProfile: ProfilePayload = {
  fullName: "",
  phone: "",
  university: "",
  avatarUrl: "",
  bio: ""
};

export function StudentProfileForm() {
  const [profile, setProfile] = useState<ProfilePayload>(emptyProfile);
  const [draft, setDraft] = useState<ProfilePayload>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/student/profile", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload) {
        const nextProfile: ProfilePayload = {
          fullName: payload.fullName || "",
          phone: payload.phone || "",
          university: payload.university || "",
          avatarUrl: payload.avatarUrl || "",
          bio: payload.bio || "",
          user: payload.user
        };
        setProfile(nextProfile);
        setDraft(nextProfile);
      }
      setLoading(false);
    }
    void load();
  }, []);

  function beginEdit() {
    setDraft(profile);
    setEditing(true);
    setMessage("");
  }

  function cancelEdit() {
    setDraft(profile);
    setEditing(false);
    setMessage("");
  }

  async function onSave() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/student/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: draft.fullName,
        phone: draft.phone,
        university: draft.university,
        avatarUrl: draft.avatarUrl || "",
        bio: draft.bio || ""
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.message || "Не удалось сохранить");
      setSaving(false);
      return;
    }

    const updated: ProfilePayload = {
      ...profile,
      fullName: payload.fullName ?? draft.fullName,
      phone: payload.phone ?? draft.phone,
      university: payload.university ?? draft.university,
      avatarUrl: payload.avatarUrl ?? draft.avatarUrl,
      bio: payload.bio ?? draft.bio
    };
    setProfile(updated);
    setDraft(updated);
    setEditing(false);
    setMessage("Профиль обновлен");
    setSaving(false);
  }

  if (loading) {
    return <p className="text-sm text-[#0A1022]/70">Загрузка...</p>;
  }

  return (
    <section className="space-y-5">
      <div className="glass-white-strong rounded-3xl p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#071132]">Профиль</h1>
            <p className="text-sm text-[#0A1022]/65">Данные студента и контактная информация</p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={beginEdit}
              className="inline-flex items-center gap-2 rounded-xl border border-[#0D3B8E]/30 bg-[#0D3B8E]/10 px-3 py-2 text-sm font-semibold text-[#0D3B8E] transition hover:bg-[#0D3B8E]/20"
            >
              <Pencil size={16} />
              Редактировать
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void onSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D3B8E] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0A2C6B] disabled:opacity-70"
              >
                <Save size={16} />
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-[#0A1022]/20 bg-white/80 px-3 py-2 text-sm font-semibold text-[#0A1022]"
              >
                <X size={16} />
                Отмена
              </button>
            </div>
          )}
        </div>

        {message ? (
          <p className="mb-4 rounded-xl bg-[#0D3B8E]/10 px-3 py-2 text-sm text-[#0D3B8E]">{message}</p>
        ) : null}

        {!editing ? (
          <div className="space-y-3">
            <ProfileRow label="Email" value={profile.user?.email || "—"} />
            <ProfileRow label="ФИО" value={profile.fullName || "—"} />
            <ProfileRow label="Телефон" value={profile.phone || "—"} />
            <ProfileRow label="Университет" value={profile.university || "—"} />
            <ProfileRow label="О себе" value={profile.bio || "—"} multiline />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm text-[#0A1022]/75">Email</span>
              <input
                value={profile.user?.email || ""}
                disabled
                className="w-full rounded-xl border border-[#0A1022]/12 bg-white/70 px-3 py-2"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm text-[#0A1022]/75">ФИО</span>
              <input
                value={draft.fullName}
                onChange={(event) => setDraft((prev) => ({ ...prev, fullName: event.target.value }))}
                className="w-full rounded-xl border border-[#0A1022]/20 bg-white/85 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-[#0A1022]/75">Телефон</span>
              <input
                value={draft.phone}
                onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-xl border border-[#0A1022]/20 bg-white/85 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-[#0A1022]/75">Университет</span>
              <input
                value={draft.university}
                onChange={(event) => setDraft((prev) => ({ ...prev, university: event.target.value }))}
                className="w-full rounded-xl border border-[#0A1022]/20 bg-white/85 px-3 py-2"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm text-[#0A1022]/75">Avatar URL</span>
              <input
                value={draft.avatarUrl || ""}
                onChange={(event) => setDraft((prev) => ({ ...prev, avatarUrl: event.target.value }))}
                className="w-full rounded-xl border border-[#0A1022]/20 bg-white/85 px-3 py-2"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm text-[#0A1022]/75">О себе</span>
              <textarea
                rows={4}
                value={draft.bio || ""}
                onChange={(event) => setDraft((prev) => ({ ...prev, bio: event.target.value }))}
                className="w-full rounded-xl border border-[#0A1022]/20 bg-white/85 px-3 py-2"
              />
            </label>
          </div>
        )}
      </div>
    </section>
  );
}

function ProfileRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="glass-white rounded-2xl px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#0A1022]/45">{label}</p>
      <p className={`mt-1 text-[#0A1022] ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</p>
    </div>
  );
}
