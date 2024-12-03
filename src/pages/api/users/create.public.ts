import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import formidable from "formidable";

import activation from "@/models/activation";
import authentication from "@/models/authentication";
import authorization from "@/models/authorization";
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
  .post(authorization.canRequest("create:user"), postHandler);

async function postHandler(
  request: InjectedRequest,
  response: NextApiResponse,
) {
  const { files, fields } = await parseRequest(request);

  const body: {
    name: string;
    email: string;
    features: string[];
  } = validator(
    {
      ...fields,
      features: fields?.features
        ? JSON.parse(fields.features as string)
        : undefined,
    },
    {
      name: "required",
      email: "required",
      features: "required",
    },
  );

  let newUser = await user.create(body);

  await activation.createAndSendActivationEmail(newUser);

  const avatar = files.avatar as formidable.File;

  // when creating an user, avatar uploading errors are not critical
  try {
    if (avatar) {
      const avatarUrl = await supabaseModel.uploadAvatar(avatar, "users");

      newUser = await user.updateById(newUser.id, {
        avatar: avatarUrl,
      });
    }
  } catch (error) {
    console.error("Error uploading avatar to supabase", error);
  }

  return response.status(201).json({ ...newUser, password: undefined });
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
