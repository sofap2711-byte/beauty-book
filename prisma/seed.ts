import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const masterCredentials: Record<string, { email: string; password: string }> = {
  "maria-hair": { email: "maria@example.com", password: "master123" },
  "irina-hair": { email: "irina@example.com", password: "master123" },
};

async function main() {
  await prisma.masterSchedule.deleteMany();
  await prisma.timeBlock.deleteMany();
  await prisma.master.deleteMany();
  await prisma.subService.deleteMany();
  await prisma.service.deleteMany();

  const servicesData = [
    {
      id: "haircut",
      name: "Стрижка",
      description: "Классические и современные техники",
      category: "Парикмахерские услуги",
      subServices: [
        { id: "kare", name: "Каре", description: "Классическое, удлинённое, градуированное", price: "от 1 200₽" },
        { id: "kaskad", name: "Каскад", description: "Многослойная стрижка с объёмом", price: "от 1 400₽" },
        { id: "bob", name: "Боб", description: "Прямой, текстурированный, на ножке", price: "от 1 300₽" },
        { id: "piksi", name: "Пикси", description: "Короткая женская стрижка", price: "от 1 100₽" },
        { id: "muzhskaya", name: "Мужская стрижка", description: "Классическая, undercut, fade", price: "от 900₽" },
      ],
      masters: [
        { id: "maria-hair", name: "Мария", role: "Стилист-парикмахер", instagram: "maria_hair", email: "maria@example.com" },
        { id: "irina-hair", name: "Ирина", role: "Топ-стилист", instagram: "irina_top", email: "irina@example.com" },
      ],
    },
    {
      id: "coloring",
      name: "Окрашивание",
      description: "Окрашивание любой сложности",
      category: "Парикмахерские услуги",
      subServices: [
        { id: "melirovanie", name: "Мелирование", description: "Классическое, airtouch, балаяж", price: "от 2 500₽" },
        { id: "tonirovanie", name: "Тонирование", description: "Полное или локальное", price: "от 1 800₽" },
        { id: "okrashivanie-v-odin-ton", name: "Окрашивание в один тон", description: "Краситель премиум-класса", price: "от 2 000₽" },
        { id: "blondirovanie", name: "Блондирование", description: "Сложное осветление", price: "от 3 500₽" },
        { id: "shatush", name: "Шатуш", description: "Мягкое растяжение цвета", price: "от 3 000₽" },
        { id: "sombrе", name: "Сомбре", description: "Естественное затемнение корней", price: "от 2 800₽" },
      ],
      masters: [
        { id: "olga-color", name: "Ольга", role: "Колорист", instagram: "olga_color", email: "olga@example.com" },
      ],
    },
    {
      id: "care",
      name: "Уход",
      description: "Восстановление и питание волос",
      category: "Парикмахерские услуги",
      subServices: [
        { id: "keratin", name: "Кератиновое выпрямление", description: "Разглаживание и восстановление", price: "от 3 000₽" },
        { id: "botox-dlya-volos", name: "Ботокс для волос", description: "Глубокое питание и объём", price: "от 2 500₽" },
        { id: "nanoplastika", name: "Нанопластика", description: "Безопасное выпрямление", price: "от 3 500₽" },
        { id: "moisture", name: "Увлажняющий комплекс", description: "SPA-уход для волос", price: "от 1 500₽" },
      ],
      masters: [
        { id: "dmitry-massage", name: "Дмитрий", role: "Массажист", instagram: "dmitry_massage", email: "dmitry@example.com" },
      ],
    },
    {
      id: "styling",
      name: "Укладка",
      description: "Повседневные и вечерние образы",
      category: "Парикмахерские услуги",
      subServices: [
        { id: "povsednevnaya", name: "Повседневная укладка", description: "Локоны, гладкость, объём", price: "от 800₽" },
        { id: "vechernee", name: "Вечерняя укладка", description: "Голливудские волны, пучки", price: "от 1 500₽" },
        { id: "pricheska", name: "Свадебная причёска", description: "Индивидуальный образ", price: "от 2 500₽" },
      ],
      masters: [
        { id: "elena-styling", name: "Елена", role: "Визажист-стилист", instagram: "elena_styling", email: "elena@example.com" },
      ],
    },
    {
      id: "manicure",
      name: "Маникюр",
      description: "Классический и аппаратный",
      category: "Ногтевой сервис",
      subServices: [
        { id: "klassicheskiy", name: "Классический маникюр", description: "Обрезной или европейский", price: "от 800₽" },
        { id: "apparatnyy", name: "Аппаратный маникюр", description: "Безопасная обработка", price: "от 900₽" },
        { id: "shellac", name: "Покрытие гель-лак", description: "CND, Luxio, Kodi", price: "от 1 200₽" },
        { id: "narashchivanie", name: "Наращивание ногтей", description: "Гель, акригель", price: "от 2 000₽" },
      ],
      masters: [
        { id: "svetlana-nails", name: "Светлана", role: "Мастер маникюра", instagram: "svetlana_nails", email: "svetlana@example.com" },
      ],
    },
    {
      id: "cosmetology",
      name: "Косметология",
      description: "Уход за кожей лица",
      category: "Косметология",
      subServices: [
        { id: "chistka", name: "Чистка лица", description: "Механическая, ультразвуковая, комбинированная", price: "от 2 000₽" },
        { id: "piling", name: "Пилинг", description: "Химический, энзимный, ретиноловый", price: "от 1 800₽" },
        { id: "uhod", name: "Уходовая процедура", description: "Подбор под тип кожи", price: "от 2 500₽" },
        { id: "rf-lifting", name: "RF-лифтинг", description: "Безоперационное омоложение", price: "от 3 000₽" },
        { id: "mezoterapiya", name: "Мезотерапия", description: "Инъекционная и безынъекционная", price: "от 3 500₽" },
      ],
      masters: [
        { id: "ekaterina-cosmetology", name: "Екатерина", role: "Врач-косметолог", instagram: "ekaterina_cosmo", email: "ekaterina@example.com" },
        { id: "anna-cosmetology", name: "Анна", role: "Косметолог-эстетист", instagram: "anna_beauty", email: "anna@example.com" },
      ],
    },
  ];

  const timeLabels = [
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  ];

  const today = new Date();
  const timeBlocksBatch: any[] = [];

  for (const s of servicesData) {
    const service = await prisma.service.create({
      data: {
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        subServices: {
          create: s.subServices.map((sub) => ({
            id: sub.id,
            name: sub.name,
            description: sub.description,
            price: sub.price,
          })),
        },
      },
    });

    for (const m of s.masters) {
      const master = await prisma.master.create({
        data: {
          id: m.id,
          name: m.name,
          role: m.role,
          instagram: m.instagram,
          email: (m as any).email || null,
          password: masterCredentials[m.id] ? await bcrypt.hash(masterCredentials[m.id].password, 10) : null,
          workDays: "0,1,2,3,4,5,6",
          startTime: "07:00",
          endTime: "22:00",
          serviceId: service.id,
        },
      });

      for (let day = 0; day < 14; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() + day);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split("T")[0];

        let hash = 0;
        for (let i = 0; i < (master.id + dateStr).length; i++) {
          hash = (hash << 5) - hash + (master.id + dateStr).charCodeAt(i);
          hash |= 0;
        }
        const rand = (seed: number) => {
          const x = Math.sin(seed++) * 10000;
          return x - Math.floor(x);
        };
        let seed = Math.abs(hash);

        for (const time of timeLabels) {
          const r = rand(seed++);
          const isBooked = r < 0.3;
          const [h, min] = time.split(":").map(Number);
          const start = new Date(date);
          start.setHours(h, min, 0, 0);
          const end = new Date(start.getTime() + 30 * 60000);
          const endTime = `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;

          const prices = [1200, 1500, 2000, 2500, 3000, 3500, 4000, 1800, 2200, 2800];
          timeBlocksBatch.push({
            masterId: master.id,
            date: date,
            startTime: time,
            endTime: endTime,
            type: isBooked ? "booking" : "blocked",
            clientName: isBooked ? "Демо-клиент" : null,
            clientPhone: isBooked ? "+79991234567" : null,
            clientTg: isBooked ? "@demo" : null,
            serviceName: isBooked ? service.name : null,
            comment: isBooked ? "Демо-комментарий" : null,
            source: isBooked ? "online" : "manual",
            status: isBooked ? "confirmed" : "confirmed",
            price: isBooked ? prices[Math.floor(rand(seed++) * prices.length)] : null,
          });
        }
      }
    }
  }

  // Batch insert all time blocks at once for speed
  const batchSize = 500;
  for (let i = 0; i < timeBlocksBatch.length; i += batchSize) {
    await prisma.timeBlock.createMany({
      data: timeBlocksBatch.slice(i, i + batchSize),
    });
  }

  // Create some MasterSchedule overrides for demo
  const allMasters = await prisma.master.findMany({ select: { id: true } });
  const scheduleOverrides: any[] = [];
  for (const m of allMasters) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      date.setHours(0, 0, 0, 0);
      if (day === 5 || day === 6) {
        scheduleOverrides.push({
          masterId: m.id,
          date: date,
          startTime: "10:00",
          endTime: "18:00",
          isWorkDay: true,
        });
      }
    }
  }
  if (scheduleOverrides.length > 0) {
    await prisma.masterSchedule.createMany({
      data: scheduleOverrides,
      skipDuplicates: true,
    });
  }

  console.log("Seed completed successfully. TimeBlocks created:", timeBlocksBatch.length, "Schedule overrides:", scheduleOverrides.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
