import bcrypt from "bcrypt";
import {
  Language,
  PrismaClient,
  Role,
  TourStatus,
  TranslationStatus
} from "@prisma/client";

const prisma = new PrismaClient();

const defaultPosterData = {
  posterA: {
    heroTagline: "Откройте для себя свободу и тайны кочевой жизни в Balqaragai",
    featureBlocks: [
      {
        title: "КАТАНИЕ НА ЛОШАДЯХ",
        lines: ["Прогулки под руководством инструктора", "Комфортно даже для новичков"]
      },
      {
        title: "ГИД-ПРОВОДНИК",
        lines: ["Живые легенды и погружение", "в историю местности"]
      },
      {
        title: "ЭТНО-ФОТОСЕССИЯ",
        lines: ["в национальных костюмах", "в ханской юрте / на природе"]
      },
      {
        title: "ГОРКА / КОНЬКИ",
        lines: ["Для тех, кто предпочитает", "зимний драйв"]
      },
      {
        title: "МАСТЕР-КЛАСС",
        lines: ["По освоению кочевых навыков", "камча, седловка и секреты крепких узлов"]
      },
      {
        title: "ЧАЙ ИЗ САМОВАРА",
        lines: ["Дастархан с национальными сладостями", "в ханской юрте и развлечения"]
      }
    ],
    priceLabel: "32 990₸"
  },
  posterB: {
    programTitle: "В ПРОГРАММЕ ТУРА:",
    timeline: [
      { time: "9:20", text: "СБОР В УНИВЕРСИТЕТЕ" },
      { time: "9:30-10:30", text: "ТРАНСФЕР ДО БАЗЫ ОТДЫХА BALQARAGAI" },
      { time: "10:30", text: "МАСТЕР-КЛАСС ПО ОСВОЕНИЮ КОЧЕВЫХ НАВЫКОВ" },
      { time: "11:00-12:00", text: "КАТАНИЕ НА ЛОШАДЯХ" },
      { time: "12:00-12:40", text: "СНОУТЮБИНГ / КОНЬКИ" },
      { time: "12:40", text: "ЭТНО-ФОТОСЕССИЯ" },
      { time: "13:30", text: "ЧАЙ ИЗ САМОВАРА В ХАНСКОЙ ЮРТЕ" },
      { time: "14:30", text: "ТРАНСФЕР ДО УНИВЕРСИТЕТА" }
    ],
    priceLabel: "32 990₸",
    registerNote: "РЕГИСТРАЦИЯ ПО ССЫЛКЕ В ГУГЛ ФОРМЕ"
  }
};

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("Skipping admin seed. ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash,
        role: Role.ADMIN,
        isActive: true
      },
      create: {
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
        isActive: true
      }
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      brandTitle: "Этно-тур с MNU Travel",
      brandSubtitle: "Откройте для себя свободу и тайны кочевой жизни",
      instagramHandle: "@mnutravel",
      footerAddress: "Зона отдыха Balqaragai, Астана",
      topFrameText: "Этно-тур с MNU Travel",
      bottomFrameText: "Почувствуй атмосферу этно-тура с MNU Travel",
      decorTokens: {
        topLogoVariant: "mnu-ethno",
        bottomDivider: true,
        defaultPriceBadge: "oval"
      }
    }
  });

  const teamCount = await prisma.teamMember.count();
  if (teamCount === 0) {
    await prisma.teamMember.createMany({
      data: [
        {
          fullNameRu: "Айгерим Нурланова",
          fullNameKz: "Айгерім Нұрланова",
          fullNameEn: "Aigerim Nurlanova",
          positionRu: "Основатель проекта",
          positionKz: "Жобаның негізін қалаушы",
          positionEn: "Project Founder",
          photoUrl: "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
          sortOrder: 0,
          isActive: true
        },
        {
          fullNameRu: "Ерлан Касымов",
          fullNameKz: "Ерлан Қасымов",
          fullNameEn: "Erlan Kasymov",
          positionRu: "Менеджер туров",
          positionKz: "Турлар менеджері",
          positionEn: "Tour Manager",
          photoUrl: "https://images.unsplash.com/photo-1770058428099-f2d64ab34006?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
          sortOrder: 1,
          isActive: true
        }
      ]
    });
  }

  const tour = await prisma.tourPost.upsert({
    where: { slug: "balqaragai-ethno-tour" },
    update: {},
    create: {
      slug: "balqaragai-ethno-tour",
      status: TourStatus.DRAFT,
      coverImage: "https://images.unsplash.com/photo-1482192505345-5655af888cc4",
      gallery: [
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf",
        "https://images.unsplash.com/photo-1517825738774-7de9363ef735"
      ],
      price: 32990,
      duration: "1 day",
      meetingTime: "09:20",
      tourDate: new Date("2026-02-21T09:20:00.000Z"),
      place: "Balqaragai",
      location: "Astana, Malotimofeevka-2"
    }
  });

  const translations = [
    {
      language: Language.RU,
      title: "Этно-тур Balqaragai",
      description: "Откройте для себя свободу кочевой жизни в однодневном туре.",
      translationStatus: TranslationStatus.MANUAL
    },
    {
      language: Language.KZ,
      title: "Balqaragai этно-тур",
      description: "Ұлттық атмосфераға еніп, бір күндік этно-турға қосылыңыз.",
      translationStatus: TranslationStatus.AUTO_GENERATED
    },
    {
      language: Language.EN,
      title: "Balqaragai Ethno Tour",
      description: "Experience nomadic culture in a one-day immersive tour.",
      translationStatus: TranslationStatus.AUTO_GENERATED
    }
  ] as const;

  for (const item of translations) {
    await prisma.tourPostTranslation.upsert({
      where: {
        tourPostId_language: {
          tourPostId: tour.id,
          language: item.language
        }
      },
      update: {
        title: item.title,
        description: item.description,
        posterTemplateData: defaultPosterData,
        translationStatus: item.translationStatus,
        translationVersion: 1,
        sourceRuHash: "seed"
      },
      create: {
        tourPostId: tour.id,
        language: item.language,
        title: item.title,
        description: item.description,
        posterTemplateData: defaultPosterData,
        translationStatus: item.translationStatus,
        translationVersion: 1,
        sourceRuHash: "seed"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
