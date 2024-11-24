import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import authentication from "@/models/authentication";
import authorization from "@/models/authorization";
import company from "@/models/company";
import controller from "@/models/controller";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(authentication.injectUser)
  .get(getHandler)
  .use(authorization.canRequest("edit:company"))
  .patch(patchHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const payload: {
    id: string;
  } = validator(
    { id: request.query.companyId },
    {
      id: "required",
    },
  );

  const companyData = await company.findOneById(payload.id);

  response.status(200).json(companyData);
}

async function patchHandler(
  request: InjectedRequest,
  response: NextApiResponse,
) {
  const companyBody: {
    name?: string;
    formalized?: boolean;
    cnpj?: string;
    fantasyName?: string;
    email?: string;
    phoneNumber?: string;
    partners?: string[];
  } = validator(request.body, {
    name: "optional",
    formalized: "optional",
    cnpj: "optional",
    fantasyName: "optional",
    email: "optional",
    phoneNumber: "optional",
    partners: "optional",
  });

  const newCompany = await company.updateById(
    request.query.companyId as string,
    {
      ...companyBody,
    },
  );

  response.status(201).json(newCompany);
}
