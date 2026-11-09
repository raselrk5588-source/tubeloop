import { PrismaClient } from "./src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.video.deleteMany({
    where: {
      status: "PENDING",
      isAiGenerated: true,
    }
  });
  console.log("Deleted pending videos");
}

main().catch(console.error).finally(() => prisma.$disconnect());
