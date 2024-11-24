import { faker } from "@faker-js/faker/locale/pt_BR";
import { PrismaClient, User } from "@prisma/client";

import authorization from "@/models/authorization";
import company from "@/models/company";
import individual from "@/models/individual";
import { generateCnpj } from "@/utils/cnpj";
import { generateCpf } from "@/utils/cpf";

import password from "../../../models/password";

const prisma = new PrismaClient();

async function createMainUser() {
  return await prisma.user.upsert({
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
}

async function createManyIndividuals(
  user: User,
  quantity: number,
  quantityToApprove?: number,
) {
  if (!quantityToApprove) {
    quantityToApprove = quantity / 2;
  }
  for (let i = 0; i < quantity; i++) {
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
      cpf: generateCpf(),
      phoneNumber: faker.phone.number({ style: "national" }),
      birthday: faker.date.past({ years: 18 }),
    });
  }

  const individuals = await prisma.individual.findMany({
    where: {
      approvedBy: null,
    },
    take: quantityToApprove,
  });

  for (const ind of individuals) {
    await individual.approve(user.id, ind.id, {
      sendEmail: false,
    });
  }
}

async function createManyCompanies(
  user: User,
  quantity: number,
  quantityToApprove?: number,
) {
  if (!quantityToApprove) {
    quantityToApprove = quantity / 2;
  }
  for (let i = 0; i < quantity; i++) {
    await company.create({
      address: {
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        street: faker.location.street(),
        number: faker.number.int({ min: 1, max: 1000 }).toString(),
        cep: faker.location.zipCode(),
        complement: faker.lorem.words({ min: 0, max: 1 }),
      },
      name: faker.company.name(),
      email: faker.internet.email(),
      cnpj: generateCnpj(),
      phoneNumber: faker.phone.number({ style: "national" }),
      formalized: faker.datatype.boolean(),
      fantasyName: faker.company.catchPhrase(),
    });
  }

  const companies = await prisma.company.findMany({
    where: {
      approvedBy: null,
    },
    take: quantityToApprove,
  });

  for (const comp of companies) {
    await company.approve(user.id, comp.id, {
      sendEmail: false,
    });
  }
}

async function main() {
  const user = await createMainUser();

  await createManyIndividuals(user, 10, 4);
  await createManyCompanies(user, 10, 4);
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
