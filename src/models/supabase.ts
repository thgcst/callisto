import { randomUUID } from "crypto";
import formidable from "formidable";
import fs from "fs";

import { ServiceError } from "@/errors";
import { supabase } from "@/infra/supabase";

async function uploadAvatar(avatar: formidable.File, folder: string) {
  const { data: uploadData } = await supabase.storage
    .from("avatars")
    .upload(`${folder}/${randomUUID()}`, fs.createReadStream(avatar.filepath), {
      duplex: "half",
    });

  if (uploadData) {
    const path = uploadData.path;

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);

    return data.publicUrl;
  }

  throw new ServiceError({
    message: "Erro ao atualizar o avatar",
    errorLocationCode: "MODELS:SUPABASE:UPDATE_AVATAR",
  });
}

export default Object.freeze({
  uploadAvatar,
});
