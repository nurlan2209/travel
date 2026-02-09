import Link from "next/link";
import { normalizeLanguage, t } from "@/lib/i18n";
import { SiteHeader } from "@/components/public/site-header";

type Props = { searchParams: Promise<{ lang?: string }> };

export default async function DocumentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const lang = normalizeLanguage(params.lang);
  const dict = t(lang);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1f3a5f_0%,#091525_50%,#050910_100%)] text-white">
      <SiteHeader lang={lang} />
      <section className="mx-auto max-w-4xl px-4 pb-12 pt-28">
        <h1 className="mb-4 text-4xl font-black">{dict.documentsTitle}</h1>
        <p className="mb-6 text-white/80">{dict.documentsText}</p>
        <div className="space-y-3 rounded-3xl border border-white/20 bg-white/10 p-6">
          <a className="block rounded-xl bg-black/20 px-4 py-3" href="#">{dict.documentsOffer}</a>
          <a className="block rounded-xl bg-black/20 px-4 py-3" href="#">{dict.documentsRules}</a>
          <a className="block rounded-xl bg-black/20 px-4 py-3" href="#">{dict.documentsPrivacy}</a>
        </div>
        <Link href={`/?lang=${lang}`} className="mt-6 inline-block rounded-full border border-white/40 px-4 py-2">
          {dict.backHome}
        </Link>
      </section>
    </main>
  );
}
