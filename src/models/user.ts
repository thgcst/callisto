import { Role } from "@prisma/client";

import { NotFoundError } from "@/errors";
import { prisma } from "@/infra/prisma";

import password from "./password";
import validator from "./validator";

async function findAll() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      password: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          session: true,
        },
      },
    },
  });

  return users.map((item) => ({
    ...item,
    password: undefined,
    activated: Boolean(item.password),
  }));
}

async function findOneById(userId: string) {
  validator({ id: userId }, { id: "required" });

  const user = await prisma.user.findFirst({
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

async function create(data: { name: string; email: string; role: Role }) {
  validator(data, { email: "required", role: "required" });

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
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

export default Object.freeze({
  findAll,
  findOneById,
  findOneByEmail,
  create,
  updateUserPasswordById,
  updateById,
});
