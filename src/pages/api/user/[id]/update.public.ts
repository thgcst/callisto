import { NextApiResponse } from "next";
import nextConnect from "next-connect";

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
  response: NextApiResponse
) {
  const { files, fields } = await parseRequest(request);

  const { id } = validator(request.query, {
    id: "required",
  });

  const body: {
    name?: string;
    features?: string[];
    avatar?: string;
  } = validator(fields, {
    name: "optional",
    features: "optional",
  });

  let updatedUser = await user.updateById(id, body);

  const avatar = files.avatar?.[0];

  if (avatar) {
    const avatarUrl = await supabaseModel.uploadAvatar(avatar, "users");

    updatedUser = await user.updateById(updatedUser.id, {
      avatar: avatarUrl,
    });
  }

  return response.status(201).json({ ...updatedUser, password: undefined });
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
