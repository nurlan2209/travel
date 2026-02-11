"use client";

import { CreditCard, Building2 } from 'lucide-react';

interface PaymentMethodsProps {
  lang: 'kz' | 'ru' | 'en';
}

export default function PaymentMethods({ lang }: PaymentMethodsProps) {
  const translations = {
    kz: {
      title: 'Төлем әдістері',
      subtitle: 'Сізге ыңғайлы тәсілді таңдаңыз',
      kaspi: 'Kaspi арқылы төлеу',
      halyk: 'Halyk арқылы төлеу',
      note: 'Төлем сілтемелері сізге тіркелгеннен кейін жіберіледі',
      available: 'Қолжетімді'
    },
    ru: {
      title: 'Способы оплаты',
      subtitle: 'Выберите удобный для вас способ',
      kaspi: 'Оплата Kaspi',
      halyk: 'Оплата Halyk',
      note: 'Ссылки для оплаты будут отправлены вам после регистрации',
      available: 'Доступно'
    },
    en: {
      title: 'Payment Methods',
      subtitle: 'Choose a convenient method for you',
      kaspi: 'Kaspi Payment',
      halyk: 'Halyk Payment',
      note: 'Payment links will be sent to you after registration',
      available: 'Available'
    }
  };

  const t = translations[lang];

  const paymentMethods = [
    {
      name: 'Kaspi',
      icon: CreditCard,
      color: '#F14635',
      bgColor: '#FEF2F2'
    },
    {
      name: 'Halyk',
      icon: Building2,
      color: '#00A859',
      bgColor: '#F0FDF4'
    }
  ];

  return (
    <section id="payment" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A1022] mb-4">{t.title}</h2>
          <p className="text-lg text-[#0A1022]/70">{t.subtitle}</p>
        </div>

        {/* Payment Methods */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div
                  key={index}
                  className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group border border-white/60"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    style={{ backgroundColor: method.bgColor }}
                  >
                    <Icon size={32} style={{ color: method.color }} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0A1022] mb-3">
                    {lang === 'kz' ? `${method.name} арқылы төлеу` : 
                     lang === 'ru' ? `Оплата ${method.name}` : 
                     `${method.name} Payment`}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-md">
                      {t.available}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}