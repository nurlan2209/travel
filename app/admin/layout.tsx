import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminLangSwitcher } from "@/components/admin/admin-lang-switcher";
import { adminT, resolveAdminLang } from "@/lib/admin-i18n";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/?auth=1");
  }
  const cookieStore = await cookies();
  const lang = resolveAdminLang(cookieStore.get("admin_lang")?.value);
  const dict = adminT(lang);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1f3a5f_0%,#091525_50%,#050910_100%)] text-white">
      <header className="border-b border-white/20 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-5">
            <Link href="/admin/applications" className="text-lg font-black">{dict.navAdmin}</Link>
            <Link href="/admin/tours" className="text-sm text-white/90">{dict.navTours}</Link>
            <Link href="/admin/applications" className="text-sm text-white/90">{dict.navApplications}</Link>
            <Link href="/admin/team" className="text-sm text-white/90">{dict.navTeam}</Link>
            <Link href="/admin/moments" className="text-sm text-white/90">{dict.navMoments}</Link>
            {session.user.role === "ADMIN" ? <Link href="/admin/documents" className="text-sm text-white/90">{dict.navDocuments}</Link> : null}
            {session.user.role === "ADMIN" ? <Link href="/admin/users" className="text-sm text-white/90">{dict.navUsers}</Link> : null}
          </div>
          <div className="flex items-center gap-3">
            <AdminLangSwitcher currentLang={lang} />
            <LogoutButton label={dict.signOut} />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </main>
  );
}
