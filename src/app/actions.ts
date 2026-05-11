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

export async function getMasterSlots(masterId: string, date: string) {
  try {
    return await prisma.slot.findMany({
    where: { masterId, date },
    orderBy: { time: "asc" },
    });
  } catch (err) {
    console.error("[getMasterSlots] error:", err);
    throw err;
  }
}

export async function createBooking(
  slotId: string,
  clientName: string,
  clientPhone: string,
  clientTg?: string,
  comment?: string
) {
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot) throw new Error("Слот не найден");
  if (slot.status !== "free") throw new Error("Слот уже занят");

  const updated = await prisma.slot.update({
    where: { id: slotId, status: "free" },
    data: {
      status: "booked",
      clientName,
      clientPhone,
      clientTg: clientTg || null,
      comment: comment || null,
    },
  });

  revalidatePath("/admin");
  return updated;
}

export async function getBookings() {
  return prisma.slot.findMany({
    where: { status: "booked" },
    include: { master: { include: { service: true } } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
}

export async function cancelBooking(slotId: string) {
  const updated = await prisma.slot.update({
    where: { id: slotId },
    data: {
      status: "free",
      clientName: null,
      clientPhone: null,
      clientTg: null,
      comment: null,
    },
  });

  revalidatePath("/admin");
  return updated;
}
