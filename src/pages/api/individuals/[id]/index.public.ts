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
  .use(authentication.injectUser)
  .use(authorization.canRequest("edit:individual"))
  .patch(patchHandler);

async function patchHandler(
  request: InjectedRequest,
  response: NextApiResponse,
) {
  const individualBody: {
    name?: string;
    email?: string;
    motherName?: string;
    cpf?: string;
    birthday?: Date;
    phoneNumber?: string;
  } = validator(request.body, {
    name: "required",
    email: "required",
    motherName: "optional",
    cpf: "required",
    birthday: "required",
    phoneNumber: "optional",
  });

  const newCompany = await individual.updateById(request.query.id as string, {
    ...individualBody,
  });

  response.status(201).json(newCompany);
}
