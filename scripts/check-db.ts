import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const services = await prisma.service.count();
  const masters = await prisma.master.count();
  const timeBlocks = await prisma.timeBlock.count();
  console.log("Services:", services, "Masters:", masters, "TimeBlocks:", timeBlocks);
  await prisma.$disconnect();
}
main();
