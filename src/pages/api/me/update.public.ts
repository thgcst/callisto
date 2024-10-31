import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import authentication from "@/models/authentication";
import controller from "@/models/controller";
import user from "@/models/user";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(authentication.injectUser)
  .patch(patchHandler);

async function patchHandler(
  request: InjectedRequest,
  response: NextApiResponse
) {
  const body: {
    name?: string;
  } = validator(request.body, {
    name: "optional",
  });

  const updatedUser = await user.updateById(request.context.user.id, body);

  return response.status(201).json({ ...updatedUser, password: undefined });
}
