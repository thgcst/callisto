import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import authentication from "@/models/authentication";
import company from "@/models/company";
import controller from "@/models/controller";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .post(postHandler)
  .use(authentication.injectUser);

async function postHandler(
  request: InjectedRequest,
  response: NextApiResponse,
) {
  let companyBody: {
    name: string;
    formalized: boolean;
    cnpj?: string;
    fantasyName?: string;
    email?: string;
    phoneNumber?: string;
  };

  if (request.body.formalized) {
    companyBody = validator(request.body, {
      name: "required",
      formalized: "required",
      cnpj: "required",
      fantasyName: "optional",
      email: "required",
      phoneNumber: "optional",
    });
  } else {
    companyBody = validator(request.body, {
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
  } = validator(request.body.address, {
    cep: "required",
    street: "required",
    number: "required",
    complement: "optional",
    city: "required",
    state: "required",
  });

  const newCompany = await company.create({
    ...companyBody,
    address: addressBody,
  });

  response.status(201).json(newCompany);
}
