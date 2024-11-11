import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import controller from "@/models/controller";
import recovery from "@/models/recovery";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
}).post(postHandler);

async function postHandler(
  request: InjectedRequest,
  response: NextApiResponse,
) {
  const { email } = validator(request.body, {
    email: "required",
  });

  const token = await recovery.createAndSendRecoveryEmail(email);

  response.status(200).json({
    expiresAt: token.expiresAt,
  });
}
