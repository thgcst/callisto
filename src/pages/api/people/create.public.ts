import { NextApiResponse } from "next";
import nextConnect from "next-connect";

import { Role } from "@prisma/client";
import formidable from "formidable";

import activation from "@/models/activation";
import authentication from "@/models/authentication";
import authorization from "@/models/authorization";
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
  .post(authorization.isRequestFromAdmin(), postHandler);

async function postHandler(
  request: InjectedRequest,
  response: NextApiResponse
) {
  const { files, fields } = await parseRequest(request);

  const body: {
    name: string;
    email: string;
    role: Role;
    avatar?: string;
  } = validator(
    {
      ...fields,
    },
    {
      name: "required",
      email: "required",
      role: "required",
    }
  );

  let newPerson = await person.create(body);

  await activation.createAndSendActivationEmail(newPerson);

  const avatar = files.avatar?.[0] as formidable.File;

  // when creating an person, avatar uploading errors are not critical
  try {
    if (avatar) {
      const avatarUrl = await supabaseModel.uploadAvatar(avatar, "people");

      newPerson = await person.updateById(newPerson.id, {
        avatar: avatarUrl,
      });
    }
  } catch (error) {
    console.error("Error uploading avatar to supabase", error);
  }

  return response.status(201).json({ ...newPerson, password: undefined });
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
