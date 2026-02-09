"use client";

import { Shield, Heart, Star } from 'lucide-react';

interface AboutProps {
  lang: 'kz' | 'ru' | 'en';
}

export default function About({ lang }: AboutProps) {
  const translations = {
    kz: {
      title: 'Неге MNU Travel?',
      subtitle: 'Біз студенттерге ерекше тәжірибе ұсынамыз',
      card1Title: 'Чем мы отличаемся',
      card1Text: 'Біз студенттердің бюджетін, қызығушылықтарын және уақытын ескере отырып, арнайы турларды ұйымдастырамыз. Әр саяхат - жаңа достық және естеліктер.',
      card2Title: 'Наша миссия и ценности',
      card2Text: 'Біздің миссиямыз - жас адамдарға өз елін тануға, тарихымыз бен мәдениетімізді бағалауға және белсенді өмір салтын қалыптастыруға көмектесу.',
      card3Title: 'Безопасность',
      card3Text: 'Барлық турлар тәжірибелі гидтермен өтеді. Біз сақтандыру, медициналық қолдау және 24/7 байланысты қамтамасыз етеміз.'
    },
    ru: {
      title: 'Почему MNU Travel?',
      subtitle: 'Мы предлагаем студентам уникальный опыт',
      card1Title: 'Чем мы отличаемся',
      card1Text: 'Мы организуем специальные туры с учетом бюджета, интересов и времени студентов. Каждое путешествие - это новые дружбы и воспоминания.',
      card2Title: 'Наша миссия и ценности',
      card2Text: 'Наша миссия - помочь молодым людям узнать свою страну, ценить нашу историю и культуру, и формировать активный образ жизни.',
      card3Title: 'Безопасность',
      card3Text: 'Все туры проходят с опытными гидами. Мы обеспечиваем страховку, медицинскую поддержку и связь 24/7.'
    },
    en: {
      title: 'Why MNU Travel?',
      subtitle: 'We offer students a unique experience',
      card1Title: 'What Makes Us Different',
      card1Text: 'We organize special tours considering students\' budget, interests and time. Every journey brings new friendships and memories.',
      card2Title: 'Our Mission and Values',
      card2Text: 'Our mission is to help young people discover their country, appreciate our history and culture, and build an active lifestyle.',
      card3Title: 'Safety',
      card3Text: 'All tours are led by experienced guides. We provide insurance, medical support, and 24/7 communication.'
    }
  };

  const t = translations[lang];

  const cards = [
    {
      icon: Star,
      title: t.card1Title,
      text: t.card1Text,
      color: '#FFD428'
    },
    {
      icon: Heart,
      title: t.card2Title,
      text: t.card2Text,
      color: '#C81F1F'
    },
    {
      icon: Shield,
      title: t.card3Title,
      text: t.card3Text,
      color: '#0D3B8E'
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A1022] mb-4">{t.title}</h2>
          <p className="text-lg text-[#0A1022]/70 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="relative glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-white/60 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ 
                    background: `linear-gradient(135deg, ${card.color}08 0%, transparent 100%)`
                  }}
                />
                
                <div className="relative z-10">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border"
                    style={{ 
                      backgroundColor: `${card.color}20`,
                      borderColor: `${card.color}30`
                    }}
                  >
                    <Icon size={32} style={{ color: card.color }} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0A1022] mb-4">{card.title}</h3>
                  <p className="text-[#0A1022]/70 leading-relaxed">{card.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
