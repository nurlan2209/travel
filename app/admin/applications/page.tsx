import { cookies } from "next/headers";
import { adminT, resolveAdminLang } from "@/lib/admin-i18n";
import { ApplicationsPanel } from "@/components/admin/applications-panel";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const cookieStore = await cookies();
  const lang = resolveAdminLang(cookieStore.get("admin_lang")?.value);
  const dict = adminT(lang);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">{dict.applicationsTitle}</h1>
      <ApplicationsPanel lang={lang} />
    </section>
  );
}
