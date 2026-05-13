"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getServiceById(id: string) {
  try {
    return await prisma.service.findUnique({
      where: { id },
      include: { subServices: true, masters: true },
    });
  } catch (err) {
    console.error("[getServiceById] error:", err);
    throw err;
  }
}

export async function getMasterById(id: string) {
  try {
    return await prisma.master.findUnique({
      where: { id },
      include: { service: true },
    });
  } catch (err) {
    console.error("[getMasterById] error:", err);
    throw err;
  }
}

export async function getServices() {
  try {
    return await prisma.service.findMany({
      include: {
        subServices: true,
        masters: true,
      },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    console.error("[getServices] error:", err);
    throw err;
  }
}

export async function getMastersByService(serviceId: string) {
  try {
    return await prisma.master.findMany({
      where: { serviceId },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("[getMastersByService] error:", err);
    throw err;
  }
}

export async function getMasterTimeBlocks(masterId: string, date: string) {
  try {
    const d = new Date(date + "T00:00:00");
    return await prisma.timeBlock.findMany({
      where: {
        masterId,
        date: d,
        type: "booking",
        status: { not: "cancelled" },
      },
      orderBy: { startTime: "asc" },
    });
  } catch (err) {
    console.error("[getMasterTimeBlocks] error:", err);
    throw err;
  }
}

export async function createBooking(
  masterId: string,
  date: string,
  startTime: string,
  endTime: string,
  clientName: string,
  clientPhone: string,
  serviceName: string,
  clientTg?: string,
  comment?: string
) {
  const d = new Date(date + "T00:00:00");

  // Check overlap
  const overlap = await prisma.timeBlock.findFirst({
    where: {
      masterId,
      date: d,
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
      status: { not: "cancelled" },
    },
  });

  if (overlap) {
    throw new Error("Выбранное время пересекается с существующей записью");
  }

  const block = await prisma.timeBlock.create({
    data: {
      masterId,
      date: d,
      startTime,
      endTime,
      type: "booking",
      clientName,
      clientPhone,
      clientTg: clientTg || null,
      comment: comment || null,
      serviceName,
      source: "online",
      status: "confirmed",
    },
  });

  revalidatePath("/admin");
  return block;
}

export async function getBookings() {
  return prisma.timeBlock.findMany({
    where: {
      type: "booking",
      status: { not: "cancelled" },
    },
    include: {
      master: { include: { service: true } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

export async function cancelBooking(blockId: string) {
  const updated = await prisma.timeBlock.update({
    where: { id: blockId },
    data: {
      status: "cancelled",
    },
  });

  revalidatePath("/admin");
  return updated;
}

export async function updateBookingStatus(blockId: string, status: string) {
  const updated = await prisma.timeBlock.update({
    where: { id: blockId },
    data: { status },
  });

  revalidatePath("/admin");
  return updated;
}

export async function updateAdminNotes(blockId: string, notes: string) {
  const updated = await prisma.timeBlock.update({
    where: { id: blockId },
    data: { adminNotes: notes || null },
  });

  revalidatePath("/admin");
  return updated;
}

export async function getClientHistory(clientPhone: string) {
  return prisma.timeBlock.findMany({
    where: {
      clientPhone,
      type: "booking",
    },
    include: {
      master: { include: { service: true } },
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });
}
