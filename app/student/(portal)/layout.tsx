import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/logout-button";

export default async function StudentPortalLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/?auth=1");
  if (session.user.role !== "STUDENT") redirect("/admin/applications");

  return (
    <main className="min-h-screen bg-white text-[#0A1022]">
      <header className="sticky top-0 z-40 border-b border-[#0A1022]/8 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="glass-white-strong flex items-center justify-between rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-5">
              <Link href="/" className="flex items-center gap-2">
              <div className="relative h-14 w-14">
                <Image src="/logo_mnu.svg" alt="MNU logo" fill className="object-contain brightness-0" />
              </div>
              <span className="text-lg font-black">MNU Travel</span>
            </Link>
            <div className="glass-white flex items-center gap-2 rounded-xl px-1.5 py-1">
              <Link href="/student" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#0A1022]/90 transition hover:bg-white/70 hover:text-[#0D3B8E]">Мои туры</Link>
              <Link href="/student/profile" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#0A1022]/90 transition hover:bg-white/70 hover:text-[#0D3B8E]">Профиль</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LogoutButton
              label="Выйти"
              callbackUrl="/"
              className="border-[#0A1022]/15 bg-white/70 text-[#0A1022] hover:bg-white/95"
            />
          </div>
        </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </main>
  );
}
