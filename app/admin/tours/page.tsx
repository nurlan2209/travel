import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminT, resolveAdminLang } from "@/lib/admin-i18n";
import { prisma } from "@/lib/prisma";
import { AdminToursTable } from "@/components/admin/tours-table";

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

      <AdminToursTable
        initialTours={tours.map((tour) => ({
          id: tour.id,
          slug: tour.slug,
          status: tour.status,
          tourDate: tour.tourDate.toISOString(),
          translations: tour.translations.map((translation) => ({
            posterTemplateData: translation.posterTemplateData as { posterUrls?: string[] } | null
          }))
        }))}
        dict={{
          tableSlug: dict.tableSlug,
          tableStatus: dict.tableStatus,
          tablePosters: dict.tablePosters,
          tableDate: dict.tableDate,
          tableActions: dict.tableActions,
          postersReady: dict.postersReady,
          postersMissing: dict.postersMissing,
          edit: dict.edit,
          remove: dict.remove,
          confirmDelete: dict.confirmDelete,
          cancel: dict.cancel,
          confirmRemove: dict.confirmRemove,
          deleteFailed: dict.deleteFailed
        }}
      />
    </section>
  );
}
