import { MomentsPanel } from "@/components/admin/moments-panel";
import { listMomentsAdmin } from "@/lib/moments-repo";

export const dynamic = "force-dynamic";

export default async function AdminMomentsPage() {
  const mapped = await listMomentsAdmin();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">Моменты студентов</h1>
      <MomentsPanel initialRows={mapped} />
    </section>
  );
}
