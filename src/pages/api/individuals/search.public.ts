import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import * as z from "zod";

import authentication from "@/models/authentication";
import controller from "@/models/controller";
import individual from "@/models/individual";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(authentication.injectUser)
  .get(getHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const schema = z.object({
    name: z.string().optional(),
    take: z.coerce.number().optional(),
  });

  const query = schema.safeParse(request.query);

  if (!query.success) {
    response.status(400).json(query.error);
    return;
  }

  const individuals = await individual.searchAll(query.data);

  response.status(200).json(individuals);
}
