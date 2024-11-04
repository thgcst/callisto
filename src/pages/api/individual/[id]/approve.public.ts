import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import authentication from "@/models/authentication";
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
  .patch(patchHandler);

async function patchHandler(
  request: InjectedRequest,
  response: NextApiResponse
) {
  const { id } = validator(request.query, {
    id: "required",
  });

  const updatedIndividual = await individual.approve(
    request.context.user.id,
    id
  );

  return response.status(200).json(updatedIndividual);
}
