import formidable from "formidable";

import { UnprocessableEntityError } from "@/errors";
import InjectedRequest from "@/types/InjectedRequest";

const parse = (request: InjectedRequest) => {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.parse(request, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    },
  );
};

const parseRequest = async (request: InjectedRequest) => {
  try {
    return await parse(request);
  } catch {
    throw new UnprocessableEntityError({
      message: "Erro ao processar o formulário",
      errorLocationCode: "PARSE_REQUEST:FORMIDABLE",
    });
  }
};

export default parseRequest;
