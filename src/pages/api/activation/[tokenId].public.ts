import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import activation from "@/models/activation";
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
  .patch(patchHandler)
  .use(authentication.injectUser)
  .get(getHandler);

async function getHandler(request: InjectedRequest, response: NextApiResponse) {
  const cleanValues = validator(request.query, {
    tokenId: "required",
  });

  const tokenId = cleanValues.tokenId as string;

  const tokenObject = await activation.findValidUnusedTokenById(tokenId);

  const userObject = await user.findOneById(tokenObject.userId);

  response.status(200).json({
    id: tokenObject.id,
    userEmail: userObject.email,
    expiresAt: tokenObject.expiresAt,
  });
}

async function patchHandler(
  request: InjectedRequest,
  response: NextApiResponse,
) {
  const cleanValues = validator(
    { ...request.body, ...request.query },
    {
      tokenId: "required",
      password: "required",
    },
  );
  const tokenId = cleanValues.tokenId as string;
  const password = cleanValues.password as string;

  const tokenObject = await activation.markTokenAsUsed(tokenId);

  const updatedUser = await user.updateUserPasswordById(
    tokenObject.userId,
    password,
  );

  const sessionObject = await authentication.createSessionAndSetCookies(
    updatedUser.id,
    request,
    response,
  );

  response.status(200).json({
    id: sessionObject.id,
    token: sessionObject.token,
    expiresAt: sessionObject.expiresAt,
    createdAt: sessionObject.createdAt,
    updatedAt: sessionObject.updatedAt,
  });
}
