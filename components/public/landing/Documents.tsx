"use client";

import { FileText, Shield, Lock } from 'lucide-react';

interface DocumentsProps {
  lang: 'kz' | 'ru' | 'en';
}

export default function Documents({ lang }: DocumentsProps) {
  const translations = {
    kz: {
      title: 'Құжаттар',
      subtitle: 'Маңызды құжаттар мен келісімдер',
      doc1Title: 'Қатысу ережелері',
      doc1Desc: 'Турларға қатысу үшін ережелер мен талаптар',
      doc2Title: 'Оферта келісімі',
      doc2Desc: 'Қызмет көрсету үшін келісім шарттары',
      doc3Title: 'Құпиялылық саясаты',
      doc3Desc: 'Деректерді қорғау және құпиялылық',
      download: 'Жүктеп алу'
    },
    ru: {
      title: 'Документы',
      subtitle: 'Важные документы и соглашения',
      doc1Title: 'Правила участия',
      doc1Desc: 'Правила и требования для участия в турах',
      doc2Title: 'Договор оферты',
      doc2Desc: 'Условия договора на оказание услуг',
      doc3Title: 'Политика конфиденциальности',
      doc3Desc: 'Защита данных и конфиденциальность',
      download: 'Скачать'
    },
    en: {
      title: 'Documents',
      subtitle: 'Important documents and agreements',
      doc1Title: 'Participation Rules',
      doc1Desc: 'Rules and requirements for tour participation',
      doc2Title: 'Offer Agreement',
      doc2Desc: 'Terms of service agreement',
      doc3Title: 'Privacy Policy',
      doc3Desc: 'Data protection and privacy',
      download: 'Download'
    }
  };

  const t = translations[lang];

  const documents = [
    {
      icon: FileText,
      title: t.doc1Title,
      description: t.doc1Desc,
      color: '#FFD428'
    },
    {
      icon: Shield,
      title: t.doc2Title,
      description: t.doc2Desc,
      color: '#0D3B8E'
    },
    {
      icon: Lock,
      title: t.doc3Title,
      description: t.doc3Desc,
      color: '#C81F1F'
    }
  ];

  return (
    <section id="documents" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A1022] mb-4">{t.title}</h2>
          <p className="text-lg text-[#0A1022]/70">{t.subtitle}</p>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {documents.map((doc, index) => {
            const Icon = doc.icon;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group border border-white/60"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border"
                  style={{ 
                    backgroundColor: `${doc.color}20`,
                    borderColor: `${doc.color}30`
                  }}
                >
                  <Icon size={32} style={{ color: doc.color }} />
                </div>
                <h3 className="text-xl font-bold text-[#0A1022] mb-3">{doc.title}</h3>
                <p className="text-[#0A1022]/70 mb-6 leading-relaxed">{doc.description}</p>
                <button className="w-full px-4 py-3 bg-gradient-to-br from-[#0A1022] to-[#0D3B8E] text-white rounded-xl font-semibold hover:from-[#0D3B8E] hover:to-[#0A2C6B] transition-all shadow-lg hover:shadow-xl border border-white/10">
                  {t.download}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}