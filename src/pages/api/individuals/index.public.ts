import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import authentication from "@/models/authentication";
import authorization from "@/models/authorization";
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
  .get(authorization.canRequest("read:individualDetails"), getHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const individuals = await individual.findAll();

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
