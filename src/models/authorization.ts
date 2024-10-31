import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";

import { User, Role } from "@prisma/client";

import { ForbiddenError } from "@/errors";
import InjectedRequest from "@/types/InjectedRequest";

function roleIsAdmin(user: Omit<User, "password">) {
  return user.role === Role.ADMIN;
}

function isRequestFromAdmin(
  request: InjectedRequest,
  response: NextApiResponse,
  next: NextHandler
) {
  const userTryingToRequest = request.context.user;

  if (!roleIsAdmin(userTryingToRequest)) {
    throw new ForbiddenError({
      message: `Usuário não pode executar esta operação.`,
      errorLocationCode: "MODEL:AUTHORIZATION:CAN_REQUEST:FEATURE_NOT_FOUND",
    });
  }

  return next();
}

export default Object.freeze({
  roleIsAdmin,
  isRequestFromAdmin,
});
