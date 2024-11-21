import Joi from "joi";

import { ValidationError } from "@/errors";
import { isValidCnpj } from "@/utils/cnpj";
import { isValidCpf } from "@/utils/cpf";

type ValidatorSchemas = keyof typeof schemas;

export default function validator(
  object: object,
  keys: { [key in ValidatorSchemas]?: "required" | "optional" },
  canBeEmpty = true,
) {
  // Force the clean up of "undefined" values since JSON
  // doesn't support them and Joi doesn't clean
  // them up. Also handles the case where the
  // "object" is not a valid JSON.
  try {
    object = JSON.parse(JSON.stringify(object));
  } catch {
    throw new ValidationError({
      message: "Não foi possível interpretar o valor enviado.",
      errorLocationCode: "MODEL:VALIDATOR:ERROR_PARSING_JSON",
    });
  }

  let finalSchema = Joi.object();

  if (!canBeEmpty) {
    finalSchema = Joi.object().required().min(1).messages({
      "object.base": `Body enviado deve ser do tipo Object.`,
      "object.min": `Objeto enviado deve ter no mínimo uma chave.`,
    });
  }

  for (const key of Object.keys(keys) as ValidatorSchemas[]) {
    const keyValidationFunction = schemas[key];
    finalSchema = finalSchema.concat(keyValidationFunction());
  }

  const { error, value } = finalSchema.validate(object, {
    stripUnknown: true,
    context: {
      required: keys,
    },
  });

  if (error) {
    throw new ValidationError({
      message: error.details[0].message,
      errorLocationCode: "MODEL:VALIDATOR:FINAL_SCHEMA",
    });
  }

  return value;
}

export function sortValidator(
  object: object,
  options: string[],
  defaultSort?: string,
) {
  try {
    object = JSON.parse(JSON.stringify(object));
  } catch {
    throw new ValidationError({
      message: "Não foi possível interpretar o valor enviado.",
      errorLocationCode: "MODEL:SORT_VALIDATOR:ERROR_PARSING_JSON",
    });
  }

  const finalSchema = Joi.object({
    sort: Joi.string()
      .valid(...options)
      .default(
        defaultSort && options.includes(defaultSort) ? defaultSort : options[0],
      )
      .messages({
        "any.only": `"sort" deve ser um dos seguintes valores: ${options.join(
          ", ",
        )}.`,
      }),
    order: Joi.string().valid("asc", "desc").default("asc").messages({
      "any.only": `"order" deve ser um dos seguintes valores: "asc" ou "desc".`,
    }),
  });

  const { error, value } = finalSchema.validate(object, {
    stripUnknown: true,
  });

  if (error) {
    throw new ValidationError({
      message: error.details[0].message,
      errorLocationCode: "MODEL:SORT_VALIDATOR:FINAL_SCHEMA",
    });
  }

  return value;
}

const schemas = {
  id: function () {
    return Joi.object({
      id: Joi.string()
        .allow(null)
        .trim()
        .guid({ version: "uuidv4" })
        .when("$required.id", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"id" é um campo obrigatório.`,
          "string.empty": `"id" não pode estar em branco.`,
          "string.base": `"id" deve ser do tipo String.`,
          "string.guid": `"id" deve possuir um token UUID na versão 4.`,
        }),
    });
  },

  ids: function () {
    return Joi.object({
      ids: Joi.array()
        .items(Joi.string().guid({ version: "uuidv4" }))
        .when("$required.ids", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"ids" é um campo obrigatório.`,
          "string.empty": `"ids" não pode estar em branco.`,
          "array.base": `"ids" deve ser do tipo Array.`,
          "array.min": `"ids" deve conter no mínimo {#limit} itens.`,
          "string.guid": `"ids" deve possuir um token UUID na versão 4.`,
        }),
    });
  },

  email: function () {
    return Joi.object({
      email: Joi.string()
        .email()
        .min(7)
        .max(254)
        .lowercase()
        .trim()
        .invalid(null)
        .when("$required.email", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"email" é um campo obrigatório.`,
          "string.empty": `"email" não pode estar em branco.`,
          "string.base": `"email" deve ser do tipo String.`,
          "string.email": `"email" deve conter um email válido.`,
          "any.invalid": `"email" possui o valor inválido "null".`,
        }),
    });
  },

  password: function () {
    return Joi.object({
      // Why 72 in max length? https://security.stackexchange.com/a/39851
      password: Joi.string()
        .min(8)
        .max(72)
        .trim()
        .invalid(null)
        .when("$required.password", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"password" é um campo obrigatório.`,
          "string.empty": `"password" não pode estar em branco.`,
          "string.base": `"password" deve ser do tipo String.`,
          "string.min": `"password" deve conter no mínimo {#limit} caracteres.`,
          "string.max": `"password" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"password" possui o valor inválido "null".`,
        }),
    });
  },

  tokenId: function () {
    return Joi.object({
      tokenId: Joi.string()
        .trim()
        .guid({ version: "uuidv4" })
        .when("$required.tokenId", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"tokenId" é um campo obrigatório.`,
          "string.empty": `"tokenId" não pode estar em branco.`,
          "string.base": `"tokenId" deve ser do tipo String.`,
          "string.guid": `"tokenId" deve possuir um token UUID na versão 4.`,
        }),
    });
  },

  sessionToken: function () {
    return Joi.object({
      sessionToken: Joi.string()
        .length(96)
        .alphanum()
        .when("$required.sessionToken", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"sessionToken" é um campo obrigatório.`,
          "string.empty": `"sessionToken" não pode estar em branco.`,
          "string.base": `"sessionToken" deve ser do tipo String.`,
          "string.length": `"sessionToken" deve possuir {#limit} caracteres.`,
          "string.alphanum": `"sessionToken" deve conter apenas caracteres alfanuméricos.`,
        }),
    });
  },

  expires_at: function () {
    return Joi.object({
      expires_at: Joi.date()
        .allow(null)
        .when("$required.expires_at", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"expires_at" é um campo obrigatório.`,
          "string.empty": `"expires_at" não pode estar em branco.`,
          "string.base": `"expires_at" deve ser do tipo Date.`,
        }),
    });
  },

  name: function () {
    return Joi.object({
      name: Joi.string()
        .min(5)
        .max(50)
        .trim()
        .invalid(null)
        .when("$required.name", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"name" é um campo obrigatório.`,
          "string.empty": `"name" não pode estar em branco.`,
          "string.base": `"name" deve ser do tipo String.`,
          "string.min": `"name" deve conter no mínimo {#limit} caracteres.`,
          "string.max": `"name" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"name" possui o valor inválido "null".`,
        }),
    });
  },

  features: function () {
    return Joi.object({
      features: Joi.array()
        .items(Joi.string())
        .when("$required.features", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"features" é um campo obrigatório.`,
          "string.empty": `"features" não pode estar em branco.`,
          "array.base": `"features" deve ser do tipo Array.`,
          "array.min": `"features" deve conter no mínimo {#limit} itens.`,
          "any.only": `"features" deve conter um dos seguintes valores: {#valids}.`,
        }),
    });
  },

  used: function () {
    return Joi.object({
      used: Joi.boolean()
        .allow(false)
        .when("$required.used", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"used" é um campo obrigatório.`,
          "string.empty": `"used" não pode estar em branco.`,
          "boolean.base": `"used" deve ser do tipo Boolean.`,
        }),
    });
  },

  day: function () {
    return Joi.object({
      day: Joi.date()
        .when("$required.day", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"day" é um campo obrigatório.`,
          "string.empty": `"day" não pode estar em branco.`,
          "string.base": `"day" deve ser do tipo Date.`,
        }),
    });
  },

  startDate: function () {
    return Joi.object({
      startDate: Joi.date()
        .when("$required.startDate", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"startDate" é um campo obrigatório.`,
          "string.empty": `"startDate" não pode estar em branco.`,
          "string.base": `"startDate" deve ser do tipo Date.`,
        }),
    });
  },

  endDate: function () {
    return Joi.object({
      endDate: Joi.date()
        .when("$required.endDate", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"endDate" é um campo obrigatório.`,
          "string.empty": `"endDate" não pode estar em branco.`,
          "string.base": `"endDate" deve ser do tipo Date.`,
        }),
    });
  },

  birthday: function () {
    return Joi.object({
      birthday: Joi.date()
        .when("$required.birthday", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"birthday" é um campo obrigatório.`,
          "string.empty": `"birthday" não pode estar em branco.`,
          "string.base": `"birthday" deve ser do tipo Date.`,
        }),
    });
  },

  motherName: function () {
    return Joi.object({
      motherName: Joi.string()
        .allow("")
        .empty("")
        .min(5)
        .max(50)
        .trim()
        .when("$required.motherName", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"motherName" é um campo obrigatório.`,
          "string.empty": `"motherName" não pode estar em branco.`,
          "string.base": `"motherName" deve ser do tipo String.`,
          "string.min": `"motherName" deve conter no mínimo {#limit} caracteres.`,
          "string.max": `"motherName" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"motherName" possui o valor inválido "null".`,
        }),
    });
  },

  cpf: function () {
    return Joi.object({
      cpf: Joi.string()
        .replace(/\D/g, "")
        .trim()
        .length(11)
        .invalid(null)
        .custom((value, helpers) => {
          if (!isValidCpf(value)) {
            return helpers.error("string.invalidCPF");
          }
          return value;
        })
        .when("$required.cpf", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"cpf" é um campo obrigatório.`,
          "string.empty": `"cpf" não pode estar em branco.`,
          "string.base": `"cpf" deve ser do tipo String.`,
          "string.length": `"cpf" deve conter {#limit} caracteres.`,
          "any.invalid": `"cpf" possui o valor inválido "null".`,
          "string.invalidCPF": `"cpf" inválido.`,
        }),
    });
  },

  cnpj: function () {
    return Joi.object({
      cnpj: Joi.string()
        .replace(/\D/g, "")
        .trim()
        .length(14)
        .invalid(null)
        .custom((value, helpers) => {
          if (!isValidCnpj(value)) {
            return helpers.error("string.invalidCNPJ");
          }
          return value;
        })
        .when("$required.cnpj", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"cnpj" é um campo obrigatório.`,
          "string.empty": `"cnpj" não pode estar em branco.`,
          "string.base": `"cnpj" deve ser do tipo String.`,
          "string.length": `"cnpj" deve conter {#limit} caracteres.`,
          "any.invalid": `"cnpj" possui o valor inválido "null".`,
          "string.invalidCNPJ": `"cnpj" inválido.`,
        }),
    });
  },

  formalized: function () {
    return Joi.object({
      formalized: Joi.boolean()
        .when("$required.formalized", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"formalized" é um campo obrigatório.`,
          "string.empty": `"formalized" não pode estar em branco.`,
          "boolean.base": `"formalized" deve ser do tipo Boolean.`,
        }),
    });
  },

  fantasyName: function () {
    return Joi.object({
      fantasyName: Joi.string()
        .allow("")
        .empty("")
        .min(5)
        .max(50)
        .trim()
        .when("$required.fantasyName", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"fantasyName" é um campo obrigatório.`,
          "string.empty": `"fantasyName" não pode estar em branco.`,
          "string.base": `"fantasyName" deve ser do tipo String.`,
          "string.min": `"fantasyName" deve conter no mínimo {#limit} caracteres.`,
          "string.max": `"fantasyName" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"fantasyName" possui o valor inválido "null".`,
        }),
    });
  },

  phoneNumber: function () {
    return Joi.object({
      phoneNumber: Joi.string()
        .allow("")
        .empty("")
        .replace(/\D/g, "")
        .trim()
        .when("$required.phoneNumber", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"phoneNumber" é um campo obrigatório.`,
          "string.empty": `"phoneNumber" não pode estar em branco.`,
          "string.base": `"phoneNumber" deve ser do tipo String.`,
          "any.invalid": `"phoneNumber" possui o valor inválido "null".`,
        }),
    });
  },

  addressId: function () {
    return Joi.object({
      addressId: Joi.string()
        .trim()
        .guid({ version: "uuidv4" })
        .allow(null)
        .when("$required.addressId", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"addressId" é um campo obrigatório.`,
          "string.empty": `"addressId" não pode estar em branco.`,
          "string.base": `"addressId" deve ser do tipo String.`,
          "string.guid": `"addressId" deve possuir um token UUID na versão 4.`,
        }),
    });
  },

  cep: function () {
    return Joi.object({
      cep: Joi.string()
        .replace(/\D/g, "")
        .trim()
        .length(8)
        .invalid(null)
        .when("$required.cep", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"cep" é um campo obrigatório.`,
          "string.empty": `"cep" não pode estar em branco.`,
          "string.base": `"cep" deve ser do tipo String.`,
          "string.length": `"cep" deve conter {#limit} caracteres.`,
          "any.invalid": `"cep" possui o valor inválido "null".`,
        }),
    });
  },

  street: function () {
    return Joi.object({
      street: Joi.string()
        .min(5)
        .max(100)
        .trim()
        .invalid(null)
        .when("$required.street", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"street" é um campo obrigatório.`,
          "string.empty": `"street" não pode estar em branco.`,
          "string.base": `"street" deve ser do tipo String.`,
          "string.min": `"street" deve conter no mínimo {#limit} caracteres.`,
          "string.max": `"street" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"street" possui o valor inválido "null".`,
        }),
    });
  },

  number: function () {
    return Joi.object({
      number: Joi.string()
        .min(1)
        .max(12)
        .trim()
        .invalid(null)
        .when("$required.number", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"number" é um campo obrigatório.`,
          "string.empty": `"number" não pode estar em branco.`,
          "string.base": `"number" deve ser do tipo String.`,
          "string.min": `"number" deve conter no mínimo {#limit} caracteres.`,
          "string.max": `"number" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"number" possui o valor inválido "null".`,
        }),
    });
  },

  complement: function () {
    return Joi.object({
      complement: Joi.string()
        .allow("")
        .trim()
        .max(50)
        .when("$required.complement", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"complement" é um campo obrigatório.`,
          "string.base": `"complement" deve ser do tipo String.`,
          "string.max": `"complement" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"complement" possui o valor inválido "null".`,
        }),
    });
  },

  city: function () {
    return Joi.object({
      city: Joi.string()
        .min(5)
        .max(50)
        .trim()
        .invalid(null)
        .when("$required.city", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"city" é um campo obrigatório.`,
          "string.empty": `"city" não pode estar em branco.`,
          "string.base": `"city" deve ser do tipo String.`,
          "string.min": `"city" deve conter no mínimo {#limit} caracteres.`,
          "string.max": `"city" deve conter no máximo {#limit} caracteres.`,
          "any.invalid": `"city" possui o valor inválido "null".`,
        }),
    });
  },

  state: function () {
    return Joi.object({
      state: Joi.string()
        .length(2)
        .trim()
        .invalid(null)
        .when("$required.state", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"state" é um campo obrigatório.`,
          "string.empty": `"state" não pode estar em branco.`,
          "string.base": `"state" deve ser do tipo String.`,
          "string.length": `"state" deve conter {#limit} caracteres.`,
          "any.invalid": `"state" possui o valor inválido "null".`,
        }),
    });
  },
};
