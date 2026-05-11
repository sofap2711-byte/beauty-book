import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const services = await prisma.service.count();
  const masters = await prisma.master.count();
  const slots = await prisma.slot.count();
  console.log("Services:", services, "Masters:", masters, "Slots:", slots);
  await prisma.$disconnect();
}
main();
