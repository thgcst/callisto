import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import authentication from "@/models/authentication";
import authorization from "@/models/authorization";
import controller from "@/models/controller";
import user from "@/models/user";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(authentication.injectUser)
  .get(authorization.canRequest("read:users"), getHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const users = await user.findAll();

  response.status(200).json(users);
}
