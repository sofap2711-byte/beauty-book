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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const weekLater = new Date(today);
  weekLater.setDate(today.getDate() + 7);

  let dateFilter: { gte?: Date; lte?: Date } = {};

  if (filter === "today") {
    dateFilter = { gte: today, lte: today };
  } else if (filter === "tomorrow") {
    dateFilter = { gte: tomorrow, lte: tomorrow };
  } else if (filter === "week") {
    dateFilter = { gte: today, lte: weekLater };
  } else if (filter === "month") {
    const monthLater = new Date(today);
    monthLater.setDate(today.getDate() + 30);
    dateFilter = { gte: today, lte: monthLater };
  }

  const blocks = await prisma.timeBlock.findMany({
    where: {
      masterId,
      type: "booking",
      status: { not: "cancelled" },
      ...(filter ? { date: dateFilter } : {}),
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return blocks;
}

export async function getMasterStats(masterId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const weekLater = new Date(today);
  weekLater.setDate(today.getDate() + 7);

  const [todayCount, tomorrowCount, weekCount, totalCount, revenueAgg] = await Promise.all([
    prisma.timeBlock.count({
      where: { masterId, type: "booking", date: today, status: { not: "cancelled" } },
    }),
    prisma.timeBlock.count({
      where: { masterId, type: "booking", date: tomorrow, status: { not: "cancelled" } },
    }),
    prisma.timeBlock.count({
      where: { masterId, type: "booking", date: { gte: today, lte: weekLater }, status: { not: "cancelled" } },
    }),
    prisma.timeBlock.count({
      where: { masterId, type: "booking", status: "confirmed" },
    }),
    prisma.timeBlock.aggregate({
      where: {
        masterId,
        type: "booking",
        status: { in: ["confirmed", "completed"] },
      },
      _sum: { price: true },
    }),
  ]);

  return {
    today: todayCount,
    tomorrow: tomorrowCount,
    week: weekCount,
    total: totalCount,
    revenue: revenueAgg._sum.price || 0,
  };
}

export async function updateMasterDefaultSchedule(
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

// ===== MasterSchedule Actions =====

export async function getMasterYearSchedule(masterId: string, year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const schedules = await prisma.masterSchedule.findMany({
    where: { masterId, date: { gte: start, lte: end } },
    select: { date: true, startTime: true, endTime: true, isWorkDay: true },
  });

  const map: Record<string, { startTime: string | null; endTime: string | null; isWorkDay: boolean }> = {};
  for (const s of schedules) {
    map[s.date.toISOString().split("T")[0]] = {
      startTime: s.startTime,
      endTime: s.endTime,
      isWorkDay: s.isWorkDay,
    };
  }
  return map;
}

export async function getMasterMonthSchedule(masterId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const schedules = await prisma.masterSchedule.findMany({
    where: { masterId, date: { gte: start, lte: end } },
    select: { date: true, startTime: true, endTime: true, isWorkDay: true },
  });

  const map: Record<string, { startTime: string | null; endTime: string | null; isWorkDay: boolean }> = {};
  for (const s of schedules) {
    map[s.date.toISOString().split("T")[0]] = {
      startTime: s.startTime,
      endTime: s.endTime,
      isWorkDay: s.isWorkDay,
    };
  }
  return map;
}

export async function getMasterDaySchedule(masterId: string, date: string) {
  const d = new Date(date + "T00:00:00");
  return prisma.masterSchedule.findUnique({
    where: { masterId_date: { masterId, date: d } },
  });
}

export async function setMasterDaySchedule(
  masterId: string,
  date: string,
  startTime: string | null,
  endTime: string | null,
  isWorkDay: boolean
) {
  const d = new Date(date + "T00:00:00");

  await prisma.masterSchedule.upsert({
    where: { masterId_date: { masterId, date: d } },
    create: {
      masterId,
      date: d,
      startTime,
      endTime,
      isWorkDay,
    },
    update: {
      startTime,
      endTime,
      isWorkDay,
    },
  });

  revalidatePath("/master/schedule");
  return { success: true };
}

export async function deleteMasterDaySchedule(masterId: string, date: string) {
  const d = new Date(date + "T00:00:00");

  await prisma.masterSchedule.deleteMany({
    where: { masterId, date: d },
  });

  revalidatePath("/master/schedule");
  return { success: true };
}

// ===== TimeBlock Actions =====

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function getMasterDayBlocks(masterId: string, date: string) {
  const d = new Date(date + "T00:00:00");
  return prisma.timeBlock.findMany({
    where: { masterId, date: d },
    orderBy: { startTime: "asc" },
  });
}

export async function checkOverlap(
  masterId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBlockId?: string
) {
  const d = new Date(date + "T00:00:00");

  const overlapping = await prisma.timeBlock.findFirst({
    where: {
      masterId,
      date: d,
      status: { not: "cancelled" },
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
      ...(excludeBlockId ? { id: { not: excludeBlockId } } : {}),
    },
  });
  return overlapping;
}

export async function createTimeBlock(data: {
  masterId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  clientName?: string;
  clientPhone?: string;
  clientTg?: string;
  serviceName?: string;
  comment?: string;
  price?: number;
}) {
  const d = new Date(data.date + "T00:00:00");

  if (parseTime(data.startTime) >= parseTime(data.endTime)) {
    throw new Error("Время окончания должно быть позже начала");
  }

  const overlap = await checkOverlap(data.masterId, data.date, data.startTime, data.endTime);
  if (overlap) {
    throw new Error(`Пересечение с записью ${overlap.startTime}–${overlap.endTime}`);
  }

  const block = await prisma.timeBlock.create({
    data: {
      masterId: data.masterId,
      date: d,
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.type,
      clientName: data.clientName || null,
      clientPhone: data.clientPhone || null,
      clientTg: data.clientTg || null,
      serviceName: data.serviceName || null,
      comment: data.comment || null,
      price: data.price ?? null,
      source: "manual",
      status: data.type === "booking" ? "confirmed" : "confirmed",
    },
  });

  revalidatePath("/master/diary");
  return block;
}

export async function updateTimeBlock(
  blockId: string,
  data: {
    startTime?: string;
    endTime?: string;
    serviceName?: string;
    comment?: string;
    status?: string;
    price?: number;
  }
) {
  const block = await prisma.timeBlock.findUnique({ where: { id: blockId } });
  if (!block) throw new Error("Запись не найдена");

  if (data.startTime && data.endTime) {
    if (parseTime(data.startTime) >= parseTime(data.endTime)) {
      throw new Error("Время окончания должно быть позже начала");
    }
    const overlap = await checkOverlap(
      block.masterId,
      block.date.toISOString().split("T")[0],
      data.startTime,
      data.endTime,
      blockId
    );
    if (overlap) {
      throw new Error(`Пересечение с записью ${overlap.startTime}–${overlap.endTime}`);
    }
  }

  const updated = await prisma.timeBlock.update({
    where: { id: blockId },
    data: {
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.serviceName !== undefined && { serviceName: data.serviceName }),
      ...(data.comment !== undefined && { comment: data.comment }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.price !== undefined && { price: data.price }),
    },
  });

  revalidatePath("/master/diary");
  return updated;
}

export async function deleteTimeBlock(blockId: string) {
  const block = await prisma.timeBlock.findUnique({ where: { id: blockId } });
  if (!block) throw new Error("Запись не найдена");

  if (block.source === "online" && block.status !== "cancelled") {
    throw new Error("Нельзя удалить онлайн-запись. Отмените её через изменение статуса.");
  }

  await prisma.timeBlock.delete({ where: { id: blockId } });

  revalidatePath("/master/diary");
  return { success: true };
}

export async function getMasterBlocksForMonth(masterId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const blocks = await prisma.timeBlock.findMany({
    where: {
      masterId,
      date: { gte: start, lte: end },
      status: { not: "cancelled" },
    },
    select: { date: true, type: true, status: true },
  });

  const grouped: Record<string, { hasBooking: boolean; hasBlocked: boolean; count: number }> = {};

  for (const block of blocks) {
    const dateKey = block.date.toISOString().split("T")[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = { hasBooking: false, hasBlocked: false, count: 0 };
    }
    grouped[dateKey].count++;
    if (block.type === "booking") grouped[dateKey].hasBooking = true;
    if (block.type === "blocked") grouped[dateKey].hasBlocked = true;
  }

  return Object.entries(grouped).map(([date, stats]) => ({ date, ...stats }));
}
