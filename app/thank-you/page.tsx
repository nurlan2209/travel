import Link from "next/link";
import { normalizeLanguage, t } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function ThankYouPage({ searchParams }: Props) {
  const params = await searchParams;
  const lang = normalizeLanguage(params.lang);
  const dict = t(lang);

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#1f3a5f_0%,#091525_50%,#050910_100%)] px-4 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-xl">
        <h1 className="mb-3 text-4xl font-black">{dict.thankYouTitle}</h1>
        <p className="mb-6 text-white/80">{dict.thankYouText}</p>
        <Link href={`/?lang=${lang}`} className="rounded-full bg-[#8d1111] px-5 py-3 text-sm font-semibold">
          {dict.thankYouHome}
        </Link>
      </div>
    </main>
  );
}
