export interface Service {
  id: string;
  name: string;
  priceFrom: number;
  description: string;
  icon: string;
}

export interface Master {
  id: string;
  name: string;
  role: string;
  rating: number;
  instagram: string;
  serviceId: string;
}

export interface TimeSlot {
  time: string;
  booked: boolean;
}

export const services: Service[] = [
  {
    id: "manicure",
    name: "Маникюр",
    priceFrom: 1500,
    description: "Классический, аппаратный, комбинированный",
    icon: "Sparkles",
  },
  {
    id: "cosmetology",
    name: "Косметология",
    priceFrom: 3000,
    description: "Чистка лица, пилинги, уходовые процедуры",
    icon: "Heart",
  },
  {
    id: "massage",
    name: "Массаж",
    priceFrom: 2000,
    description: "Лечебный, расслабляющий, антицеллюлитный",
    icon: "Flower2",
  },
];

export const masters: Master[] = [
  {
    id: "ekaterina-cosmetology",
    name: "Екатерина",
    role: "Врач-косметолог",
    rating: 5,
    instagram: "ekaterina_cosmo",
    serviceId: "cosmetology",
  },
  {
    id: "anna-cosmetology",
    name: "Анна",
    role: "Косметолог-эстетист",
    rating: 5,
    instagram: "anna_beauty",
    serviceId: "cosmetology",
  },
  {
    id: "maria-manicure",
    name: "Мария",
    role: "Мастер маникюра",
    rating: 5,
    instagram: "maria_nails",
    serviceId: "manicure",
  },
  {
    id: "olga-manicure",
    name: "Ольга",
    role: "Топ-мастер",
    rating: 5,
    instagram: "olga_nailart",
    serviceId: "manicure",
  },
  {
    id: "dmitry-massage",
    name: "Дмитрий",
    role: "Массажист",
    rating: 5,
    instagram: "dmitry_massage",
    serviceId: "massage",
  },
  {
    id: "elena-massage",
    name: "Елена",
    role: "Спа-мастер",
    rating: 5,
    instagram: "elena_spa",
    serviceId: "massage",
  },
];

const timeLabels = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
];

export function getSlotsForDate(dateStr: string): TimeSlot[] {
  // Deterministic pseudo-random based on date string
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
    return {
      time,
      booked: r < 0.3,
    };
  });
}

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getMastersByServiceId(serviceId: string): Master[] {
  return masters.filter((m) => m.serviceId === serviceId);
}

export function getMasterById(id: string): Master | undefined {
  return masters.find((m) => m.id === id);
}
