/// <reference types="node" />

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@tokokita.com";
  const password = "admin123";

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: email },
    update: {},
    create: {
      email: email,
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
      vendorStatus: "NONE",
    },
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
