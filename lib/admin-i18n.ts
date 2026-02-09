import { normalizeLanguage } from "@/lib/i18n";
import type { AppLanguage } from "@/lib/constants";

const adminDictionary = {
  kz: {
    navAdmin: "Әкімші",
    navTours: "Турлар",
    navApplications: "Өтінімдер",
    navUsers: "Пайдаланушылар",
    navTeam: "Команда",
    navMoments: "Сәттер",
    signOut: "Шығу",
    dashboardTitle: "Басқару панелі",
    signedInAs: "Кірген пайдаланушы",
    manageTours: "Турларды басқару",
    manageApplications: "Өтінімдерді басқару",
    manageUsers: "Пайдаланушыларды басқару",
    toursTitle: "Турлар",
    newTour: "Жаңа тур",
    tableSlug: "Slug",
    tableStatus: "Күйі",
    tablePosters: "Постерлер",
    tableDate: "Күні",
    tableActions: "Әрекеттер",
    postersReady: "дайын",
    postersMissing: "жоқ",
    edit: "Өңдеу",
    createTourTitle: "Тур құру",
    editTourTitle: "Турды өңдеу",
    usersTitle: "Пайдаланушылар",
    applicationsTitle: "Өтінімдер",
    teamTitle: "Команда",
    manageTeam: "Команда карточкаларын басқару"
  },
  ru: {
    navAdmin: "Админ",
    navTours: "Туры",
    navApplications: "Заявки",
    navUsers: "Пользователи",
    navTeam: "Команда",
    navMoments: "Моменты",
    signOut: "Выйти",
    dashboardTitle: "Панель управления",
    signedInAs: "Вы вошли как",
    manageTours: "Управление турами",
    manageApplications: "Управление заявками",
    manageUsers: "Управление пользователями",
    toursTitle: "Туры",
    newTour: "Новый тур",
    tableSlug: "Slug",
    tableStatus: "Статус",
    tablePosters: "Постеры",
    tableDate: "Дата",
    tableActions: "Действия",
    postersReady: "готово",
    postersMissing: "нет",
    edit: "Редактировать",
    createTourTitle: "Создание тура",
    editTourTitle: "Редактирование тура",
    usersTitle: "Пользователи",
    applicationsTitle: "Заявки",
    teamTitle: "Команда",
    manageTeam: "Управление карточками команды"
  },
  en: {
    navAdmin: "Admin",
    navTours: "Tours",
    navApplications: "Applications",
    navUsers: "Users",
    navTeam: "Team",
    navMoments: "Moments",
    signOut: "Sign out",
    dashboardTitle: "Control panel",
    signedInAs: "Signed in as",
    manageTours: "Manage tours",
    manageApplications: "Manage applications",
    manageUsers: "Manage users",
    toursTitle: "Tours",
    newTour: "New tour",
    tableSlug: "Slug",
    tableStatus: "Status",
    tablePosters: "Posters",
    tableDate: "Date",
    tableActions: "Actions",
    postersReady: "ready",
    postersMissing: "missing",
    edit: "Edit",
    createTourTitle: "Create tour",
    editTourTitle: "Edit tour",
    usersTitle: "Users",
    applicationsTitle: "Applications",
    teamTitle: "Team",
    manageTeam: "Manage team cards"
  }
} as const;

export function resolveAdminLang(value?: string | null): AppLanguage {
  return normalizeLanguage(value);
}

export function adminT(language: AppLanguage) {
  return adminDictionary[language];
}
