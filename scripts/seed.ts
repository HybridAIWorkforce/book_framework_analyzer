import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed test user
  const hashedPassword = await bcrypt.hash("johndoe123", 12);

  await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: { hashedPassword, name: "John Doe" },
    create: {
      email: "john@doe.com",
      hashedPassword,
      name: "John Doe",
    },
  });

  console.log("Seed completed: test user created/updated");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
