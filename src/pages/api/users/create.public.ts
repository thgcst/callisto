import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import controller from "@/models/controller";
import user from "@/models/user";
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
    name: string;
    email: string;
    password: string;
    motherName?: string;
    cpf: string;
    birthday: string;
    phoneNumber?: string;
    addressId: string;
  } = validator(request.body, {
    name: "required",
    email: "required",
    password: "required",
    motherName: "optional",
    cpf: "required",
    birthday: "required",
    phoneNumber: "optional",
    addressId: "required",
  });

  const newUser = await user.create(body);

  return response.status(201).json({ ...newUser, password: undefined });
}
