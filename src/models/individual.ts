import { format } from "date-fns";

import { ConflictError, NotFoundError } from "@/errors";
import email from "@/infra/email";
import { prisma } from "@/infra/prisma";
import webserver from "@/infra/webserver";

const extendedPrisma = prisma.$extends({
  result: {
    individual: {
      maskedCpf: {
        needs: { cpf: true },
        compute({ cpf }) {
          return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
        },
      },
    },
  },
});

async function findAll() {
  const individuals = await extendedPrisma.individual.findMany({
    include: {
      address: true,
    },
  });

  return individuals;
}

async function findOneById(individualId: string) {
  const individual = await prisma.individual.findUnique({
    where: {
      id: individualId,
    },
    include: {
      address: true,
    },
  });

  if (!individual) {
    throw new NotFoundError({
      message: `O id "${individualId}" não foi encontrado no sistema.`,
      errorLocationCode: "MODEL:INDIVIDUAL:FIND_ONE_BY_ID:INDIVIDUAL_NOT_FOUND",
    });
  }

  return individual;
}

async function approve(userId: string, individualId: string) {
  const webserverHost = webserver.getHost();

  const individual = await findOneById(individualId);

  if (individual.approvedAt) {
    throw new ConflictError({
      message: `O cadastro já foi aprovado em ${format(
        individual.approvedAt,
        "dd/MM/yyyy"
      )}.`,
      errorLocationCode: "MODEL:INDIVIDUAL:APPROVE:INDIVIDUAL_ALREADY_APPROVED",
    });
  }

  const updatedIndividual = await prisma.individual.update({
    where: {
      id: individualId,
    },
    data: {
      approvedByUserId: userId,
      approvedAt: new Date(),
    },
  });

  try {
    await email.send({
      from: {
        name: "Callisto",
        address: "nao_responda@trial-yzkq3405pq6gd796.mlsender.net",
      },
      to: individual.email,
      subject: "Conta aprovada no Callisto!",
      text: `Clique no link abaixo para acessar sua conta:
      
${webserverHost}

Atenciosamente,
Equipe de TI do Callisto`,
    });
  } catch (error) {
    console.log(error);
  }

  return updatedIndividual;
}

function create(payload: {
  name: string;
  email: string;
  motherName?: string;
  cpf: string;
  birthday: Date | string;
  phoneNumber?: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string | null;
    city: string;
    state: string;
  };
}) {
  return prisma.individual.create({
    data: {
      ...payload,
      email: payload.email.toLowerCase(),
      cpf: payload.cpf.replace(/\D/g, ""),
      phoneNumber: payload.phoneNumber?.replace(/\D/g, ""),
      address: {
        create: payload.address,
      },
    },
  });
}

export default Object.freeze({
  findAll,
  approve,
  findOneById,
  create,
});
