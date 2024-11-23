import { Prisma } from "@prisma/client";
import { format } from "date-fns";

import { ConflictError, NotFoundError, ServiceError } from "@/errors";
import email from "@/infra/email";
import { prisma } from "@/infra/prisma";
import webserver from "@/infra/webserver";

import validator from "./validator";

async function findAllPublic() {
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      address: {
        select: {
          city: true,
          state: true,
        },
      },
      _count: {
        select: {
          employees: true,
        },
      },
      createdAt: true,
    },
    where: {
      approvedBy: {
        isNot: null,
      },
    },
  });

  return companies;
}

async function findAll(payload: { approved?: boolean } = {}) {
  const { approved } = payload;

  let whereClause: Prisma.CompanyWhereInput = {};

  if (approved !== undefined) {
    whereClause = {
      approvedBy: {
        [approved ? "isNot" : "is"]: null,
      },
    };
  }

  const companies = await prisma.company.findMany({
    include: {
      address: true,
      _count: {
        select: {
          employees: true,
        },
      },
    },
    where: whereClause,
  });

  return companies;
}

async function findOneById(companyId: string) {
  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
    include: {
      address: true,
      partners: true,
      employees: true,
    },
  });

  if (!company) {
    throw new NotFoundError({
      message: `O id "${companyId}" não foi encontrado no sistema.`,
      errorLocationCode: "MODEL:COMPANY:FIND_ONE_BY_ID:COMPANY_NOT_FOUND",
    });
  }

  return company;
}

async function approve(
  userId: string,
  companyId: string,
  config: {
    sendEmail?: boolean;
  } = { sendEmail: false },
) {
  const webserverHost = webserver.getHost();

  const company = await findOneById(companyId);

  if (company.approvedAt) {
    throw new ConflictError({
      message: `O cadastro já foi aprovado em ${format(
        company.approvedAt,
        "dd/MM/yyyy",
      )}.`,
      errorLocationCode: "MODEL:COMPANY:APPROVE:COMPANY_ALREADY_APPROVED",
    });
  }

  const updatedCompany = await prisma.company.update({
    where: {
      id: companyId,
    },
    data: {
      approvedByUserId: userId,
      approvedAt: new Date(),
    },
  });

  if (config.sendEmail && company.email) {
    try {
      await email.send({
        from: {
          name: "Callisto",
          address: "nao_responda@trial-yzkq3405pq6gd796.mlsender.net",
        },
        to: company.email,
        subject: "Empresa aprovada no Callisto!",
        text: `Clique no link abaixo para acessar:
      
${webserverHost}

Atenciosamente,
Equipe de TI do Callisto`,
      });
    } catch {
      throw new ServiceError({
        message: "Não foi possível enviar o e-mail de aprovação.",
        errorLocationCode: "MODEL:COMPANY:APPROVE:EMAIL_SENDING_ERROR",
      });
    }
  }

  return updatedCompany;
}

async function approveMultiple(
  userId: string,
  companyIds: string[],
  config: { sendEmail?: boolean } = { sendEmail: false },
) {
  const webserverHost = webserver.getHost();
  const updatedCompanies = await prisma.company.updateMany({
    where: {
      id: {
        in: companyIds,
      },
      approvedAt: null,
    },
    data: {
      approvedByUserId: userId,
      approvedAt: new Date(),
    },
  });

  const companies = await prisma.company.findMany({
    select: {
      email: true,
    },
    where: {
      id: {
        in: companyIds,
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
        to: companies.map((item) => item.email).filter((item) => item !== null),
        subject: "Empresa aprovada no Callisto!",
        text: `Clique no link abaixo para acessar:
    
${webserverHost}

Atenciosamente,
Equipe de TI do Callisto`,
      });
    } catch {
      throw new ServiceError({
        message: "Não foi possível enviar o e-mail de aprovação.",
        errorLocationCode: "MODEL:COMPANY:APPROVE:EMAIL_SENDING_ERROR",
      });
    }
  }

  return updatedCompanies;
}

function create(payload: {
  name: string;
  formalized: boolean;
  cnpj?: string;
  fantasyName?: string;
  email?: string;
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
  let companyBody: {
    name: string;
    formalized: boolean;
    cnpj?: string;
    fantasyName?: string;
    email?: string;
    phoneNumber?: string;
  };

  if (payload.formalized) {
    companyBody = validator(payload, {
      name: "required",
      formalized: "required",
      cnpj: "required",
      fantasyName: "optional",
      email: "required",
      phoneNumber: "optional",
    });
  } else {
    companyBody = validator(payload, {
      name: "required",
      formalized: "required",
      email: "optional",
      phoneNumber: "optional",
    });
  }

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

  return prisma.company.create({
    data: {
      ...companyBody,
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
    formalized: boolean;
    cnpj: string;
    fantasyName: string;
    email: string;
    phoneNumber: string;
    partners?: string[];
  }>,
) {
  validator({ id }, { id: "required" });

  const data: Prisma.CompanyUpdateArgs["data"] = {
    name: body.name,
    formalized: body.formalized,
    cnpj: body.cnpj,
    fantasyName: body.fantasyName,
    email: body.email,
    phoneNumber: body.phoneNumber,
    partners: {
      set: body.partners
        ? body.partners.map((partnerId) => ({
            id: partnerId,
          }))
        : undefined,
    },
  };

  if (typeof data.formalized === "boolean" && data.formalized === false) {
    data.cnpj = null;
    data.fantasyName = null;
  }

  const company = await prisma.company.update({
    where: {
      id,
    },
    data,
  });

  return company;
}

export default Object.freeze({
  findAllPublic,
  findAll,
  approve,
  approveMultiple,
  findOneById,
  create,
  updateById,
});
