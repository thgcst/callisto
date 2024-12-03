import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import formidable from "formidable";

import { ServiceError } from "@/errors";
import authentication from "@/models/authentication";
import controller from "@/models/controller";
import supabaseModel from "@/models/supabase";
import user from "@/models/user";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";
import parseRequest from "@/utils/parseRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(authentication.injectUser)
  .patch(patchHandler);

async function patchHandler(
  request: InjectedRequest,
  response: NextApiResponse,
) {
  const { files, fields } = await parseRequest(request);

  const body: {
    name?: string;
  } = validator(fields, {
    name: "optional",
  });

  let updatedUser = await user.updateById(request.context.user.id, body);

  const avatar = files.avatar as formidable.File;

  try {
    if (avatar) {
      const avatarUrl = await supabaseModel.uploadAvatar(avatar, "users");

      updatedUser = await user.updateById(updatedUser.id, {
        avatar: avatarUrl,
      });
    }
  } catch (error) {
    console.log(error);
    throw new ServiceError({
      message: "Erro ao atualizar foto de perfil",
      errorLocationCode: "CONTROLLER:USER:UPDATE:UPDATE_AVATAR",
    });
  }

  return response.status(201).json({ ...updatedUser, password: undefined });
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
