import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminT, resolveAdminLang } from "@/lib/admin-i18n";
import { listDocumentsAdmin } from "@/lib/documents-repo";
import { DocumentsPanel } from "@/components/admin/documents-panel";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  if (session.user.role !== "ADMIN") {
    redirect("/admin/applications");
  }

  const cookieStore = await cookies();
  const lang = resolveAdminLang(cookieStore.get("admin_lang")?.value);
  const dict = adminT(lang);

  const documents = await listDocumentsAdmin();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">{dict.documentsTitle}</h1>
      <DocumentsPanel lang={lang} initialDocuments={documents} />
    </section>
  );
}
