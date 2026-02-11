"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2, X } from "lucide-react";

type Translation = {
  posterTemplateData?: {
    posterUrls?: string[];
  } | null;
};

type TourRow = {
  id: string;
  slug: string;
  status: string;
  tourDate: string;
  translations: Translation[];
};

type Dictionary = {
  tableSlug: string;
  tableStatus: string;
  tablePosters: string;
  tableDate: string;
  tableActions: string;
  postersReady: string;
  postersMissing: string;
  edit: string;
  remove: string;
  confirmDelete: string;
  cancel: string;
  confirmRemove: string;
  deleteFailed: string;
};

export function AdminToursTable({ initialTours, dict }: { initialTours: TourRow[]; dict: Dictionary }) {
  const [tours, setTours] = useState<TourRow[]>(initialTours);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function readErrorMessage(response: Response, fallback: string) {
    try {
      const body = (await response.json()) as { message?: string };
      return body?.message ?? fallback;
    } catch {
      return fallback;
    }
  }

  function openConfirm(id: string) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
    requestAnimationFrame(() => setConfirmVisible(true));
  }

  function closeConfirm() {
    setConfirmVisible(false);
    window.setTimeout(() => {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }, 180);
  }

  async function onDelete() {
    const id = pendingDeleteId;
    if (!id) return;
    setMessage("");
    const response = await fetch(`/api/admin/tours/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const errorMessage = await readErrorMessage(response, dict.deleteFailed);
      setMessage(`${dict.deleteFailed}: ${errorMessage}`);
      console.error("[AdminToursTable] delete failed", { id, status: response.status, errorMessage });
      return;
    }
    setTours((prev) => prev.filter((item) => item.id !== id));
    closeConfirm();
  }

  return (
    <>
      {message ? <div className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-100">{message}</div> : null}
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/8">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-left text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">{dict.tableSlug}</th>
              <th className="px-4 py-3">{dict.tableStatus}</th>
              <th className="px-4 py-3">{dict.tablePosters}</th>
              <th className="px-4 py-3">{dict.tableDate}</th>
              <th className="px-4 py-3">{dict.tableActions}</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => {
              const hasLangPosters = tour.translations.filter((translation) => {
                const data = translation.posterTemplateData ?? null;
                return Array.isArray(data?.posterUrls) && data.posterUrls.some(Boolean);
              }).length;
              return (
                <tr key={tour.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{tour.slug}</td>
                  <td className="px-4 py-3">{tour.status}</td>
                  <td className="px-4 py-3">
                    {hasLangPosters >= 3 ? (
                      <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-100">
                        {dict.postersReady}
                      </span>
                    ) : (
                      <span className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-100">
                        {dict.postersMissing}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{new Date(tour.tourDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link className="text-[#ffb3b3] underline" href={`/admin/tours/${tour.id}`}>
                        {dict.edit}
                      </Link>
                      <button
                        type="button"
                        onClick={() => openConfirm(tour.id)}
                        className="inline-flex items-center text-red-300 hover:text-red-200"
                        aria-label={dict.remove}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmOpen ? (
        <div
          className={`fixed inset-0 z-[90] flex items-center justify-center p-4 transition-all duration-200 ${
            confirmVisible ? "bg-black/55 backdrop-blur-sm opacity-100" : "bg-black/0 opacity-0"
          }`}
          onClick={closeConfirm}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={`w-full max-w-sm origin-top overflow-hidden rounded-[28px] border border-white/25 bg-[#1a1a1d]/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-[transform,opacity] duration-280 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              confirmVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-95 opacity-0"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-white">{dict.confirmDelete}</h3>
              <button
                type="button"
                onClick={closeConfirm}
                className="grid h-8 w-8 place-items-center rounded-full bg-black/35 text-white/80 hover:bg-black/45"
                aria-label={dict.cancel}
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/15"
              >
                {dict.cancel}
              </button>
              <button
                type="button"
                onClick={() => void onDelete()}
                className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-red-500"
              >
                {dict.confirmRemove}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
