import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";

import { User } from "@prisma/client";

import { ForbiddenError } from "@/errors";
import InjectedRequest from "@/types/InjectedRequest";

const systemFeaturesSet = new Set(["create:user", "edit:user", "read:users"]);

function can(user: Omit<User, "password">, feature: string) {
  if (user.features.includes(feature)) {
    return true;
  }

  return false;
}

function canRequest(feature: string) {
  return function (
    request: InjectedRequest,
    response: NextApiResponse,
    next: NextHandler
  ) {
    const userTryingToRequest = request.context.user;

    if (!can(userTryingToRequest, feature)) {
      throw new ForbiddenError({
        message: `Usuário não pode executar esta operação.`,
        errorLocationCode: "MODEL:AUTHORIZATION:CAN_REQUEST:FEATURE_NOT_FOUND",
      });
    }

    next();
  };
}

export default Object.freeze({
  systemFeaturesSet,
  can,
  canRequest,
});
