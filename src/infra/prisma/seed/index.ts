import { faker } from "@faker-js/faker/locale/pt_BR";
import { PrismaClient } from "@prisma/client";

import authorization from "@/models/authorization";
import individual from "@/models/individual";

import password from "../../../models/password";

const prisma = new PrismaClient();

const generateCpf = (masked = false) => {
  const mod = (dividendo: number, divisor: number) =>
    Math.round(dividendo - Math.floor(dividendo / divisor) * divisor);
  const randNums = String(Math.random()).slice(2, 11);

  let d1 =
    11 -
    mod(
      randNums
        .split("")
        .reverse()
        .reduce((acc, cur, idx) => acc + parseInt(cur) * (idx + 2), 0),
      11,
    );
  if (d1 >= 10) d1 = 0;

  let d2 =
    11 -
    mod(
      d1 * 2 +
        randNums
          .split("")
          .reverse()
          .reduce((acc, cur, idx) => acc + parseInt(cur) * (idx + 3), 0),
      11,
    );
  if (d2 >= 10) d2 = 0;

  const cpfGenerated = `${randNums}${d1}${d2}`;

  return masked
    ? cpfGenerated.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : cpfGenerated;
};

async function main() {
  const user = await prisma.user.upsert({
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
        state: faker.location.state({ abbreviated: true }),
        street: faker.location.street(),
        number: faker.number.int({ min: 1, max: 1000 }).toString(),
        cep: faker.location.zipCode(),
        complement: faker.lorem.words({ min: 0, max: 1 }),
      },
      name: faker.person.fullName(),
      email: faker.internet.email(),
      cpf: generateCpf().toString(),
      phoneNumber: faker.phone.number({ style: "national" }),
      birthday: faker.date.past({ years: 18 }),
    });
  }

  // get 4 random individuals and approve them
  const individuals = await prisma.individual.findMany({
    where: {
      approvedBy: null,
    },
    take: 4,
  });

  for (const ind of individuals) {
    await individual.approve(user.id, ind.id, {
      sendEmail: false,
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
