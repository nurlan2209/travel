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
      kz: 'Турларға қандай жастағы студенттер қатыса алады?',
      ru: 'Студенты какого возраста могут участвовать в турах?',
      en: 'What age students can participate in tours?'
    },
    answer: {
      kz: 'Біздің турларға 18-тен 30 жасқа дейінгі студенттер қатыса алады. Кейбір турларда жас шектеуі болмауы мүмкін.',
      ru: 'В наших турах могут участвовать студенты от 18 до 30 лет. Некоторые туры могут не иметь возрастных ограничений.',
      en: 'Students aged 18 to 30 can participate in our tours. Some tours may have no age restrictions.'
    }
  },
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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-white to-[#FFF9DF]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A1022] mb-4">{t.title}</h2>
          <p className="text-lg text-[#0A1022]/70">{t.subtitle}</p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/60"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/40 transition-colors"
              >
                <span className="text-lg font-semibold text-[#0A1022] pr-4">
                  {item.question[lang]}
                </span>
                <ChevronDown
                  size={24}
                  className={`text-[#0D3B8E] flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 pt-2 text-[#0A1022]/70 leading-relaxed bg-white/20 backdrop-blur-sm">
                  {item.answer[lang]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}