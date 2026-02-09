"use client";

import { useEffect, useState } from "react";
import { Clock3, MapPin, PhoneCall, Send } from "lucide-react";
import { ImageWithFallback } from "@/components/public/landing/figma/ImageWithFallback";

type StudentTour = {
  id: string;
  status: "ENROLLED" | "COMPLETED" | "CANCELLED";
  tourPostId: string;
  tourDate: string;
  coverImage: string;
  titleRu: string;
  titleKz: string;
  titleEn: string;
  place: string;
  location: string;
};

type StudentApplication = {
  id: string;
  status: "NEW" | "CONTACTED" | "GOING" | "NOT_GOING";
  comment: string | null;
  managerComment: string | null;
  createdAt: string;
  contactedAt: string | null;
  decisionAt: string | null;
  managerEmail: string | null;
  tour: {
    id: string;
    slug: string;
    tourDate: string;
    titleRu: string;
    titleKz: string;
    titleEn: string;
  };
};

type UploadSignature = {
  timestamp: number;
  folder: string;
  signature: string;
  apiKey: string;
  cloudName: string;
};

async function uploadFileToCloudinary(file: File): Promise<string> {
  const signatureResponse = await fetch("/api/student/upload", { method: "POST" });
  if (!signatureResponse.ok) throw new Error("UPLOAD_SIGNATURE_FAILED");

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

  if (!uploadResponse.ok) throw new Error("UPLOAD_FAILED");
  const payload = (await uploadResponse.json()) as { secure_url?: string };
  if (!payload.secure_url) throw new Error("UPLOAD_FAILED");
  return payload.secure_url;
}

function applicationBadge(status: StudentApplication["status"]) {
  if (status === "GOING") return "bg-green-100 text-green-700";
  if (status === "CONTACTED") return "bg-blue-100 text-blue-700";
  if (status === "NOT_GOING") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

function enrollmentBadge(status: StudentTour["status"]) {
  if (status === "COMPLETED") return "bg-[#0D3B8E]/12 text-[#0D3B8E]";
  if (status === "ENROLLED") return "bg-green-100 text-green-700";
  return "bg-red-100 text-red-700";
}

export function StudentDashboard() {
  const [tours, setTours] = useState<StudentTour[]>([]);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [momentTourId, setMomentTourId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [captionRu, setCaptionRu] = useState("");
  const [captionKz, setCaptionKz] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [savingMoment, setSavingMoment] = useState(false);

  async function loadTours() {
    const response = await fetch("/api/student/tours", { cache: "no-store" });
    const payload = await response.json().catch(() => ([]));
    if (!response.ok) {
      setError(payload.message || "Не удалось загрузить туры");
      return;
    }
    setTours(payload as StudentTour[]);
  }

  async function loadApplications() {
    const response = await fetch("/api/student/applications", { cache: "no-store" });
    const payload = await response.json().catch(() => ([]));
    if (!response.ok) {
      setError((prev) => prev || payload.message || "Не удалось загрузить заявки");
      return;
    }
    setApplications(payload as StudentApplication[]);
  }

  useEffect(() => {
    setLoading(true);
    void Promise.all([loadTours(), loadApplications()]).finally(() => setLoading(false));
  }, []);

  function resetMomentState() {
    setMomentTourId(null);
    setPhotoFile(null);
    setCaptionRu("");
    setCaptionKz("");
    setCaptionEn("");
  }

  async function submitMoment() {
    if (!momentTourId || !photoFile) return;
    setSavingMoment(true);
    setError("");
    try {
      const photoUrl = await uploadFileToCloudinary(photoFile);
      const response = await fetch("/api/student/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourPostId: momentTourId,
          photoUrl,
          captionRu,
          captionKz,
          captionEn
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.message || "Не удалось отправить момент");
        setSavingMoment(false);
        return;
      }

      resetMomentState();
      alert("Отправлено на модерацию");
    } catch {
      setError("Не удалось отправить момент");
    } finally {
      setSavingMoment(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="glass-white-strong rounded-3xl p-6">
        <h1 className="text-3xl font-black text-[#071132]">Мои туры</h1>
        <p className="mt-1 text-sm text-[#0A1022]/65">
          Здесь собраны отправленные заявки и подтвержденные туры.
        </p>
      </div>

      {error ? <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-[#0A1022]/70">Загрузка...</p> : null}

      <div className="glass-white rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#071132]">Отправленные заявки</h2>
          <span className="rounded-full bg-[#0A1022]/6 px-3 py-1 text-xs font-semibold text-[#0A1022]/70">
            {applications.length}
          </span>
        </div>

        {applications.length === 0 ? (
          <p className="text-sm text-[#0A1022]/60">Вы еще не отправляли заявки.</p>
        ) : (
          <div className="grid gap-3">
            {applications.map((application) => (
              <article
                key={application.id}
                className="glass-white rounded-2xl px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-[#071132]">{application.tour.titleRu}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${applicationBadge(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#0A1022]/70">
                  <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {new Date(application.createdAt).toLocaleDateString("ru-RU")}</span>
                  <span className="inline-flex items-center gap-1"><MapPin size={13} /> {new Date(application.tour.tourDate).toLocaleDateString("ru-RU")}</span>
                  <span className="inline-flex items-center gap-1"><PhoneCall size={13} /> {application.managerEmail || "Менеджер еще не назначен"}</span>
                </div>
                {application.managerComment || application.comment ? (
                  <p className="mt-2 text-sm text-[#0A1022]/75">
                    {application.managerComment || application.comment}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="glass-white rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#071132]">Список туров</h2>
          <span className="rounded-full bg-[#0A1022]/6 px-3 py-1 text-xs font-semibold text-[#0A1022]/70">
            {tours.length}
          </span>
        </div>

        {tours.length === 0 ? (
          <p className="text-sm text-[#0A1022]/60">Пока нет подтвержденных туров.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tours.map((tour) => (
              <article key={tour.id} className="glass-white overflow-hidden rounded-2xl shadow-lg">
                <ImageWithFallback src={tour.coverImage} alt={tour.titleRu} className="h-44 w-full object-cover" />
                <div className="space-y-3 p-4">
                  <h3 className="text-lg font-black text-[#071132]">{tour.titleRu}</h3>
                  <p className="text-sm text-[#0A1022]/70">{tour.place} • {tour.location}</p>
                  <p className="text-sm text-[#0A1022]/70">{new Date(tour.tourDate).toLocaleDateString("ru-RU")}</p>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${enrollmentBadge(tour.status)}`}>
                      {tour.status}
                    </span>
                    {tour.status === "COMPLETED" ? (
                      <button
                        onClick={() => setMomentTourId(tour.tourPostId)}
                        className="rounded-lg bg-[#8d1111] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#750d0d]"
                      >
                        Оставить лучшие моменты
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {momentTourId ? (
        <div className="glass-white-strong rounded-3xl p-5">
          <h3 className="mb-3 text-xl font-black text-[#071132]">Новый лучший момент</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm text-[#0A1022]/75">Фото</span>
              <input type="file" accept="image/*" onChange={(event) => setPhotoFile(event.target.files?.[0] || null)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-[#0A1022]/75">Подпись RU</span>
              <input value={captionRu} onChange={(event) => setCaptionRu(event.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white/80 px-3 py-2" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-[#0A1022]/75">Подпись KZ</span>
              <input value={captionKz} onChange={(event) => setCaptionKz(event.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white/80 px-3 py-2" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm text-[#0A1022]/75">Подпись EN</span>
              <input value={captionEn} onChange={(event) => setCaptionEn(event.target.value)} className="w-full rounded-xl border border-[#0A1022]/20 bg-white/80 px-3 py-2" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => void submitMoment()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D3B8E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0A2C6B]"
              disabled={savingMoment}
            >
              <Send size={16} />
              {savingMoment ? "Отправка..." : "Отправить на модерацию"}
            </button>
            <button onClick={resetMomentState} className="rounded-xl border border-[#0A1022]/20 px-4 py-2 text-sm text-[#0A1022]/80">
              Отмена
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
