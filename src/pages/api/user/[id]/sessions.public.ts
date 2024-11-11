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
  .use(authentication.injectUser)
  .use(authorization.canRequest("read:users"))
  .get(getHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const { id } = validator(request.query, {
    id: "required",
  });

  const userSessions = await session.findAllByUserId(id);

  return response.status(200).json(userSessions);
}
