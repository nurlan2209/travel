"use client";

import { MapPin, Phone, Mail, Instagram } from 'lucide-react';

interface FooterProps {
  lang: 'kz' | 'ru' | 'en';
}

export default function Footer({ lang }: FooterProps) {
  const translations = {
    kz: {
      tagline: 'Саяхаттаңыз. Білім алыңыз. Танысыңыз.',
      navigation: 'Навигация',
      nav: ['Басты', 'Турлар', 'Студенттер турлары', 'Құжаттар', 'Біз туралы', 'Байланыс'],
      navIds: ['home', 'tours', 'student-tours', 'documents', 'about', 'contact'],
      contacts: 'Байланыс',
      city: 'Алматы, Қазақстан',
      rights: '© 2026 MNU Travel. Барлық құқықтар қорғалған.',
      followUs: 'Бізді Instagram-да бақылаңыз'
    },
    ru: {
      tagline: 'Путешествуй. Узнавай. Знакомься.',
      navigation: 'Навигация',
      nav: ['Главная', 'Туры', 'Туры студентов', 'Документы', 'О нас', 'Контакты'],
      navIds: ['home', 'tours', 'student-tours', 'documents', 'about', 'contact'],
      contacts: 'Контакты',
      city: 'Алматы, Казахстан',
      rights: '© 2026 MNU Travel. Все права защищены.',
      followUs: 'Следите за нами в Instagram'
    },
    en: {
      tagline: 'Travel. Discover. Connect.',
      navigation: 'Navigation',
      nav: ['Home', 'Tours', 'Student Tours', 'Documents', 'About', 'Contacts'],
      navIds: ['home', 'tours', 'student-tours', 'documents', 'about', 'contact'],
      contacts: 'Contacts',
      city: 'Almaty, Kazakhstan',
      rights: '© 2026 MNU Travel. All rights reserved.',
      followUs: 'Follow us on Instagram'
    }
  };

  const t = translations[lang];

  const handleNavClick = (id: string) => {
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
    <footer id="contact" className="bg-gradient-to-b from-[#0A1022] to-[#050810] text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <div className="mb-4 flex items-center justify-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFD428] to-[#FFC000] shadow-lg">
              <span className="text-2xl font-bold text-[#0A1022]">M</span>
            </div>
            <span className="text-2xl font-bold">MNU Travel</span>
          </div>

          <p className="mb-6 text-white/70">{t.tagline}</p>

          <a
            href="https://instagram.com/mnutravel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FFD428] to-[#FFC000] px-4 py-2 font-semibold text-[#0A1022] transition-all duration-300 hover:from-[#FFC000] hover:to-[#FFB000]"
          >
            <Instagram size={20} />
            @mnutravel
          </a>

          <div className="mt-9">
            <h4 className="mb-4 text-lg font-bold">{t.navigation}</h4>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {t.nav.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(t.navIds[index])}
                  className="text-white/70 transition-colors hover:text-[#FFD428]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-9">
            <h4 className="mb-4 text-lg font-bold">{t.contacts}</h4>
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2 text-white/75">
                <MapPin size={18} className="text-[#FFD428]" />
                <span>{t.city}</span>
              </div>
              <div className="flex items-center gap-2 text-white/75">
                <Phone size={18} className="text-[#FFD428]" />
                <div className="space-y-1 text-center">
                  <a href="tel:+77001234567" className="block transition-colors hover:text-[#FFD428]">+7 (700) 123-45-67</a>
                  <a href="tel:+77001234568" className="block transition-colors hover:text-[#FFD428]">+7 (700) 123-45-68</a>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/75">
                <Mail size={18} className="text-[#FFD428]" />
                <a href="mailto:info@mnutravel.kz" className="transition-colors hover:text-[#FFD428]">info@mnutravel.kz</a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-white/60 text-sm">
          <p>{t.rights}</p>
        </div>
      </div>
    </footer>
  );
}
