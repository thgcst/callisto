import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";

import { Person } from "@prisma/client";

import { UnauthorizedError } from "@/errors";
import InjectedRequest from "@/types/InjectedRequest";

import password from "./password";
import person from "./person";
import session from "./session";
import validator from "./validator";

async function injectPerson(
  request: InjectedRequest,
  response: NextApiResponse,
  next: NextHandler
) {
  if (request.cookies?.sessionToken) {
    const cleanCookies = validator(request.cookies, {
      sessionToken: "required",
    });
    request.cookies.sessionToken = cleanCookies.sessionToken;

    await injectAuthenticatedPerson(request, response);
  } else {
    throw new UnauthorizedError({
      message: `Usuário não possui sessão ativa.`,
      errorLocationCode: "MODEL:AUTHENTICATION:INJECT_USER:TOKEN_NOT_FOUND",
    });
  }
  return next();

  async function injectAuthenticatedPerson(
    request: InjectedRequest,
    response: NextApiResponse
  ) {
    const sessionObject = await session.findOneValidFromRequest(request);

    const personObject = await person.findOneById(sessionObject.personId);

    const sessionRenewed = await session.renew(sessionObject.id, response);

    request.context = {
      ...request.context,
      person: personObject,
      session: sessionRenewed,
    };
  }
}

async function comparePasswords(
  providedPassword: string,
  passwordHash: string
) {
  const passwordMatches = await password.compare(
    providedPassword,
    passwordHash
  );

  if (!passwordMatches) {
    throw new UnauthorizedError({
      message: `A senha informada não confere com a senha do usuário.`,
      errorLocationCode:
        "MODEL:AUTHENTICATION:COMPARE_PASSWORDS:PASSWORD_MISMATCH",
    });
  }
}

async function createSessionAndSetCookies(
  personId: Person["id"],
  request: NextApiRequest,
  response: NextApiResponse
) {
  const sessionObject = await session.create(personId, request);
  session.setSessionIdCookieInResponse(sessionObject.token, response);
  return sessionObject;
}

export default Object.freeze({
  injectPerson,
  comparePasswords,
  createSessionAndSetCookies,
});
