import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";

import { User } from "@prisma/client";
import cookie from "cookie";
import crypto from "crypto";
import { ServerResponse } from "http";
import { UAParser } from "ua-parser-js";

import { NotFoundError, UnauthorizedError } from "@/errors";
import { prisma } from "@/infra/prisma";
import InjectedRequest from "@/types/InjectedRequest";

import validator from "./validator";

const tokenRenewalThreshold = 1000 * 60 * 60 * 24 * 30; // 30 days

function clearSessionIdCookie(response: NextApiResponse | ServerResponse) {
  response.setHeader("Set-Cookie", [
    cookie.serialize("sessionToken", "invalid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: -1,
    }),
  ]);
}

async function findOneValidFromRequest(request: NextApiRequest) {
  validator(request.cookies, {
    sessionToken: "required",
  });

  const sessionToken = request.cookies?.sessionToken;

  if (!sessionToken) {
    throw new UnauthorizedError({
      message: `Usuário não possui sessão ativa.`,
      errorLocationCode:
        "MODEL:SESSION:FIND_ONE_VALID_FROM_REQUEST:TOKEN_NOT_FOUND",
    });
  }

  const sessionObject = await findOneValidByToken(sessionToken);

  if (!sessionObject) {
    throw new UnauthorizedError({
      message: `Usuário não possui sessão ativa.`,
      errorLocationCode:
        "MODEL:SESSION:FIND_ONE_VALID_FROM_REQUEST:SESSION_NOT_FOUND",
    });
  }

  return sessionObject;
}

async function findOneValidByToken(sessionToken: string) {
  validator(
    { sessionToken },
    {
      sessionToken: "required",
    }
  );

  const session = await prisma.session.findFirst({
    where: {
      token: sessionToken,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  return session;
}

async function renewSessionIfNecessary(
  request: InjectedRequest,
  response: NextApiResponse,
  next: NextHandler
) {
  let sessionObject = request.context.session;

  // Renew session if it expires in less than 1/10 (3 days) the threshold.
  if (
    new Date(sessionObject.expiresAt).getTime() <
    Date.now() + tokenRenewalThreshold / 10
  ) {
    sessionObject = await renew(sessionObject.id, response);

    request.context.session = sessionObject;
  }

  return next();
}

async function renew(sessionId: string, response: NextApiResponse) {
  const sessionObjectRenewed = await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      expiresAt: new Date(Date.now() + tokenRenewalThreshold),
    },
  });

  setSessionIdCookieInResponse(sessionObjectRenewed.token, response);

  return sessionObjectRenewed;
}

function setSessionIdCookieInResponse(
  sessionToken: string,
  response: NextApiResponse
) {
  response.setHeader("Set-Cookie", [
    cookie.serialize("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: tokenRenewalThreshold / 1000, // must divide by 1000 because maxAge is in seconds
    }),
  ]);
}

async function create(userId: User["id"], request: NextApiRequest) {
  const sessionToken = crypto.randomBytes(48).toString("hex");

  const { browser, cpu, device, os } = UAParser(request.headers["user-agent"]);

  const session = await prisma.session.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      token: sessionToken,
      browser: browser.name,
      cpu: cpu.architecture,
      deviceModel: device.model,
      deviceType: device.type,
      deviceVendor: device.vendor,
      osName: os.name,
      osVersion: os.version,
      expiresAt: new Date(Date.now() + tokenRenewalThreshold),
    },
  });

  return session;
}

async function expireById(sessionId: string) {
  let sessionObject = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  });

  if (!sessionObject) {
    throw new NotFoundError({
      message: `Sessão não encontrada.`,
      errorLocationCode: "MODEL:SESSION:EXPIRE_BY_ID:SESSION_NOT_FOUND",
    });
  }

  const { createdAt } = sessionObject;
  const newExpiryDate = createdAt;
  newExpiryDate.setDate(newExpiryDate.getDate() - 1);

  sessionObject = await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      expiresAt: newExpiryDate,
    },
  });

  return sessionObject;
}

async function isSessionValid(sessionToken?: string) {
  if (!sessionToken) {
    return false;
  }

  const session = await prisma.session.findFirst({
    where: {
      token: sessionToken,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          features: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!session) {
    return false;
  }

  return session;
}

async function findAllByUserId(userId: User["id"]) {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
    },
    select: {
      browser: true,
      cpu: true,
      deviceModel: true,
      deviceType: true,
      deviceVendor: true,
      osName: true,
      osVersion: true,
      createdAt: true,
      updatedAt: true,
      id: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return sessions;
}

export default Object.freeze({
  clearSessionIdCookie,
  findOneValidFromRequest,
  findOneValidByToken,
  renewSessionIfNecessary,
  renew,
  setSessionIdCookieInResponse,
  create,
  expireById,
  isSessionValid,
  findAllByUserId,
});
