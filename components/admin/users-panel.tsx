"use client";

import { useState } from "react";
import type { AppLanguage } from "@/lib/constants";
import { UserForm } from "@/components/admin/user-form";

type User = {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STUDENT";
  isActive: boolean;
  createdAt: string;
};

const usersUi = {
  kz: {
    email: "Email",
    role: "Рөл",
    status: "Күйі",
    created: "Құрылған",
    loading: "Жүктелуде...",
    noUsers: "Пайдаланушылар жоқ",
    active: "Белсенді",
    inactive: "Белсенді емес",
    roleManager: "Менеджер",
    roleAdmin: "Әкімші",
    roleStudent: "Студент"
  },
  ru: {
    email: "Email",
    role: "Роль",
    status: "Статус",
    created: "Создан",
    loading: "Загрузка...",
    noUsers: "Нет пользователей",
    active: "Активен",
    inactive: "Неактивен",
    roleManager: "Менеджер",
    roleAdmin: "Администратор",
    roleStudent: "Студент"
  },
  en: {
    email: "Email",
    role: "Role",
    status: "Status",
    created: "Created",
    loading: "Loading...",
    noUsers: "No users",
    active: "Active",
    inactive: "Inactive",
    roleManager: "Manager",
    roleAdmin: "Admin",
    roleStudent: "Student"
  }
} as const;

export function UsersPanel({ initialUsers, lang = "ru" }: { initialUsers: User[]; lang?: AppLanguage }) {
  const ui = usersUi[lang];
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);

  function formatCreatedAt(dateIso: string) {
    const date = new Date(dateIso);
    if (Number.isNaN(date.getTime())) return "—";

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = String(date.getUTCFullYear());

    if (lang === "en") return `${month}/${day}/${year}`;
    return `${day}.${month}.${year}`;
  }

  async function loadUsers() {
    setLoading(true);
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as User[];
      setUsers(data);
    }
    setLoading(false);
  }

  async function onRoleChange(userId: string, role: "ADMIN" | "MANAGER" | "STUDENT") {
    await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    await loadUsers();
  }

  async function onToggleActive(userId: string, isActive: boolean) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive })
    });
    await loadUsers();
  }

  return (
    <div className="space-y-4">
      <UserForm lang={lang} onDone={() => void loadUsers()} />

      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/8">
        <table className="w-full text-sm text-white">
          <thead className="bg-black/30 text-left text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">{ui.email}</th>
              <th className="px-4 py-3">{ui.role}</th>
              <th className="px-4 py-3">{ui.status}</th>
              <th className="px-4 py-3">{ui.created}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={4}>
                  {ui.loading}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-4" colSpan={4}>
                  {ui.noUsers}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => void onRoleChange(user.id, e.target.value as "ADMIN" | "MANAGER" | "STUDENT")}
                      className="rounded-lg border border-white/30 bg-black/20 px-2 py-1"
                    >
                      <option value="MANAGER">{ui.roleManager}</option>
                      <option value="ADMIN">{ui.roleAdmin}</option>
                      <option value="STUDENT">{ui.roleStudent}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={user.isActive}
                        onChange={(e) => void onToggleActive(user.id, e.target.checked)}
                      />
                      <span>{user.isActive ? ui.active : ui.inactive}</span>
                    </label>
                  </td>
                  <td className="px-4 py-3">{formatCreatedAt(user.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
