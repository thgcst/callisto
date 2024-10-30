import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import authentication from "@/models/authentication";
import authorization from "@/models/authorization";
import controller from "@/models/controller";
import session from "@/models/session";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(authentication.injectPerson)
  .use(authorization.isRequestFromAdmin)
  .get(getHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const { id } = validator(request.query, {
    id: "required",
  });

  const personSessions = await session.findAllByPersonId(id);

  return response.status(200).json(personSessions);
}
