import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import formidable from "formidable";

import authentication from "@/models/authentication";
import controller from "@/models/controller";
import person from "@/models/person";
import supabaseModel from "@/models/supabase";
import validator from "@/models/validator";
import InjectedRequest from "@/types/InjectedRequest";
import parseRequest from "@/utils/parseRequest";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(authentication.injectPerson)
  .patch(patchHandler);

async function patchHandler(
  request: InjectedRequest,
  response: NextApiResponse
) {
  const { files, fields } = await parseRequest(request);

  const body: {
    name?: string;
    avatar?: string;
  } = validator(fields, {
    name: "optional",
  });

  let updatedPerson = await person.updateById(request.context.person.id, body);

  const avatar = files.avatar?.[0] as formidable.File;

  if (avatar) {
    const avatarUrl = await supabaseModel.uploadAvatar(avatar, "people");

    updatedPerson = await person.updateById(updatedPerson.id, {
      avatar: avatarUrl,
    });
  }

  return response.status(201).json({ ...updatedPerson, password: undefined });
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
