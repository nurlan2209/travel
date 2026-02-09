"use client";

import { useEffect, useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TeamProps {
  lang: "kz" | "ru" | "en";
}

type TeamMember = {
  id: string;
  fullNameRu: string;
  fullNameKz: string;
  fullNameEn: string;
  positionRu: string;
  positionKz: string;
  positionEn: string;
  photoUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const fallbackMembers: TeamMember[] = [
  {
    id: "fallback-1",
    fullNameRu: "Айгерим Нурланова",
    fullNameKz: "Айгерім Нұрланова",
    fullNameEn: "Aigerim Nurlanova",
    positionRu: "Основатель проекта",
    positionKz: "Жобаның негізін қалаушы",
    positionEn: "Project Founder",
    photoUrl:
      "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    sortOrder: 0,
    isActive: true
  },
  {
    id: "fallback-2",
    fullNameRu: "Ерлан Касымов",
    fullNameKz: "Ерлан Қасымов",
    fullNameEn: "Erlan Kasymov",
    positionRu: "Менеджер туров",
    positionKz: "Турлар менеджері",
    positionEn: "Tour Manager",
    photoUrl:
      "https://images.unsplash.com/photo-1770058428099-f2d64ab34006?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    sortOrder: 1,
    isActive: true
  }
];

function pickName(member: TeamMember, lang: TeamProps["lang"]) {
  if (lang === "kz") return member.fullNameKz;
  if (lang === "en") return member.fullNameEn;
  return member.fullNameRu;
}

function pickRole(member: TeamMember, lang: TeamProps["lang"]) {
  if (lang === "kz") return member.positionKz;
  if (lang === "en") return member.positionEn;
  return member.positionRu;
}

export default function Team({ lang }: TeamProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/team", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as TeamMember[];
      setMembers(data);
    }
    void load();
  }, []);

  const translations = {
    kz: {
      title: "Біздің команда",
      subtitle: "Сіздің саяхатыңызды ұйымдастыратын адамдар"
    },
    ru: {
      title: "Наша команда",
      subtitle: "Люди, которые организуют ваши путешествия"
    },
    en: {
      title: "Our Team",
      subtitle: "People who organize your travels"
    }
  };

  const t = translations[lang];
  const teamMembers = members.length > 0 ? members : fallbackMembers;

  return (
    <section id="team" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A1022] mb-4">{t.title}</h2>
          <p className="text-lg text-[#0A1022]/70">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member) => (
            <article key={member.id} className="team-card">
              <div className="team-card__media">
                <div className="team-card__image-wrap">
                  <ImageWithFallback
                    src={member.photoUrl}
                    alt={pickName(member, lang)}
                    className="team-card__image"
                  />
                  <div className="team-card__mask" />
                  <h3 className="team-card__title team-card__title--overlay">{pickName(member, lang)}</h3>
                </div>
              </div>

              <section className="team-card__content">
                <h3 className="team-card__title">{pickName(member, lang)}</h3>
                <p className="team-card__role">{pickRole(member, lang)}</p>
              </section>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
