import { prisma } from "@/infra/prisma";

async function create(data: {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
}) {
  const address = await prisma.address.create({
    data: {
      cep: data.cep,
      street: data.street,
      number: data.number,
      complement: data.complement,
      city: data.city,
      state: data.state,
    },
  });

  return address;
}

async function updateById(
  id: string,
  body: Partial<{
    cep: string;
    street: string;
    number: string;
    complement: string;
    city: string;
    state: string;
  }>
) {
  const address = await prisma.address.update({
    where: {
      id,
    },
    data: {
      ...body,
    },
  });

  return address;
}

export default Object.freeze({
  create,
  updateById,
});
