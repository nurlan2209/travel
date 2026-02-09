"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/public/landing/figma/ImageWithFallback";

type Row = {
  id: string;
  photoUrl: string;
  captionRu: string;
  captionKz: string;
  captionEn: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  studentEmail: string;
  studentName: string;
  tourSlug: string;
  tourTitleRu: string;
};

export function MomentsPanel({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function setStatus(id: string, status: Row["status"]) {
    setLoadingId(id);
    const response = await fetch(`/api/admin/moments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    }
    setLoadingId(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/8">
      <table className="w-full text-sm text-white">
        <thead className="bg-black/30 text-left text-xs uppercase text-white/70">
          <tr>
            <th className="px-4 py-3">Фото</th>
            <th className="px-4 py-3">Студент</th>
            <th className="px-4 py-3">Тур</th>
            <th className="px-4 py-3">Подпись RU</th>
            <th className="px-4 py-3">Загружено</th>
            <th className="px-4 py-3">Статус</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10 align-top">
              <td className="px-4 py-3">
                <ImageWithFallback src={row.photoUrl} alt={row.captionRu} className="h-16 w-16 rounded-lg object-cover" />
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold">{row.studentName}</div>
                <div className="text-white/60">{row.studentEmail}</div>
              </td>
              <td className="px-4 py-3">{row.tourTitleRu}</td>
              <td className="px-4 py-3 max-w-xs">{row.captionRu}</td>
              <td className="px-4 py-3">{new Date(row.createdAt).toLocaleString("ru-RU")}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <span className="text-xs">{row.status}</span>
                  <div className="flex gap-1">
                    <button disabled={loadingId === row.id} onClick={() => void setStatus(row.id, "APPROVED")} className="rounded bg-green-600 px-2 py-1 text-xs">Approve</button>
                    <button disabled={loadingId === row.id} onClick={() => void setStatus(row.id, "REJECTED")} className="rounded bg-red-600 px-2 py-1 text-xs">Reject</button>
                    <button disabled={loadingId === row.id} onClick={() => void setStatus(row.id, "PENDING")} className="rounded bg-slate-600 px-2 py-1 text-xs">Pending</button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
