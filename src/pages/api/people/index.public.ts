import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import authentication from "@/models/authentication";
import authorization from "@/models/authorization";
import controller from "@/models/controller";
import person from "@/models/person";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(authentication.injectPerson)
  .get(authorization.isRequestFromAdmin(), getHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const people = await person.findAll();

  response.status(200).json(people);
}
