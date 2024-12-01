import { Prisma } from "@prisma/client";
import { format } from "date-fns";

import { ConflictError, NotFoundError, ServiceError } from "@/errors";
import email from "@/infra/email";
import { prisma } from "@/infra/prisma";
import webserver from "@/infra/webserver";

import validator from "./validator";

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

async function findAllPublicPaginated(
  payload: {
    page?: number;
    limit?: number;
    name?: string;
  } = {},
) {
  const { page, name } = payload;
  let { limit = null } = payload;

  if (page && !limit) {
    limit = 10;
  }

  let whereClause: Prisma.IndividualWhereInput = {};

  if (name !== undefined) {
    whereClause = {
      ...whereClause,
      name: {
        contains: name,
        mode: "insensitive",
      },
    };
  }

  const individuals = await extendedPrisma.individual
    .paginate({
      select: {
        id: true,
        name: true,
        address: {
          select: {
            city: true,
            state: true,
          },
        },
        maskedCpf: true,
        createdAt: true,
      },
      where: {
        ...whereClause,
        approvedBy: {
          isNot: null,
        },
      },
    })
    .withPages({
      limit,
      page,
    });

  return individuals;
}

async function searchAll(payload: { name?: string } = {}) {
  const { name } = payload;

  let whereClause: Prisma.IndividualWhereInput = {};

  if (name !== undefined) {
    whereClause = {
      ...whereClause,
      name: {
        contains: name,
        mode: "insensitive",
      },
    };
  }

  const individuals = await prisma.individual.findMany({
    select: {
      id: true,
      name: true,
      birthday: true,
      cpf: true,
    },
    where: {
      ...whereClause,
      approvedBy: {
        isNot: null,
      },
    },
    take: 10,
  });

  return individuals;
}

async function findAllPaginated(
  payload: {
    approved?: boolean;
    name?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const { approved, name, page } = payload;
  let { limit = null } = payload;

  if (page && !limit) {
    limit = 10;
  }

  let whereClause: Prisma.IndividualWhereInput = {};

  if (approved !== undefined) {
    whereClause = {
      ...whereClause,
      approvedBy: {
        [approved ? "isNot" : "is"]: null,
      },
    };
  }
  if (name !== undefined) {
    whereClause = {
      ...whereClause,
      name: {
        contains: name,
        mode: "insensitive",
      },
    };
  }

  const individuals = await prisma.individual
    .paginate({
      include: {
        address: true,
      },
      where: whereClause,
    })
    .withPages({
      page,
      limit,
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

async function approve(
  userId: string,
  individualId: string,
  config: {
    sendEmail?: boolean;
  } = { sendEmail: false },
) {
  const webserverHost = webserver.getHost();

  const individual = await findOneById(individualId);

  if (individual.approvedAt) {
    throw new ConflictError({
      message: `O cadastro já foi aprovado em ${format(
        individual.approvedAt,
        "dd/MM/yyyy",
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

  if (config.sendEmail) {
    try {
      await email.send({
        from: {
          name: "Callisto",
          address: "nao_responda@trial-yzkq3405pq6gd796.mlsender.net",
        },
        to: individual.email,
        subject: "Conta aprovada no Callisto!",
        text: `Clique no link abaixo para acessar:
      
${webserverHost}

Atenciosamente,
Equipe de TI do Callisto`,
      });
    } catch {
      throw new ServiceError({
        message: "Não foi possível enviar o e-mail de aprovação.",
        errorLocationCode: "MODEL:INDIVIDUAL:APPROVE:EMAIL_SENDING_ERROR",
      });
    }
  }

  return updatedIndividual;
}

async function approveMultiple(
  userId: string,
  individualIds: string[],
  config: { sendEmail?: boolean } = { sendEmail: false },
) {
  const webserverHost = webserver.getHost();
  const updatedIndividuals = await prisma.individual.updateMany({
    where: {
      id: {
        in: individualIds,
      },
      approvedAt: null,
    },
    data: {
      approvedByUserId: userId,
      approvedAt: new Date(),
    },
  });

  const individuals = await prisma.individual.findMany({
    select: {
      email: true,
    },
    where: {
      id: {
        in: individualIds,
      },
    },
  });

  if (config.sendEmail) {
    try {
      await email.send({
        from: {
          name: "Callisto",
          address: "nao_responda@trial-yzkq3405pq6gd796.mlsender.net",
        },
        to: individuals.map((item) => item.email),
        subject: "Conta aprovada no Callisto!",
        text: `Clique no link abaixo para acessar:
    
${webserverHost}

Atenciosamente,
Equipe de TI do Callisto`,
      });
    } catch {
      throw new ServiceError({
        message: "Não foi possível enviar o e-mail de aprovação.",
        errorLocationCode: "MODEL:INDIVIDUAL:APPROVE:EMAIL_SENDING_ERROR",
      });
    }
  }

  return updatedIndividuals;
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
  const individualBody: {
    name: string;
    email: string;
    motherName?: string;
    cpf: string;
    birthday: Date;
    phoneNumber?: string;
  } = validator(payload, {
    name: "required",
    email: "required",
    motherName: "optional",
    cpf: "required",
    birthday: "required",
    phoneNumber: "optional",
  });

  const addressBody: {
    cep: string;
    street: string;
    number: string;
    complement?: string | null;
    city: string;
    state: string;
  } = validator(payload.address, {
    cep: "required",
    street: "required",
    number: "required",
    complement: "optional",
    city: "required",
    state: "required",
  });

  return prisma.individual.create({
    data: {
      ...individualBody,
      address: {
        create: addressBody,
      },
    },
  });
}

async function updateById(
  id: string,
  body: Partial<{
    name: string;
    email: string;
    motherName: string;
    cpf: string;
    birthday: Date | string;
    phoneNumber: string;
  }>,
) {
  let individual = await prisma.individual.findUnique({
    where: {
      id,
    },
  });

  if (!individual) {
    throw new NotFoundError({
      message: `O id "${id}" não foi encontrado no sistema.`,
      errorLocationCode: "MODEL:INDIVIDUAL:UPDATE_BY_ID:INDIVIDUAL_NOT_FOUND",
    });
  }

  const data: Prisma.IndividualUpdateArgs["data"] = {
    name: body.name,
    email: body.email,
    motherName: body.motherName,
    cpf: body.cpf,
    birthday: body.birthday,
    phoneNumber: body.phoneNumber,
  };

  individual = await prisma.individual.update({
    where: {
      id,
    },
    data,
  });

  return individual;
}

export default Object.freeze({
  findAllPublicPaginated,
  searchAll,
  findAllPaginated,
  approve,
  approveMultiple,
  findOneById,
  create,
  updateById,
});
