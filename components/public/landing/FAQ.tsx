"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQProps {
  lang: 'kz' | 'ru' | 'en';
}

interface FAQItem {
  question: { kz: string; ru: string; en: string };
  answer: { kz: string; ru: string; en: string };
}

const faqData: FAQItem[] = [
  {
    question: {
      kz: 'Турға қандай құжаттар қажет?',
      ru: 'Какие документы нужны для тура?',
      en: 'What documents are needed for the tour?'
    },
    answer: {
      kz: 'Жеке куәлік, студенттік билет (жеңілдікке), медициналық сақтандыру полисі. Барлық ақпарат тіркелгеннен кейін жіберіледі.',
      ru: 'Удостоверение личности, студенческий билет (для скидки), медицинский страховой полис. Вся информация отправляется после регистрации.',
      en: 'ID card, student card (for discount), medical insurance policy. All information is sent after registration.'
    }
  },
  {
    question: {
      kz: 'Турдың бағасына не кіреді?',
      ru: 'Что входит в стоимость тура?',
      en: 'What is included in the tour price?'
    },
    answer: {
      kz: 'Көлік, тұрғын үй, кейбір тамақ, гид қызметі, кіру билеттері және сақтандыру. Әр тур үшін нақты тізім жеке көрсетіледі.',
      ru: 'Транспорт, проживание, некоторое питание, услуги гида, входные билеты и страхование. Точный список указан для каждого тура отдельно.',
      en: 'Transportation, accommodation, some meals, guide services, entrance tickets and insurance. Exact list is specified for each tour separately.'
    }
  },
  {
    question: {
      kz: 'Турды бас тартуға бола ма?',
      ru: 'Можно ли отказаться от тура?',
      en: 'Can I cancel the tour?'
    },
    answer: {
      kz: 'Иә, турға дейін 7 күн қалғанда бас тартсаңыз, 80% қайтарылады. 3 күн қалғанда - 50%. Толық шарттар келісімде көрсетілген.',
      ru: 'Да, при отказе за 7 дней до тура возвращается 80%. За 3 дня - 50%. Полные условия указаны в договоре.',
      en: 'Yes, if you cancel 7 days before the tour, 80% is refunded. 3 days before - 50%. Full conditions are specified in the agreement.'
    }
  },
  {
    question: {
      kz: 'Тамақтану қалай ұйымдастырылған?',
      ru: 'Как организовано питание?',
      en: 'How is the food organized?'
    },
    answer: {
      kz: 'Көптеген турларда таңғы ас және кешкі ас кіреді. Түскі асты топ бірге таңдайды. Вегетариандық опциялар бар.',
      ru: 'В большинстве туров включены завтрак и ужин. Обед группа выбирает вместе. Есть вегетарианские опции.',
      en: 'Most tours include breakfast and dinner. The group chooses lunch together. Vegetarian options are available.'
    }
  },
  {
    question: {
      kz: 'Жалғыз өзім қатыса аламын ба?',
      ru: 'Могу ли я участвовать один?',
      en: 'Can I participate alone?'
    },
    answer: {
      kz: 'Әрине! Біздің турларға көптеген студенттер жалғыз келеді. Бұл жаңа достармен танысудың тамаша мүмкіндігі.',
      ru: 'Конечно! Многие студенты приходят на наши туры одни. Это отличная возможность завести новых друзей.',
      en: 'Of course! Many students come to our tours alone. It\'s a great opportunity to make new friends.'
    }
  },
  {
    question: {
      kz: 'Төтенше жағдайда не істейміз?',
      ru: 'Что делать в экстренной ситуации?',
      en: 'What to do in an emergency?'
    },
    answer: {
      kz: 'Әр топта тәжірибелі гид және алғақы медициналық жәрдем жинағы бар. 24/7 байланыс нөмірі беріледі. Барлық қатысушылар сақтандырылған.',
      ru: 'В каждой группе есть опытный гид и аптечка первой помощи. Предоставляется номер связи 24/7. Все участники застрахованы.',
      en: 'Each group has an experienced guide and first aid kit. A 24/7 contact number is provided. All participants are insured.'
    }
  }
];

export default function FAQ({ lang }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const translations = {
    kz: {
      title: 'Жиі қойылатын сұрақтар',
      subtitle: 'Сіздің сұрақтарыңызға жауаптар'
    },
    ru: {
      title: 'Частые вопросы',
      subtitle: 'Ответы на ваши вопросы'
    },
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Answers to your questions'
    }
  };

  const t = translations[lang];
  const midpoint = Math.ceil(faqData.length / 2);
  const columns = [faqData.slice(0, midpoint), faqData.slice(midpoint)];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-[#FFF9DF]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-4xl font-bold text-[#0A1022] md:text-5xl">{t.title}</h2>
          <p className="text-lg text-[#0A1022]/70">{t.subtitle}</p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {columns.map((column, columnIndex) => (
            <div key={`faq-col-${columnIndex}`} className="glass-white-strong overflow-hidden rounded-3xl border border-white/85">
              {column.map((item, index) => {
                const absoluteIndex = columnIndex * midpoint + index;
                return (
                  <div
                    key={absoluteIndex}
                    className={`bg-white/40 ${index !== column.length - 1 ? "border-b border-[#0A1022]/10" : ""}`}
                  >
                    <button
                      onClick={() => toggleFAQ(absoluteIndex)}
                      className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/50"
                    >
                      <span className="pr-4 text-lg font-semibold text-[#0A1022]">
                        {item.question[lang]}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-[#0D3B8E] transition-transform duration-300 ${
                          openIndex === absoluteIndex ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openIndex === absoluteIndex ? 'max-h-80' : 'max-h-0'
                      }`}
                    >
                      <div className="px-6 pb-5 pt-1 text-[#0A1022]/70 leading-relaxed">
                        {item.answer[lang]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
