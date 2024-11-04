import { PrismaClient } from "@prisma/client";

import password from "../../../models/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: {
      email: "thiagodias2708@gmail.com",
    },
    update: {},
    create: {
      name: "Thiago Costa",
      email: "thiagodias2708@gmail.com",
      password: await password.hash("Nov@1234"),
      features: ["create:user", "edit:user", "read:users"],
    },
  });
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
