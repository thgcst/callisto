import { faker } from "@faker-js/faker/locale/pt_BR";
import { PrismaClient } from "@prisma/client";

import authorization from "@/models/authorization";
import individual from "@/models/individual";

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
      features: [...authorization.systemFeaturesSet],
    },
  });

  // create 10 individuals
  for (let i = 0; i < 10; i++) {
    await individual.create({
      address: {
        city: faker.location.city(),
        state: faker.location.state(),
        street: faker.location.street(),
        number: faker.number.int({ min: 1, max: 1000 }).toString(),
        cep: faker.location.zipCode(),
        complement: faker.lorem.words({ min: 0, max: 1 }),
      },
      name: faker.person.fullName(),
      email: faker.internet.email(),
      cpf: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
      phoneNumber: faker.phone.number({ style: "national" }),
      birthday: faker.date.past({ years: 18 }),
    });
  }
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
