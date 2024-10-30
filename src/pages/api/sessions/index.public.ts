import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import { Person } from "@prisma/client";

import { ForbiddenError, UnauthorizedError } from "@/errors";
import activation from "@/models/activation";
import authentication from "@/models/authentication";
import controller from "@/models/controller";
import person from "@/models/person";
import session from "@/models/session";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .post(postHandler)
  .use(authentication.injectPerson)
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

  let storedPerson: Person;

  try {
    storedPerson = await person.findOneByEmail(inputValues.email);
  } catch (error) {
    throw new UnauthorizedError({
      message: `Dados não conferem.`,
      errorLocationCode: `CONTROLLER:SESSIONS:POST_HANDLER:DATA_MISMATCH`,
    });
  }

  if (!storedPerson.password) {
    await activation.createAndSendActivationEmail(storedPerson);
    throw new ForbiddenError({
      message: `Usuário não foi ativado. Enviamos um novo e-mail para ativação e cadastro de senha.`,
      errorLocationCode: `CONTROLLER:SESSIONS:POST_HANDLER:USER_WITHOUT_PASSWORD`,
    });
  }

  try {
    await authentication.comparePasswords(
      inputValues.password,
      storedPerson.password
    );
  } catch (error) {
    throw new UnauthorizedError({
      message: `Dados não conferem.`,
      errorLocationCode: `CONTROLLER:SESSIONS:POST_HANDLER:DATA_MISMATCH`,
    });
  }

  const sessionObject = await authentication.createSessionAndSetCookies(
    storedPerson.id,
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
