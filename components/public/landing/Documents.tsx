"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";

interface DocumentsProps {
  lang: "kz" | "ru" | "en";
}

type PublicDocument = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  sortOrder: number;
};

export default function Documents({ lang }: DocumentsProps) {
  const translations = {
    kz: {
      title: "Құжаттар",
      subtitle: "Маңызды құжаттар мен келісімдер",
      download: "Жүктеп алу",
      empty: "Құжаттар әзірге қосылмаған"
    },
    ru: {
      title: "Документы",
      subtitle: "Важные документы и соглашения",
      download: "Скачать",
      empty: "Документы пока не добавлены"
    },
    en: {
      title: "Documents",
      subtitle: "Important documents and agreements",
      download: "Download",
      empty: "No documents added yet"
    }
  };

  const t = translations[lang];
  const [documents, setDocuments] = useState<PublicDocument[]>([]);

  useEffect(() => {
    let active = true;

    async function loadDocuments() {
      const response = await fetch(`/api/documents?lang=${lang}`, { cache: "no-store" });
      if (!response.ok) {
        console.error("[Documents] loadDocuments failed", { status: response.status });
        return;
      }
      const payload = (await response.json()) as PublicDocument[];
      if (active) {
        setDocuments(payload);
      }
    }

    void loadDocuments();
    return () => {
      active = false;
    };
  }, [lang]);

  const sorted = useMemo(
    () => [...documents].sort((a, b) => a.sortOrder - b.sortOrder),
    [documents]
  );

  return (
    <section id="documents" className="bg-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-[#0A1022] md:text-5xl">{t.title}</h2>
          <p className="text-lg text-[#0A1022]/70">{t.subtitle}</p>
        </div>

        {sorted.length === 0 ? (
          <p className="text-center text-[#0A1022]/70">{t.empty}</p>
        ) : (
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {sorted.map((doc) => (
              <div
                key={doc.id}
                className="glass-card group rounded-2xl border border-white/60 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD428]/40 bg-[#FFD428]/20 shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <FileText size={32} className="text-[#0A1022]" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#0A1022]">{doc.title}</h3>
                <p className="mb-6 leading-relaxed text-[#0A1022]/70">{doc.description}</p>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-xl border border-[#FFE066] bg-gradient-to-br from-[#FFD428] to-[#FFC000] px-4 py-3 text-center font-semibold text-[#0A1022] shadow-lg transition-all duration-300 hover:from-[#FFC000] hover:to-[#FFB000] hover:shadow-xl"
                >
                  {t.download}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
