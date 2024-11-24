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
  .use(authorization.canRequest("edit:company"))
  .post(postHandler)
  .delete(deleteHandler);

async function postHandler(
  request: InjectedRequest,
  response: NextApiResponse,
) {
  const body: {
    id: string;
  } = validator(
    { id: request.query.partnerId },
    {
      id: "required",
    },
  );

  const newPartner = await company.addPartner(
    request.query.companyId as string,
    request.context.user.id,
    body.id,
  );

  response.status(201).json(newPartner);
}

async function deleteHandler(
  request: InjectedRequest,
  response: NextApiResponse,
) {
  const body: {
    id: string;
  } = validator(
    { id: request.query.partnerId },
    {
      id: "required",
    },
  );

  const newPartner = await company.removePartner(
    request.query.companyId as string,
    body.id,
  );

  response.status(201).json(newPartner);
}
