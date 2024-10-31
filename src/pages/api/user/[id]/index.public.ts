import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import { Role } from "@prisma/client";

import { ForbiddenError } from "@/errors";
import authentication from "@/models/authentication";
import authorization from "@/models/authorization";
import controller from "@/models/controller";
import user from "@/models/user";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(authentication.injectUser)
  .patch(patchHandler);

async function patchHandler(
  request: InjectedRequest,
  response: NextApiResponse
) {
  const { id } = validator(request.query, {
    id: "required",
  });

  if (
    !authorization.roleIsAdmin(request.context.user) &&
    request.context.user.id !== id
  ) {
    throw new ForbiddenError({
      message: `Usuário não pode executar esta operação.`,
      errorLocationCode: "MODEL:AUTHORIZATION:CAN_REQUEST:FEATURE_NOT_FOUND",
    });
  }

  const body: Partial<{
    name: string;
    motherName: string;
    cpf: string;
    birthday: string;
    phoneNumber: string;
    role: Role;
  }> = validator(request.body, {
    name: "optional",
    motherName: "optional",
    cpf: "optional",
    birthday: "optional",
    phoneNumber: "optional",
    role: "optional",
  });

  const updatedUser = await user.updateById(id, body);

  return response.status(201).json({ ...updatedUser, password: undefined });
}
