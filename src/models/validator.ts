import { Role } from "@prisma/client";
import Joi from "joi";

import { ValidationError } from "@/errors";

type ValidatorSchemas = keyof typeof schemas;

export default function validator(
  object: object,
  keys: { [key in ValidatorSchemas]?: "required" | "optional" },
  canBeEmpty = true
) {
  // Force the clean up of "undefined" values since JSON
  // doesn't support them and Joi doesn't clean
  // them up. Also handles the case where the
  // "object" is not a valid JSON.
  try {
    object = JSON.parse(JSON.stringify(object));
  } catch (error) {
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
  defaultSort?: string
) {
  try {
    object = JSON.parse(JSON.stringify(object));
  } catch (error) {
    throw new ValidationError({
      message: "Não foi possível interpretar o valor enviado.",
      errorLocationCode: "MODEL:SORT_VALIDATOR:ERROR_PARSING_JSON",
    });
  }

  const finalSchema = Joi.object({
    sort: Joi.string()
      .valid(...options)
      .default(
        defaultSort && options.includes(defaultSort) ? defaultSort : options[0]
      )
      .messages({
        "any.only": `"sort" deve ser um dos seguintes valores: ${options.join(
          ", "
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

  role: function () {
    return Joi.object({
      features: Joi.string()
        .valid(...Object.values(Role))
        .when("$required.role", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "any.required": `"role" é um campo obrigatório.`,
          "string.empty": `"role" não pode estar em branco.`,
          "string.base": `"role" deve ser do tipo String.`,
          "any.only": `"role" deve ser um dos seguintes valores: ${Object.values(
            Role
          ).join(", ")}.`,
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
};
