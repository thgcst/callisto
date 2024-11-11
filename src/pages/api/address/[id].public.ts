import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import address from "@/models/address";
import authentication from "@/models/authentication";
import controller from "@/models/controller";
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

  const body: Partial<{
    cep: string;
    street: string;
    number: string;
    complement: string;
    city: string;
    state: string;
  }> = validator(request.body, {
    cep: "optional",
    street: "optional",
    number: "optional",
    complement: "optional",
    city: "optional",
    state: "optional",
  });

  const updatedAddress = await address.updateById(id, body);

  return response.status(200).json(updatedAddress);
}
