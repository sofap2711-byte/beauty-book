export interface SubService {
  id: string;
  name: string;
  description: string;
  priceFrom: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  subServices: SubService[];
}

export interface Master {
  id: string;
  name: string;
  role: string;
  rating: number;
  instagram: string;
  categoryId: string;
}

export interface TimeSlot {
  time: string;
  booked: boolean;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "haircut",
    name: "Стрижка",
    description: "Классические и современные техники",
    count: 5,
    subServices: [
      { id: "kare", name: "Каре", description: "Классическое, удлинённое, градуированное", priceFrom: 1200 },
      { id: "kaskad", name: "Каскад", description: "Многослойная стрижка с объёмом", priceFrom: 1400 },
      { id: "bob", name: "Боб", description: "Прямой, текстурированный, на ножке", priceFrom: 1300 },
      { id: "piksi", name: "Пикси", description: "Короткая женская стрижка", priceFrom: 1100 },
      { id: "muzhskaya", name: "Мужская стрижка", description: "Классическая, undercut, fade", priceFrom: 900 },
    ],
  },
  {
    id: "coloring",
    name: "Окрашивание",
    description: "Окрашивание любой сложности",
    count: 6,
    subServices: [
      { id: "melirovanie", name: "Мелирование", description: "Классическое, airtouch, балаяж", priceFrom: 2500 },
      { id: "tonirovanie", name: "Тонирование", description: "Полное или局部", priceFrom: 1800 },
      { id: "okrashivanie-v-odin-ton", name: "Окрашивание в один тон", description: "Краситель премиум-класса", priceFrom: 2000 },
      { id: "blondirovanie", name: "Блондирование", description: "Сложное осветление", priceFrom: 3500 },
      { id: "shatush", name: "Шатуш", description: "Мягкое растяжение цвета", priceFrom: 3000 },
      { id: "sombrе", name: "Сомбре", description: "Естественное затемнение корней", priceFrom: 2800 },
    ],
  },
  {
    id: "care",
    name: "Уход",
    description: "Восстановление и питание волос",
    count: 4,
    subServices: [
      { id: "keratin", name: "Кератиновое выпрямление", description: "Разглаживание и восстановление", priceFrom: 3000 },
      { id: "botox-dlya-volos", name: "Ботокс для волос", description: "Глубокое питание и объём", priceFrom: 2500 },
      { id: "nanoplastika", name: "Нанопластика", description: "Безопасное выпрямление", priceFrom: 3500 },
      { id: "moisture", name: "Увлажняющий комплекс", description: "SPA-уход для волос", priceFrom: 1500 },
    ],
  },
  {
    id: "styling",
    name: "Укладка",
    description: "Повседневные и вечерние образы",
    count: 3,
    subServices: [
      { id: "povsednevnaya", name: "Повседневная укладка", description: "Локоны, гладкость, объём", priceFrom: 800 },
      { id: "vechernee", name: "Вечерняя укладка", description: "Голливудские волны, пучки", priceFrom: 1500 },
      { id: "pricheska", name: "Свадебная причёска", description: "Индивидуальный образ", priceFrom: 2500 },
    ],
  },
  {
    id: "manicure",
    name: "Маникюр",
    description: "Классический и аппаратный",
    count: 4,
    subServices: [
      { id: "klassicheskiy", name: "Классический маникюр", description: "Обрезной или европейский", priceFrom: 800 },
      { id: "apparatnyy", name: "Аппаратный маникюр", description: "Безопасная обработка", priceFrom: 900 },
      { id: "shellac", name: "Покрытие гель-лак", description: "CND, Luxio, Kodi", priceFrom: 1200 },
      { id: "narashchivanie", name: "Наращивание ногтей", description: "Гель, акригель", priceFrom: 2000 },
    ],
  },
  {
    id: "cosmetology",
    name: "Косметология",
    description: "Уход за кожей лица",
    count: 5,
    subServices: [
      { id: "chistka", name: "Чистка лица", description: "Механическая, ультразвуковая, комбинированная", priceFrom: 2000 },
      { id: "piling", name: "Пилинг", description: "Химический, энзимный, ретиноловый", priceFrom: 1800 },
      { id: "uhod", name: "Уходовая процедура", description: "Подбор под тип кожи", priceFrom: 2500 },
      { id: "rf-lifting", name: "RF-лифтинг", description: "Безоперационное омоложение", priceFrom: 3000 },
      { id: "mezoterapiya", name: "Мезотерапия", description: "Инъекционная и безынъекционная", priceFrom: 3500 },
    ],
  },
];

export const masters: Master[] = [
  {
    id: "ekaterina-cosmetology",
    name: "Екатерина",
    role: "Врач-косметолог",
    rating: 5,
    instagram: "ekaterina_cosmo",
    categoryId: "cosmetology",
  },
  {
    id: "anna-cosmetology",
    name: "Анна",
    role: "Косметолог-эстетист",
    rating: 5,
    instagram: "anna_beauty",
    categoryId: "cosmetology",
  },
  {
    id: "maria-hair",
    name: "Мария",
    role: "Стилист-парикмахер",
    rating: 5,
    instagram: "maria_hair",
    categoryId: "haircut",
  },
  {
    id: "olga-color",
    name: "Ольга",
    role: "Колорист",
    rating: 5,
    instagram: "olga_color",
    categoryId: "coloring",
  },
  {
    id: "dmitry-massage",
    name: "Дмитрий",
    role: "Массажист",
    rating: 5,
    instagram: "dmitry_massage",
    categoryId: "care",
  },
  {
    id: "elena-styling",
    name: "Елена",
    role: "Визажист-стилист",
    rating: 5,
    instagram: "elena_styling",
    categoryId: "styling",
  },
  {
    id: "svetlana-nails",
    name: "Светлана",
    role: "Мастер маникюра",
    rating: 5,
    instagram: "svetlana_nails",
    categoryId: "manicure",
  },
  {
    id: "irina-hair",
    name: "Ирина",
    role: "Топ-стилист",
    rating: 5,
    instagram: "irina_top",
    categoryId: "haircut",
  },
];

const timeLabels = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30",
];

export function getSlotsForDate(dateStr: string): TimeSlot[] {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const rand = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  let seed = Math.abs(hash);
  return timeLabels.map((time) => {
    const r = rand(seed++);
    return { time, booked: r < 0.3 };
  });
}

export function getCategoryById(id: string): ServiceCategory | undefined {
  return serviceCategories.find((s) => s.id === id);
}

export function getMastersByCategoryId(categoryId: string): Master[] {
  return masters.filter((m) => m.categoryId === categoryId);
}

export interface Review {
  id: string;
  name: string;
  text: string;
  date: string;
  rating: number;
}

export const reviews: Review[] = [
  {
    id: "1",
    name: "Анна",
    text: "Обожаю этот салон! Мария сделала идеальное каре — ровно так, как я хотела. Атмосфера очень уютная, персонал внимательный. Обязательно приду снова.",
    date: "2025-04-12",
    rating: 5,
  },
  {
    id: "2",
    name: "Екатерина",
    text: "Первый раз делала окрашивание airtouch у Ольги. Результат превзошёл ожидания — цвет держится уже два месяца и не вымывается. Спасибо за профессионализм!",
    date: "2025-03-28",
    rating: 5,
  },
  {
    id: "3",
    name: "Дмитрий",
    text: "Хожу на стрижку раз в три недели. Всегда чётко, быстро и со вкусом. Парковка рядом, запись онлайн — очень удобно.",
    date: "2025-03-15",
    rating: 5,
  },
  {
    id: "4",
    name: "София",
    text: "Делала кератиновое выпрямление. Волосы стали как шёлк! Екатерина всё подробно объяснила, дала рекомендации по уходу. Очень довольна.",
    date: "2025-02-20",
    rating: 5,
  },
  {
    id: "5",
    name: "Ирина",
    text: "Свадебная причёска от Елены — мечта! Держалась весь день, несмотря на танцы и ветер. Спасибо за терпение и внимание к деталям.",
    date: "2025-01-10",
    rating: 5,
  },
];

export function getMasterById(id: string): Master | undefined {
  return masters.find((m) => m.id === id);
}
