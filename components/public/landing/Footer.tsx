"use client";

import Image from "next/image";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

interface FooterProps {
  lang: "kz" | "ru" | "en";
}

export default function Footer({ lang }: FooterProps) {
  const translations = {
    kz: {
      tagline: "Саяхаттаңыз. Білім алыңыз. Танысыңыз.",
      navigation: "Навигация",
      links: [
        { label: "Басты", id: "home" },
        { label: "Турлар", id: "tours" },
        { label: "Біз туралы", id: "about" },
        { label: "Құжаттар", id: "documents" },
        { label: "Байланыс", id: "contact" }
      ],
      contacts: "Байланыс",
      city: "Алматы, Қазақстан",
      rights: "© 2026. Барлық құқықтар қорғалған."
    },
    ru: {
      tagline: "Путешествуй. Узнавай. Знакомься.",
      navigation: "Навигация",
      links: [
        { label: "Главная", id: "home" },
        { label: "Туры", id: "tours" },
        { label: "О нас", id: "about" },
        { label: "Документы", id: "documents" },
        { label: "Контакты", id: "contact" }
      ],
      contacts: "Контакты",
      city: "Алматы, Казахстан",
      rights: "© 2026. Все права защищены."
    },
    en: {
      tagline: "Travel. Discover. Connect.",
      navigation: "Navigation",
      links: [
        { label: "Home", id: "home" },
        { label: "Tours", id: "tours" },
        { label: "About", id: "about" },
        { label: "Documents", id: "documents" },
        { label: "Contacts", id: "contact" }
      ],
      contacts: "Contacts",
      city: "Almaty, Kazakhstan",
      rights: "© 2026. All rights reserved."
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
    <footer id="contact" className="bg-gradient-to-b from-[#0A1022] to-[#050810] py-16 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="relative h-16 w-44">
              <Image src="/лого_mnutravel.svg" alt="MNU Travel" fill className="object-contain object-left" />
            </div>
            <p className="mt-4 text-sm text-white/75">{t.tagline}</p>
            <a
              href="https://instagram.com/mnutravel"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#FFD428] transition hover:text-[#FFC000]"
            >
              <Instagram size={18} />
              @mnutravel
            </a>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-bold">{t.navigation}</h4>
            <ul className="space-y-3">
              {t.links.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className="text-sm text-white/70 transition-colors hover:text-[#FFD428]"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-bold">{t.contacts}</h4>
            <div className="space-y-4 text-sm text-white/75">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#FFD428]" />
                <span>{t.city}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={18} className="mt-0.5 text-[#FFD428]" />
                <div className="space-y-1">
                  <a href="tel:+77001234567" className="block transition-colors hover:text-[#FFD428]">
                    +7 (700) 123-45-67
                  </a>
                  <a href="tel:+77001234568" className="block transition-colors hover:text-[#FFD428]">
                    +7 (700) 123-45-68
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-[#FFD428]" />
                <a href="mailto:info@mnutravel.kz" className="transition-colors hover:text-[#FFD428]">
                  info@mnutravel.kz
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8 text-center text-sm text-white/60">
          <p>{t.rights}</p>
        </div>
      </div>
    </footer>
  );
}
