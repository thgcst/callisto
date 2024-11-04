import { format } from "date-fns";

import { ConflictError, NotFoundError } from "@/errors";
import email from "@/infra/email";
import { prisma } from "@/infra/prisma";
import webserver from "@/infra/webserver";

async function findOneById(individualId: string) {
  const individual = await prisma.individual.findUnique({
    where: {
      id: individualId,
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
      approvedById: userId,
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

export default Object.freeze({
  approve,
  findOneById,
});
