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
    select: { id: true, name: true, email: true, workDays: true, startTime: true, endTime: true, breakStart: true, breakEnd: true },
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
      where: { slot: { masterId }, status: { not: "cancelled" } },
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
    breakStart?: string;
    breakEnd?: string;
  }
) {
  const updated = await prisma.master.update({
    where: { id: masterId },
    data: {
      workDays: data.workDays,
      startTime: data.startTime,
      endTime: data.endTime,
      breakStart: data.breakStart || null,
      breakEnd: data.breakEnd || null,
    },
  });

  revalidatePath("/master/schedule");
  return updated;
}

export async function generateSlotsForMaster(masterId: string) {
  const master = await prisma.master.findUnique({ where: { id: masterId } });
  if (!master) throw new Error("Мастер не найден");

  const workDays = master.workDays.split(",").map((d) => parseInt(d.trim(), 10));
  const startHour = parseInt(master.startTime.split(":")[0], 10);
  const startMin = parseInt(master.startTime.split(":")[1], 10);
  const endHour = parseInt(master.endTime.split(":")[0], 10);
  const endMin = parseInt(master.endTime.split(":")[1], 10);

  const breakStartHour = master.breakStart ? parseInt(master.breakStart.split(":")[0], 10) : null;
  const breakStartMin = master.breakStart ? parseInt(master.breakStart.split(":")[1], 10) : null;
  const breakEndHour = master.breakEnd ? parseInt(master.breakEnd.split(":")[0], 10) : null;
  const breakEndMin = master.breakEnd ? parseInt(master.breakEnd.split(":")[1], 10) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // Delete old free slots
  await prisma.slot.deleteMany({
    where: {
      masterId,
      status: "free",
      date: { lt: todayStr },
    },
  });

  const slots: { masterId: string; date: string; time: string; status: string }[] = [];

  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();

    if (!workDays.includes(dayOfWeek)) continue;

    const currentDate = new Date(date);
    currentDate.setHours(startHour, startMin, 0, 0);
    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);

    while (currentDate < end) {
      const h = currentDate.getHours().toString().padStart(2, "0");
      const m = currentDate.getMinutes().toString().padStart(2, "0");
      const timeStr = `${h}:${m}`;

      // Skip break time
      if (breakStartHour !== null && breakEndHour !== null) {
        const breakStart = new Date(date);
        breakStart.setHours(breakStartHour, breakStartMin || 0, 0, 0);
        const breakEnd = new Date(date);
        breakEnd.setHours(breakEndHour, breakEndMin || 0, 0, 0);

        if (currentDate >= breakStart && currentDate < breakEnd) {
          currentDate.setMinutes(currentDate.getMinutes() + 30);
          continue;
        }
      }

      slots.push({
        masterId,
        date: dateStr,
        time: timeStr,
        status: "free",
      });

      currentDate.setMinutes(currentDate.getMinutes() + 30);
    }
  }

  // Batch insert with skip duplicates
  const batchSize = 500;
  for (let i = 0; i < slots.length; i += batchSize) {
    await prisma.slot.createMany({
      data: slots.slice(i, i + batchSize),
      skipDuplicates: true,
    });
  }

  revalidatePath("/master/slots");
  return { created: slots.length };
}

export async function getMasterSlotsByMonth(masterId: string, year: number, month: number) {
  const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const endOfMonth = `${year}-${String(month).padStart(2, "0")}-31`;

  return prisma.slot.findMany({
    where: {
      masterId,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
}

export async function toggleSlotStatus(slotId: string, newStatus: string) {
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot) throw new Error("Слот не найден");
  if (slot.status === "booked") throw new Error("Нельзя изменить занятый слот");

  const updated = await prisma.slot.update({
    where: { id: slotId },
    data: { status: newStatus },
  });

  revalidatePath("/master/slots");
  return updated;
}
