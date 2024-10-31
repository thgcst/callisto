import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import address from "@/models/address";
import controller from "@/models/controller";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
}).post(postHandler);

async function postHandler(
  request: InjectedRequest,
  response: NextApiResponse
) {
  const body: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
  } = validator(request.body, {
    cep: "required",
    street: "required",
    number: "required",
    complement: "optional",
    city: "required",
    state: "required",
  });

  const newAddress = await address.create(body);

  return response.status(201).json(newAddress);
}
