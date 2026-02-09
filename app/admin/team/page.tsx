import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TeamPanel } from "@/components/admin/team-panel";
import { adminT, resolveAdminLang } from "@/lib/admin-i18n";
import { listTeamMembersAdmin } from "@/lib/team-repo";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const cookieStore = await cookies();
  const lang = resolveAdminLang(cookieStore.get("admin_lang")?.value);
  const dict = adminT(lang);

  const members = await listTeamMembersAdmin();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">{dict.teamTitle}</h1>
      <TeamPanel lang={lang} initialMembers={members} />
    </section>
  );
}
