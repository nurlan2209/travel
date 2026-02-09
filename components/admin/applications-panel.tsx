"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { AppLanguage } from "@/lib/constants";

type ApplicationStatus = "NEW" | "CONTACTED" | "GOING" | "NOT_GOING";

type ApplicationLog = {
  id: string;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  note: string | null;
  createdAt: string;
  changedBy: {
    id: string;
    email: string;
  };
};

type ApplicationRow = {
  id: string;
  fullName: string;
  university: string;
  phone: string;
  email: string;
  comment: string | null;
  managerComment: string | null;
  status: ApplicationStatus;
  createdAt: string;
  manager: {
    id: string;
    email: string;
  } | null;
  tour: {
    id: string;
    slug: string;
    tourDate: string;
    studentLimit: number;
    titleRu: string;
  };
  statusLogs: ApplicationLog[];
};

type TourStats = {
  tourPostId: string;
  slug: string;
  titleRu: string;
  tourDate: string;
  studentLimit: number;
  goingCount: number;
  isClosed: boolean;
};

type Filters = {
  status: "ALL" | ApplicationStatus;
  tourPostId: string;
  dateFrom: string;
  dateTo: string;
  q: string;
};

const defaultFilters: Filters = {
  status: "ALL",
  tourPostId: "",
  dateFrom: "",
  dateTo: "",
  q: ""
};

const statuses: ApplicationStatus[] = ["NEW", "CONTACTED", "GOING", "NOT_GOING"];

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  NEW: ["CONTACTED", "GOING", "NOT_GOING"],
  CONTACTED: ["GOING", "NOT_GOING"],
  GOING: ["NOT_GOING"],
  NOT_GOING: []
};

type SetStatusOptions = {
  animate?: boolean;
};

const panelUi = {
  kz: {
    filtersTitle: "Сүзгілер",
    status: "Күйі",
    tour: "Тур",
    dateFrom: "Басталу күні",
    dateTo: "Аяқталу күні",
    search: "Іздеу",
    searchPlaceholder: "Аты, email, телефон...",
    all: "Барлығы",
    apply: "Қолдану",
    reset: "Тазалау",
    loading: "Жүктелуде...",
    empty: "Өтінімдер табылмады",
    manager: "Менеджер",
    detailsTitle: "Өтінім картасы",
    profile: "Профиль",
    note: "Менеджер ескертпесі",
    quickNote: "Жедел ескертпе",
    editNote: "Ескертпе",
    saveNote: "Сақтау",
    cancel: "Бас тарту",
    saving: "Сақталуда...",
    noNote: "Ескертпе жоқ",
    history: "Күй тарихы",
    moveHint: "Карточканы келесі бағанға сүйреңіз",
    closed: "Жабық",
    open: "Ашық",
    columns: {
      NEW: "Жаңа",
      CONTACTED: "Байланыс жасалды",
      GOING: "Барады",
      NOT_GOING: "Бармайды"
    },
    invalidTransition: "Мұндай ауысу рұқсат етілмеген"
  },
  ru: {
    filtersTitle: "Фильтры",
    status: "Статус",
    tour: "Тур",
    dateFrom: "Дата от",
    dateTo: "Дата до",
    search: "Поиск",
    searchPlaceholder: "ФИО, email, телефон...",
    all: "Все",
    apply: "Применить",
    reset: "Сбросить",
    loading: "Загрузка...",
    empty: "Заявки не найдены",
    manager: "Менеджер",
    detailsTitle: "Карточка заявки",
    profile: "Профиль",
    note: "Комментарий менеджера",
    quickNote: "Быстрый комментарий",
    editNote: "Комментарий",
    saveNote: "Сохранить",
    cancel: "Отмена",
    saving: "Сохранение...",
    noNote: "Комментария нет",
    history: "История статусов",
    moveHint: "Перетащите карточку в нужную колонку",
    closed: "Закрыт",
    open: "Открыт",
    columns: {
      NEW: "Новые",
      CONTACTED: "Связались",
      GOING: "Идут",
      NOT_GOING: "Не идут"
    },
    invalidTransition: "Такой переход статуса недопустим"
  },
  en: {
    filtersTitle: "Filters",
    status: "Status",
    tour: "Tour",
    dateFrom: "Date from",
    dateTo: "Date to",
    search: "Search",
    searchPlaceholder: "Name, email, phone...",
    all: "All",
    apply: "Apply",
    reset: "Reset",
    loading: "Loading...",
    empty: "No applications found",
    manager: "Manager",
    detailsTitle: "Application details",
    profile: "Profile",
    note: "Manager note",
    quickNote: "Quick note",
    editNote: "Note",
    saveNote: "Save",
    cancel: "Cancel",
    saving: "Saving...",
    noNote: "No note",
    history: "Status history",
    moveHint: "Drag cards between columns",
    closed: "Closed",
    open: "Open",
    columns: {
      NEW: "New",
      CONTACTED: "Contacted",
      GOING: "Going",
      NOT_GOING: "Not Going"
    },
    invalidTransition: "This status transition is not allowed"
  }
} as const;

const statusColor: Record<ApplicationStatus, string> = {
  NEW: "border-slate-300/35 bg-slate-500/10",
  CONTACTED: "border-blue-300/35 bg-blue-500/10",
  GOING: "border-green-300/35 bg-green-500/10",
  NOT_GOING: "border-red-300/35 bg-red-500/10"
};

function formatDate(value: string, lang: AppLanguage) {
  const locale = lang === "en" ? "en-US" : lang === "kz" ? "kk-KZ" : "ru-RU";
  return new Date(value).toLocaleString(locale);
}

export function ApplicationsPanel({ lang }: { lang: AppLanguage }) {
  const ui = panelUi[lang];

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [stats, setStats] = useState<TourStats[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineNoteDrafts, setInlineNoteDrafts] = useState<Record<string, string>>({});
  const [animatedCardId, setAnimatedCardId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropStatus, setDropStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState("");

  const statsByTour = useMemo(() => new Map(stats.map((item) => [item.tourPostId, item])), [stats]);
  const selectedRow = useMemo(() => rows.find((row) => row.id === selectedId) || null, [rows, selectedId]);

  const groupedRows = useMemo(
    () =>
      statuses.reduce<Record<ApplicationStatus, ApplicationRow[]>>((acc, status) => {
        acc[status] = rows.filter((row) => row.status === status);
        return acc;
      }, { NEW: [], CONTACTED: [], GOING: [], NOT_GOING: [] }),
    [rows]
  );

  function buildQuery(nextFilters: Filters) {
    const searchParams = new URLSearchParams();
    if (nextFilters.status !== "ALL") searchParams.set("status", nextFilters.status);
    if (nextFilters.tourPostId) searchParams.set("tourPostId", nextFilters.tourPostId);
    if (nextFilters.dateFrom) searchParams.set("dateFrom", nextFilters.dateFrom);
    if (nextFilters.dateTo) searchParams.set("dateTo", nextFilters.dateTo);
    if (nextFilters.q.trim()) searchParams.set("q", nextFilters.q.trim());
    return searchParams.toString();
  }

  const loadStats = useCallback(async () => {
    const response = await fetch("/api/admin/applications/stats", { cache: "no-store" });
    const payload = await response.json().catch(() => []);
    if (!response.ok) {
      throw new Error(payload.message || "Failed to load stats");
    }
    setStats(payload as TourStats[]);
  }, []);

  const loadRows = useCallback(async (nextFilters: Filters) => {
    const query = buildQuery(nextFilters);
    const response = await fetch(`/api/admin/applications${query ? `?${query}` : ""}`, { cache: "no-store" });
    const payload = await response.json().catch(() => []);
    if (!response.ok) {
      throw new Error(payload.message || "Failed to load applications");
    }
    setRows(payload as ApplicationRow[]);
  }, []);

  const loadAll = useCallback(
    async (nextFilters: Filters) => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([loadStats(), loadRows(nextFilters)]);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load applications");
      } finally {
        setLoading(false);
      }
    },
    [loadRows, loadStats]
  );

  useEffect(() => {
    void loadAll(defaultFilters);
  }, [loadAll]);

  useEffect(() => {
    if (!selectedRow) {
      setNoteDraft("");
      return;
    }
    setNoteDraft(selectedRow.managerComment || "");
  }, [selectedRow?.id, selectedRow?.managerComment]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(applicationId: string, status: ApplicationStatus, note?: string, options?: SetStatusOptions) {
    const actionKey = `${applicationId}:${status}`;
    setLoadingAction(`${applicationId}:${status}`);
    setError("");
    const nextNote = note?.trim();
    const prevRowsSnapshot = rows;
    const prevRow = prevRowsSnapshot.find((item) => item.id === applicationId);
    const isStatusChanged = prevRow?.status !== status;
    const shouldUpdateNote = note !== undefined;

    if (isStatusChanged || shouldUpdateNote) {
      setRows((prev) =>
        prev.map((item) =>
          item.id === applicationId
            ? {
                ...item,
                status,
                managerComment: shouldUpdateNote ? (nextNote || null) : item.managerComment
              }
            : item
        )
      );
    }

    if (isStatusChanged && options?.animate) {
      setAnimatedCardId(applicationId);
      setTimeout(() => {
        setAnimatedCardId((current) => (current === applicationId ? null : current));
      }, 520);
    }

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          note: nextNote || undefined
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || "Failed to update status");
      }
      await Promise.all([loadRows(filters), loadStats()]);
    } catch (statusError) {
      setRows(prevRowsSnapshot);
      setError(statusError instanceof Error ? statusError.message : "Failed to update status");
    } finally {
      setLoadingAction((current) => (current === actionKey ? null : current));
    }
  }

  function canMove(fromStatus: ApplicationStatus, toStatus: ApplicationStatus) {
    return transitions[fromStatus].includes(toStatus);
  }

  async function onDropToStatus(targetStatus: ApplicationStatus) {
    if (!draggedId) return;
    const row = rows.find((item) => item.id === draggedId);
    setDropStatus(null);
    setDraggedId(null);
    if (!row || row.status === targetStatus) return;
    if (!canMove(row.status, targetStatus)) {
      setError(ui.invalidTransition);
      return;
    }
    await setStatus(row.id, targetStatus, undefined, { animate: true });
  }

  async function onApplyFilters(event: FormEvent) {
    event.preventDefault();
    await loadAll(filters);
  }

  async function onResetFilters() {
    setFilters(defaultFilters);
    await loadAll(defaultFilters);
  }

  function onInlineEditOpen(row: ApplicationRow) {
    setInlineEditingId(row.id);
    setInlineNoteDrafts((prev) => ({
      ...prev,
      [row.id]: row.managerComment || ""
    }));
  }

  function onInlineEditCancel() {
    setInlineEditingId(null);
  }

  async function onInlineEditSave(row: ApplicationRow) {
    const draft = inlineNoteDrafts[row.id] ?? "";
    await setStatus(row.id, row.status, draft);
    setInlineEditingId(null);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onApplyFilters} className="rounded-2xl border border-white/20 bg-white/8 p-4">
        <h2 className="mb-3 text-lg font-semibold">{ui.filtersTitle}</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm">
            <span className="mb-1 block text-white/80">{ui.status}</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as Filters["status"] }))}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2"
            >
              <option value="ALL">{ui.all}</option>
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-white/80">{ui.tour}</span>
            <select
              value={filters.tourPostId}
              onChange={(event) => setFilters((prev) => ({ ...prev, tourPostId: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2"
            >
              <option value="">{ui.all}</option>
              {stats.map((item) => (
                <option key={item.tourPostId} value={item.tourPostId}>{item.titleRu}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-white/80">{ui.dateFrom}</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-white/80">{ui.dateTo}</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-white/80">{ui.search}</span>
            <input
              type="text"
              value={filters.q}
              onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2"
              placeholder={ui.searchPlaceholder}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" className="rounded-xl bg-[#8d1111] px-4 py-2 text-sm font-semibold">{ui.apply}</button>
          <button type="button" onClick={() => void onResetFilters()} className="rounded-xl border border-white/30 px-4 py-2 text-sm">{ui.reset}</button>
          <span className="ml-auto text-xs text-white/70">{ui.moveHint}</span>
        </div>
      </form>

      {stats.length > 0 ? (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.tourPostId} className="rounded-xl border border-white/20 bg-white/8 p-3">
              <p className="line-clamp-1 text-sm font-semibold">{item.titleRu}</p>
              <p className="text-xs text-white/70">{formatDate(item.tourDate, lang)}</p>
              <p className="mt-1 text-xs">{item.goingCount}/{item.studentLimit} • {item.isClosed ? ui.closed : ui.open}</p>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-100">{error}</p> : null}
      {loading ? <p className="text-sm text-white/80">{ui.loading}</p> : null}

      <div className="grid gap-4 xl:grid-cols-4">
        {statuses.map((status) => (
          <section
            key={status}
            onDragOver={(event) => {
              event.preventDefault();
              setDropStatus(status);
            }}
            onDragLeave={() => setDropStatus((prev) => (prev === status ? null : prev))}
            onDrop={() => void onDropToStatus(status)}
            className={`min-h-[320px] rounded-2xl border p-3 transition ${
              statusColor[status]
            } ${dropStatus === status ? "ring-2 ring-[#FFD428]/70" : ""}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{ui.columns[status]}</h3>
              <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs">{groupedRows[status].length}</span>
            </div>
            <div className="space-y-2">
              {groupedRows[status].map((row) => {
                const tourStats = statsByTour.get(row.tour.id);
                const rowActionLoading = loadingAction?.startsWith(`${row.id}:`) ?? false;
                const blocked = draggedId === row.id && loadingAction !== null;
                const isInlineEditing = inlineEditingId === row.id;
                const inlineDraft = inlineNoteDrafts[row.id] ?? row.managerComment ?? "";
                return (
                  <article
                    key={row.id}
                    draggable={!blocked}
                    onDragStart={() => setDraggedId(row.id)}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDropStatus(null);
                    }}
                    className={`kanban-card cursor-grab rounded-xl border border-white/20 bg-black/25 p-3 transition-all duration-300 active:cursor-grabbing ${
                      selectedId === row.id ? "ring-2 ring-[#FFD428]/60" : ""
                    } ${row.id === animatedCardId ? "kanban-card-animate" : ""}`}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <p className="font-semibold">{row.fullName}</p>
                    <p className="text-xs text-white/70">{row.email}</p>
                    <p className="mt-1 line-clamp-1 text-xs">{row.tour.titleRu}</p>
                    <p className="text-[11px] text-white/70">{formatDate(row.tour.tourDate, lang)}</p>
                    {tourStats ? (
                      <p className="mt-1 text-[11px] text-white/70">{tourStats.goingCount}/{tourStats.studentLimit}</p>
                    ) : null}

                    <div className="mt-2 border-t border-white/10 pt-2">
                      {isInlineEditing ? (
                        <div className="space-y-2" onClick={(event) => event.stopPropagation()}>
                          <p className="text-[11px] text-white/70">{ui.quickNote}</p>
                          <textarea
                            rows={2}
                            value={inlineDraft}
                            onChange={(event) =>
                              setInlineNoteDrafts((prev) => ({
                                ...prev,
                                [row.id]: event.target.value
                              }))
                            }
                            className="w-full rounded-lg border border-white/20 bg-black/35 px-2 py-1 text-xs"
                          />
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => void onInlineEditSave(row)}
                              disabled={rowActionLoading}
                              className="rounded-md bg-[#8d1111] px-2 py-1 text-[11px] font-semibold disabled:opacity-50"
                            >
                              {rowActionLoading ? ui.saving : ui.saveNote}
                            </button>
                            <button
                              type="button"
                              onClick={onInlineEditCancel}
                              disabled={rowActionLoading}
                              className="rounded-md border border-white/30 px-2 py-1 text-[11px]"
                            >
                              {ui.cancel}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <p className="line-clamp-2 flex-1 text-[11px] text-white/70">
                            {row.managerComment || ui.noNote}
                          </p>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onInlineEditOpen(row);
                            }}
                            className="rounded-md border border-white/25 px-2 py-1 text-[11px] font-semibold transition hover:border-white/40"
                          >
                            {ui.editNote}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
              {groupedRows[status].length === 0 && !loading ? (
                <div className="rounded-xl border border-dashed border-white/25 p-4 text-center text-xs text-white/60">{ui.empty}</div>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      {selectedRow ? (
        <section className="rounded-2xl border border-white/20 bg-white/8 p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold">{ui.detailsTitle}</h3>
            <button type="button" className="rounded border border-white/30 px-3 py-1 text-xs" onClick={() => setSelectedId(null)}>×</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-white/80">{ui.profile}</h4>
              <p><span className="text-white/60">Name: </span>{selectedRow.fullName}</p>
              <p><span className="text-white/60">Email: </span>{selectedRow.email}</p>
              <p><span className="text-white/60">Phone: </span>{selectedRow.phone}</p>
              <p><span className="text-white/60">University: </span>{selectedRow.university}</p>
              <p><span className="text-white/60">Tour: </span>{selectedRow.tour.titleRu}</p>
              <p><span className="text-white/60">Status: </span>{selectedRow.status}</p>
              <p><span className="text-white/60">{ui.manager}: </span>{selectedRow.manager?.email || "—"}</p>
              {selectedRow.comment ? (
                <p><span className="text-white/60">Student comment: </span>{selectedRow.comment}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white/80">{ui.note}</h4>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                {transitions[selectedRow.status].map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    onClick={() => void setStatus(selectedRow.id, nextStatus, noteDraft)}
                    className={`rounded px-3 py-2 text-xs font-semibold ${statusColor[nextStatus]}`}
                    disabled={loadingAction === `${selectedRow.id}:${nextStatus}`}
                  >
                    {ui.columns[nextStatus]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h4 className="mb-2 text-sm font-semibold text-white/80">{ui.history}</h4>
            <div className="space-y-2">
              {selectedRow.statusLogs.length === 0 ? (
                <p className="text-sm text-white/60">—</p>
              ) : (
                selectedRow.statusLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-xs">
                    <div className="font-semibold">{log.fromStatus} → {log.toStatus}</div>
                    <div className="text-white/70">{formatDate(log.createdAt, lang)} • {log.changedBy.email}</div>
                    {log.note ? <div className="mt-1 text-white/90">{log.note}</div> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
