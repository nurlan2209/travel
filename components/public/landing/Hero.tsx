"use client";

import { ArrowRight, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroProps {
  lang: 'kz' | 'ru' | 'en';
}

export default function Hero({ lang }: HeroProps) {
  const translations = {
    kz: {
      badge: 'Қазақстан студенттік турлары',
      title: 'MNU Travel',
      subtitle: 'Саяхаттаңыз. Білім алыңыз. Танысыңыз.',
      cta1: 'Турларды қарау',
      cta2: 'Өтінім қалдыру'
    },
    ru: {
      badge: 'Kazakhstan Student Tours',
      title: 'MNU Travel',
      subtitle: 'Путешествуй. Узнавай. Знакомься.',
      cta1: 'Смотреть туры',
      cta2: 'Оставить заявку'
    },
    en: {
      badge: 'Kazakhstan Student Tours',
      title: 'MNU Travel',
      subtitle: 'Travel. Discover. Connect.',
      cta1: 'View Tours',
      cta2: 'Apply Now'
    }
  };

  const t = translations[lang];

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1698420475875-6d838697083b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLYXpha2hzdGFuJTIwbW91bnRhaW5zJTIwbGFuZHNjYXBlJTIwdHJhdmVsfGVufDF8fHx8MTc3MDQ2MDUxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Kazakhstan Mountains"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-5 py-2.5 rounded-full glass-dark mb-8 animate-fade-in shadow-2xl">
            <div className="w-2 h-2 bg-[#FFD428] rounded-full mr-3 animate-pulse shadow-lg shadow-[#FFD428]/50"></div>
            <span className="text-sm font-semibold text-white tracking-wide">{t.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
            {t.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-12 font-light tracking-wide drop-shadow-lg">
            {t.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleScroll('tours')}
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-br from-[#FFD428] to-[#FFC000] text-[#0A1022] rounded-xl font-semibold text-lg hover:from-[#FFC000] hover:to-[#FFB000] transition-all duration-300 shadow-2xl hover:shadow-[#FFD428]/30 hover:shadow-2xl flex items-center justify-center gap-2 border border-[#FFE066]"
            >
              {t.cta1}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleScroll('application')}
              className="group w-full sm:w-auto px-8 py-4 glass-dark text-white rounded-xl font-semibold text-lg hover:bg-white/15 transition-all duration-300 shadow-2xl flex items-center justify-center gap-2"
            >
              {t.cta2}
              <Play size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}