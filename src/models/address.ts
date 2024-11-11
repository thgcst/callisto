import { NotFoundError } from "@/errors";
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
  data: Partial<{
    cep: string;
    street: string;
    number: string;
    complement: string;
    city: string;
    state: string;
  }>,
) {
  const address = await prisma.address.update({
    where: {
      id,
    },
    data,
  });

  return address;
}

async function findOneById(addressId: string) {
  const address = await prisma.address.findUnique({
    where: {
      id: addressId,
    },
  });

  if (!address) {
    throw new NotFoundError({
      message: `O id "${addressId}" não foi encontrado no sistema.`,
      errorLocationCode: "MODEL:ADDRESS:FIND_ONE_BY_ID:ADDRESS_NOT_FOUND",
    });
  }

  return address;
}

export default Object.freeze({
  create,
  updateById,
  findOneById,
});
