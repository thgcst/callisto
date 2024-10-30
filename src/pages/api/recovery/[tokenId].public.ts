import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import authentication from "@/models/authentication";
import controller from "@/models/controller";
import person from "@/models/person";
import recovery from "@/models/recovery";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .get(getHandler)
  .patch(patchHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const cleanValues = validator(request.query, {
    tokenId: "required",
  });

  const tokenId = cleanValues.tokenId as string;

  const tokenObject = await recovery.findValidUnusedTokenById(tokenId);

  const personObject = await person.findOneById(tokenObject.personId);

  response.status(200).json({
    id: tokenObject.id,
    personEmail: personObject.email,
    expiresAt: tokenObject.expiresAt,
  });
}

async function patchHandler(
  request: InjectedRequest,
  response: NextApiResponse
) {
  const cleanValues = validator(
    { ...request.body, ...request.query },
    {
      tokenId: "required",
      password: "required",
    }
  );
  const tokenId = cleanValues.tokenId as string;
  const password = cleanValues.password as string;

  const tokenObject = await recovery.markTokenAsUsed(tokenId);

  const updatedPerson = await person.updatePersonPasswordById(
    tokenObject.personId,
    password
  );

  const sessionObject = await authentication.createSessionAndSetCookies(
    updatedPerson.id,
    request,
    response
  );

  response.status(200).json({
    id: sessionObject.id,
    token: sessionObject.token,
    expiresAt: sessionObject.expiresAt,
    createdAt: sessionObject.createdAt,
    updatedAt: sessionObject.updatedAt,
  });
}
