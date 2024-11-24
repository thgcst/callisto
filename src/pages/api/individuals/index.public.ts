import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import * as z from "zod";

import authentication from "@/models/authentication";
import controller from "@/models/controller";
import individual from "@/models/individual";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .post(postHandler)
  .use(authentication.injectUser)
  .get(getHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const schema = z.object({
    name: z.string().optional(),
    take: z.coerce.number().optional(),
  });

  const query = schema.safeParse(request.query);

  if (!query.success) {
    response.status(400).json(query.error);
    return;
  }

  const individuals = await individual.findAllPublic(query.data);

  response.status(200).json(individuals);
}

async function postHandler(
  request: InjectedRequest,
  response: NextApiResponse,
) {
  const individualBody: {
    name: string;
    email: string;
    motherName?: string;
    cpf: string;
    birthday: Date;
    phoneNumber?: string;
  } = validator(request.body, {
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
  } = validator(request.body.address, {
    cep: "required",
    street: "required",
    number: "required",
    complement: "optional",
    city: "required",
    state: "required",
  });

  const newIndividual = await individual.create({
    ...individualBody,
    address: addressBody,
  });

  response.status(201).json(newIndividual);
}
