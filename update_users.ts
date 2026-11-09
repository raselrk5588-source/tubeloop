import prisma from './src/lib/prisma';

async function main() {
  const result = await prisma.user.updateMany({
    data: {
      isApproved: true,
    },
  });
  console.log(`Updated ${result.count} users to isApproved = true`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
