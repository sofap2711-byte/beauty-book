"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function loginMaster(email: string, password: string) {
  const master = await prisma.master.findUnique({
    where: { email },
  });

  if (!master || !master.password) {
    return { error: "Неверный email или пароль" };
  }

  const valid = await bcrypt.compare(password, master.password);
  if (!valid) {
    return { error: "Неверный email или пароль" };
  }

  if (!master.isActive) {
    return { error: "Аккаунт деактивирован" };
  }

  cookies().set("master_session", master.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/master/dashboard");
}

export async function logoutMaster() {
  cookies().delete("master_session");
  redirect("/master/login");
}

export async function getMasterSession() {
  const masterId = cookies().get("master_session")?.value;
  if (!masterId) return null;

  const master = await prisma.master.findUnique({
    where: { id: masterId },
    select: { id: true, name: true, email: true, workDays: true, startTime: true, endTime: true },
  });

  return master;
}

export async function getMasterBookings(masterId: string, filter?: string) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  let dateFilter: { gte?: string; lte?: string } = {};

  if (filter === "today") {
    dateFilter = { gte: today, lte: today };
  } else if (filter === "tomorrow") {
    dateFilter = { gte: tomorrow, lte: tomorrow };
  } else if (filter === "week") {
    dateFilter = { gte: today, lte: weekLater };
  } else if (filter === "month") {
    const monthLater = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    dateFilter = { gte: today, lte: monthLater };
  }

  const bookings = await prisma.booking.findMany({
    where: {
      slot: {
        masterId,
        ...(filter ? { date: dateFilter } : {}),
      },
      status: { not: "cancelled" },
    },
    include: {
      slot: true,
    },
    orderBy: [{ slot: { date: "asc" } }, { slot: { time: "asc" } }],
  });

  return bookings;
}

export async function getMasterStats(masterId: string) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const [todayCount, tomorrowCount, weekCount, totalCount] = await Promise.all([
    prisma.booking.count({
      where: { slot: { masterId, date: today }, status: { not: "cancelled" } },
    }),
    prisma.booking.count({
      where: { slot: { masterId, date: tomorrow }, status: { not: "cancelled" } },
    }),
    prisma.booking.count({
      where: { slot: { masterId, date: { gte: today, lte: weekLater } }, status: { not: "cancelled" } },
    }),
    prisma.booking.count({
      where: { slot: { masterId }, status: "confirmed" },
    }),
  ]);

  return { today: todayCount, tomorrow: tomorrowCount, week: weekCount, total: totalCount };
}

export async function updateMasterSchedule(
  masterId: string,
  data: {
    workDays: string;
    startTime: string;
    endTime: string;
  }
) {
  const updated = await prisma.master.update({
    where: { id: masterId },
    data: {
      workDays: data.workDays,
      startTime: data.startTime,
      endTime: data.endTime,
    },
  });

  revalidatePath("/master/schedule");
  return updated;
}

export async function generateSlotsForDay(masterId: string, date: string, interval: number) {
  const master = await prisma.master.findUnique({ where: { id: masterId } });
  if (!master) throw new Error("Мастер не найден");

  const workDays = master.workDays.split(",").map((d) => parseInt(d.trim(), 10));
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  if (!workDays.includes(dayOfWeek)) {
    throw new Error("Это выходной день по графику");
  }

  const startHour = parseInt(master.startTime.split(":")[0], 10);
  const startMin = parseInt(master.startTime.split(":")[1], 10);
  const endHour = parseInt(master.endTime.split(":")[0], 10);
  const endMin = parseInt(master.endTime.split(":")[1], 10);

  const slots: { masterId: string; date: string; time: string; interval: number; status: string }[] = [];

  const currentDate = new Date(dateObj);
  currentDate.setHours(startHour, startMin, 0, 0);
  const end = new Date(dateObj);
  end.setHours(endHour, endMin, 0, 0);

  while (currentDate < end) {
    const h = currentDate.getHours().toString().padStart(2, "0");
    const m = currentDate.getMinutes().toString().padStart(2, "0");
    const timeStr = `${h}:${m}`;

    slots.push({
      masterId,
      date,
      time: timeStr,
      interval,
      status: "free",
    });

    currentDate.setMinutes(currentDate.getMinutes() + interval);
  }

  await prisma.slot.createMany({
    data: slots,
    skipDuplicates: true,
  });

  revalidatePath("/master/slots");
  return { created: slots.length };
}

export async function getMasterSlotsForMonth(masterId: string, year: number, month: number) {
  const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const endOfMonth = `${year}-${String(month).padStart(2, "0")}-31`;

  const slots = await prisma.slot.findMany({
    where: {
      masterId,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    select: { date: true, status: true, interval: true },
  });

  // Group by date
  const grouped: Record<string, { total: number; booked: number; blocked: number; free: number; interval: number }> = {};

  for (const slot of slots) {
    if (!grouped[slot.date]) {
      grouped[slot.date] = { total: 0, booked: 0, blocked: 0, free: 0, interval: slot.interval };
    }
    grouped[slot.date].total++;
    if (slot.status === "booked") grouped[slot.date].booked++;
    else if (slot.status === "blocked") grouped[slot.date].blocked++;
    else if (slot.status === "free") grouped[slot.date].free++;
  }

  return Object.entries(grouped).map(([date, stats]) => ({ date, ...stats }));
}

export async function getMasterSlotsForDay(masterId: string, date: string) {
  return prisma.slot.findMany({
    where: { masterId, date },
    include: { booking: true },
    orderBy: { time: "asc" },
  });
}

export async function toggleSlotStatus(slotId: string) {
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot) throw new Error("Слот не найден");
  if (slot.status === "booked") throw new Error("Нельзя изменить занятый слот");

  const newStatus = slot.status === "free" ? "blocked" : "free";

  const updated = await prisma.slot.update({
    where: { id: slotId },
    data: { status: newStatus },
  });

  revalidatePath("/master/slots");
  return updated;
}

export async function closeAllFreeSlots(masterId: string, date: string) {
  const result = await prisma.slot.updateMany({
    where: { masterId, date, status: "free" },
    data: { status: "blocked" },
  });

  revalidatePath("/master/slots");
  return { count: result.count };
}

export async function openAllBlockedSlots(masterId: string, date: string) {
  const result = await prisma.slot.updateMany({
    where: { masterId, date, status: "blocked" },
    data: { status: "free" },
  });

  revalidatePath("/master/slots");
  return { count: result.count };
}

export async function deleteSlotsForDay(masterId: string, date: string) {
  const bookedCount = await prisma.slot.count({
    where: { masterId, date, status: "booked" },
  });

  if (bookedCount > 0) {
    throw new Error(`Нельзя удалить: ${bookedCount} записанных клиентов`);
  }

  const result = await prisma.slot.deleteMany({
    where: { masterId, date },
  });

  revalidatePath("/master/slots");
  return { count: result.count };
}
