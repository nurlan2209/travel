import { cookies } from "next/headers";
import { adminT, resolveAdminLang } from "@/lib/admin-i18n";
import { TourForm } from "@/components/admin/tour-form";

export default async function NewTourPage() {
  const cookieStore = await cookies();
  const lang = resolveAdminLang(cookieStore.get("admin_lang")?.value);
  const dict = adminT(lang);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">{dict.createTourTitle}</h1>
      <TourForm lang={lang} />
    </section>
  );
}
