import { Role } from "@prisma/client";

import { NotFoundError } from "@/errors";
import { prisma } from "@/infra/prisma";

import password from "./password";
import validator from "./validator";

async function findAll() {
  const people = await prisma.person.findMany({
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

  return people.map((item) => ({
    ...item,
    password: undefined,
    activated: Boolean(item.password),
  }));
}

async function findOneById(personId: string) {
  validator({ id: personId }, { id: "required" });

  const person = await prisma.person.findFirst({
    where: {
      id: personId,
    },
  });

  if (!person) {
    throw new NotFoundError({
      message: `O id "${personId}" não foi encontrado no sistema.`,
      errorLocationCode: "MODEL:USER:FIND_ONE_BY_ID:USER_NOT_FOUND",
    });
  }

  return person;
}

async function findOneByEmail(email: string) {
  validator({ email }, { email: "required" });

  const person = await prisma.person.findUnique({
    where: {
      email: email,
    },
  });

  if (!person) {
    throw new NotFoundError({
      message: `O email informado não foi encontrado no sistema.`,
      errorLocationCode: "MODEL:USER:FIND_ONE_BY_EMAIL:USER_NOT_FOUND",
    });
  }

  return person;
}

async function create(data: { name: string; email: string; role: Role }) {
  validator(data, { email: "required", role: "required" });

  const person = await prisma.person.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
    },
  });

  return person;
}

async function updatePersonPasswordById(personId: string, newPassword: string) {
  validator(
    { id: personId, password: newPassword },
    { id: "required", password: "required" }
  );

  const hashedPassword = await password.hash(newPassword);

  const person = await prisma.person.update({
    where: {
      id: personId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return person;
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

  const person = await prisma.person.update({
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

  return person;
}

export default Object.freeze({
  findAll,
  findOneById,
  findOneByEmail,
  create,
  updatePersonPasswordById,
  updateById,
});
