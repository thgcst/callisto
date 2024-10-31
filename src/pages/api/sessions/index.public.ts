import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import { User } from "@prisma/client";

import { ForbiddenError, UnauthorizedError } from "@/errors";
import authentication from "@/models/authentication";
import controller from "@/models/controller";
import session from "@/models/session";
import user from "@/models/user";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .post(postHandler)
  .use(authentication.injectUser)
  .delete(deleteHandler);

async function deleteHandler(
  request: InjectedRequest,
  response: NextApiResponse
) {
  const sessionObject = request.context.session;

  session.clearSessionIdCookie(response);

  const expiredSession = await session.expireById(sessionObject.id);

  return response.status(200).json({
    id: expiredSession.id,
    expiresAt: expiredSession.expiresAt,
    createdAt: expiredSession.createdAt,
    updatedAt: expiredSession.updatedAt,
  });
}

async function postHandler(
  request: InjectedRequest,
  response: NextApiResponse
) {
  const inputValues = {
    email: request.body.email,
    password: request.body.password,
  };

  let storedUser: User;

  try {
    storedUser = await user.findOneByEmail(inputValues.email);
  } catch (error) {
    throw new UnauthorizedError({
      message: `Dados não conferem.`,
      errorLocationCode: `CONTROLLER:SESSIONS:POST_HANDLER:DATA_MISMATCH`,
    });
  }

  try {
    await authentication.comparePasswords(
      inputValues.password,
      storedUser.password
    );
  } catch (error) {
    throw new UnauthorizedError({
      message: `Dados não conferem.`,
      errorLocationCode: `CONTROLLER:SESSIONS:POST_HANDLER:DATA_MISMATCH`,
    });
  }

  if (!storedUser.approvedById) {
    throw new ForbiddenError({
      message: `Sou usuário ainda não foi ativado. Aguarde enquanto seus dados são analisados.`,
      errorLocationCode: `CONTROLLER:SESSIONS:POST_HANDLER:USER_WITHOUT_PASSWORD`,
    });
  }

  const sessionObject = await authentication.createSessionAndSetCookies(
    storedUser.id,
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
