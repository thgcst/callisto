import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";

import { Person, Role } from "@prisma/client";

import { ForbiddenError } from "@/errors";
import InjectedRequest from "@/types/InjectedRequest";

function roleIsAdmin(person: Omit<Person, "password">) {
  return person.role === Role.ADMIN;
}

function isRequestFromAdmin() {
  return function (
    request: InjectedRequest,
    response: NextApiResponse,
    next: NextHandler
  ) {
    const userTryingToRequest = request.context.person;

    if (!roleIsAdmin(userTryingToRequest)) {
      throw new ForbiddenError({
        message: `Usuário não pode executar esta operação.`,
        errorLocationCode: "MODEL:AUTHORIZATION:CAN_REQUEST:FEATURE_NOT_FOUND",
      });
    }

    next();
  };
}

export default Object.freeze({
  roleIsAdmin,
  isRequestFromAdmin,
});
