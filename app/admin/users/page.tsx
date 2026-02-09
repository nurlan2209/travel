import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UsersPanel } from "@/components/admin/users-panel";
import { prisma } from "@/lib/prisma";
import { adminT, resolveAdminLang } from "@/lib/admin-i18n";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const lang = resolveAdminLang(cookieStore.get("admin_lang")?.value);
  const dict = adminT(lang);

  if (session?.user?.role !== "ADMIN") {
    redirect("/admin/applications");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">{dict.usersTitle}</h1>
      <UsersPanel
        lang={lang}
        initialUsers={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString()
        }))}
      />
    </section>
  );
}
