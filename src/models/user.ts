import { Prisma, Role } from "@prisma/client";
import { format } from "date-fns";

import { ConflictError, NotFoundError } from "@/errors";
import email from "@/infra/email";
import { prisma } from "@/infra/prisma";
import webserver from "@/infra/webserver";

import password from "./password";
import validator from "./validator";

async function findAll(payload: { approved?: boolean } = {}) {
  const { approved } = payload;

  const whereClause: Prisma.UserWhereInput = {
    NOT: [],
    AND: [],
  };

  if (typeof approved === "boolean") {
    if (approved) {
      (whereClause.NOT as Prisma.UserWhereInput[]).push({
        approvedBy: null,
      });
    } else {
      (whereClause.AND as Prisma.UserWhereInput[]).push({
        approvedBy: null,
      });
    }
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      motherName: true,
      cpf: true,
      birthday: true,
      phoneNumber: true,
      address: true,
      approvedBy: {
        select: {
          name: true,
        },
      },
      approvedAt: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          session: true,
        },
      },
    },
    where: whereClause,
  });

  return users;
}

async function findOneById(userId: string) {
  validator({ id: userId }, { id: "required" });

  const user = await prisma.user.findFirst({
    include: {
      approvedBy: {
        select: {
          name: true,
        },
      },
    },
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new NotFoundError({
      message: `O id "${userId}" não foi encontrado no sistema.`,
      errorLocationCode: "MODEL:USER:FIND_ONE_BY_ID:USER_NOT_FOUND",
    });
  }

  return user;
}

async function findOneByEmail(email: string) {
  validator({ email }, { email: "required" });

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new NotFoundError({
      message: `O email informado não foi encontrado no sistema.`,
      errorLocationCode: "MODEL:USER:FIND_ONE_BY_EMAIL:USER_NOT_FOUND",
    });
  }

  return user;
}

async function create(data: {
  name: string;
  email: string;
  password: string;
  motherName?: string;
  cpf: string;
  birthday: string;
  phoneNumber?: string;
  addressId: string;
}) {
  const hashedPassword = await password.hash(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      motherName: data.motherName,
      cpf: data.cpf,
      birthday: data.birthday,
      phoneNumber: data.phoneNumber,
      addressId: data.addressId,
    },
  });

  return user;
}

async function updateUserPasswordById(userId: string, newPassword: string) {
  validator(
    { id: userId, password: newPassword },
    { id: "required", password: "required" }
  );

  const hashedPassword = await password.hash(newPassword);

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return user;
}

async function updateById(
  id: string,
  body: {
    name?: string;
    email?: string;
    role?: Role;
    avatar?: string;
  }
) {
  validator({ id }, { id: "required" });

  const user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name: body.name,
      email: body.email,
      role: body.role,
      avatar: body.avatar,
    },
  });

  return user;
}

async function approve(userIdApproving: string, userIdBeingApproved: string) {
  const webserverHost = webserver.getHost();

  const user = await findOneById(userIdBeingApproved);

  if (user.approvedAt) {
    throw new ConflictError({
      message: `O cadastro já foi aprovado em ${format(
        user.approvedAt,
        "dd/MM/yyyy"
      )}.`,
      errorLocationCode: "MODEL:USER:APPROVE:USER_ALREADY_APPROVED",
    });
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userIdBeingApproved,
    },
    data: {
      approvedById: userIdApproving,
      approvedAt: new Date(),
    },
  });

  try {
    await email.send({
      from: {
        name: "Callisto",
        address: "nao_responda@trial-yzkq3405pq6gd796.mlsender.net",
      },
      to: user.email,
      subject: "Conta aprovada no Callisto!",
      text: `Clique no link abaixo para acessar sua conta:
      
${webserverHost}

Atenciosamente,
Equipe de TI do Callisto`,
    });
  } catch (error) {
    console.log(error);
  }

  return updatedUser;
}

export default Object.freeze({
  findAll,
  findOneById,
  findOneByEmail,
  create,
  updateUserPasswordById,
  updateById,
  approve,
});
