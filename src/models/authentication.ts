import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";

import { User } from "@prisma/client";

import { UnauthorizedError } from "@/errors";
import InjectedRequest from "@/types/InjectedRequest";

import password from "./password";
import session from "./session";
import user from "./user";
import validator from "./validator";

async function injectUser(
  request: InjectedRequest,
  response: NextApiResponse,
  next: NextHandler
) {
  if (request.cookies?.sessionToken) {
    const cleanCookies = validator(request.cookies, {
      sessionToken: "required",
    });
    request.cookies.sessionToken = cleanCookies.sessionToken;

    await injectAuthenticatedUser(request);
  } else {
    throw new UnauthorizedError({
      message: `Usuário não possui sessão ativa.`,
      errorLocationCode: "MODEL:AUTHENTICATION:INJECT_USER:TOKEN_NOT_FOUND",
    });
  }
  return next();

  async function injectAuthenticatedUser(request: InjectedRequest) {
    const sessionObject = await session.findOneValidFromRequest(request);
    const userObject = await user.findOneById(sessionObject.userId);

    request.context = {
      ...request.context,
      user: userObject,
      session: sessionObject,
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
  userId: User["id"],
  request: NextApiRequest,
  response: NextApiResponse
) {
  const sessionObject = await session.create(userId, request);
  session.setSessionIdCookieInResponse(sessionObject.token, response);
  return sessionObject;
}

export default Object.freeze({
  injectUser,
  comparePasswords,
  createSessionAndSetCookies,
});
