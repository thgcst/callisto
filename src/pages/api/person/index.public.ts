import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import authentication from "@/models/authentication";
import controller from "@/models/controller";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(authentication.injectPerson)
  .get(getHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const authenticatedUser = request.context.person;

  return response.status(200).json({
    ...authenticatedUser,
    password: undefined,
  });
}
