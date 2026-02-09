import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminT, resolveAdminLang } from "@/lib/admin-i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminToursPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const cookieStore = await cookies();
  const lang = resolveAdminLang(cookieStore.get("admin_lang")?.value);
  const dict = adminT(lang);

  const tours = await prisma.tourPost.findMany({
    include: { translations: true },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">{dict.toursTitle}</h1>
        <Link href="/admin/tours/new" className="rounded-xl bg-[#8d1111] px-4 py-2 text-sm font-semibold">
          {dict.newTour}
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/8">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-left text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">{dict.tableSlug}</th>
              <th className="px-4 py-3">{dict.tableStatus}</th>
              <th className="px-4 py-3">{dict.tablePosters}</th>
              <th className="px-4 py-3">{dict.tableDate}</th>
              <th className="px-4 py-3">{dict.tableActions}</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => (
              (() => {
                const hasLangPosters = tour.translations.filter((translation) => {
                  const data = translation.posterTemplateData as { posterUrls?: string[] } | null;
                  return Array.isArray(data?.posterUrls) && data.posterUrls.some(Boolean);
                }).length;
                return (
              <tr key={tour.id} className="border-t border-white/10">
                <td className="px-4 py-3">{tour.slug}</td>
                <td className="px-4 py-3">{tour.status}</td>
                <td className="px-4 py-3">
                  {hasLangPosters >= 3 ? (
                    <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-100">{dict.postersReady}</span>
                  ) : (
                    <span className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-100">{dict.postersMissing}</span>
                  )}
                </td>
                <td className="px-4 py-3">{new Date(tour.tourDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link className="text-[#ffb3b3] underline" href={`/admin/tours/${tour.id}`}>
                    {dict.edit}
                  </Link>
                </td>
              </tr>
                );
              })()
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
