import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import * as z from "zod";

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
  .use(authorization.isRequestFromAdmin)
  .get(getHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const querySchema = z.object({
    approved: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  });

  const payload = querySchema.parse(request.query);

  const users = await user.findAll(payload);

  response.status(200).json(users);
}
