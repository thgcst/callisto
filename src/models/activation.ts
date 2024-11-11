import { ActivateAccountToken, User } from "@prisma/client";

import { ForbiddenError, NotFoundError, ServiceError } from "@/errors";
import email from "@/infra/email";
import { prisma } from "@/infra/prisma";
import webserver from "@/infra/webserver";

async function createAndSendActivationEmail(user: User) {
  const token = await prisma.activateAccountToken.findFirst({
    where: {
      userId: user.id,
      used: false,
      expiresAt: {
        gte: new Date(),
      },
    },
  });

  if (token) {
    throw new ForbiddenError({
      message: `Usuário não foi ativado. Enviamos um e-mail para ativação e cadastro de senha, confira seu Spam.`,
      errorLocationCode: `MODELS:ACTIVATION:CREATE_AND_SEND_ACTIVATION_EMAIL:TOKEN_VALID_EXISTS`,
    });
  }

  const tokenObject = await create(user);
  await sendEmailToUser(user, tokenObject.id);
}

async function create(user: User) {
  const activation = await prisma.activateAccountToken.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
    },
  });

  return activation;
}

async function sendEmailToUser(
  user: User,
  tokenId: ActivateAccountToken["id"],
) {
  const activationPageEndpoint = getActivationPageEndpoint(tokenId);

  try {
    await email.send({
      from: {
        name: "Callisto",
        address: "nao_responda@trial-yzkq3405pq6gd796.mlsender.net",
      },
      to: user.email,
      subject: "Cadastre sua senha no Callisto",
      text: `Clique no link abaixo para cadastrar sua senha no Callisto:
      
${activationPageEndpoint}

Caso você não tenha feito esta requisição, ignore esse email.

Atenciosamente,
Equipe de TI do Callisto`,
    });
  } catch (error) {
    await markTokenAsUsed(tokenId);
    throw error;
  }
}

function getActivationPageEndpoint(tokenId: ActivateAccountToken["id"]) {
  const webserverHost = webserver.getHost();
  return `${webserverHost}/ativar/${tokenId}`;
}

async function findOneValidTokenById(tokenId: string) {
  const token = await prisma.activateAccountToken.findFirst({
    where: {
      id: tokenId,
      expiresAt: {
        gte: new Date(),
      },
    },
  });

  if (!token) {
    throw new NotFoundError({
      message: `O token de ativação utilizado não foi encontrado no sistema ou expirou.`,
      errorLocationCode:
        "MODELS:ACTIVATION:ACTIVATE_USER_WITH_TOKEN_ID:TOKEN_NOT_FOUND",
    });
  }

  return token;
}

async function findOneValidTokenByUserId(userId: string) {
  const token = await prisma.activateAccountToken.findFirst({
    where: {
      userId,
      expiresAt: {
        gte: new Date(),
      },
    },
  });

  if (!token) {
    throw new NotFoundError({
      message: `O token de ativação utilizado não foi encontrado no sistema ou expirou.`,
      errorLocationCode:
        "MODELS:ACTIVATION:ACTIVATE_USER_WITH_TOKEN_ID:TOKEN_NOT_FOUND",
    });
  }

  return token;
}

async function markTokenAsUsed(tokenId: string) {
  let tokenObject = await findOneValidTokenById(tokenId);
  if (tokenObject.used) {
    throw new ServiceError({
      message: `O token de ativação já foi utilizado.`,
      errorLocationCode:
        "MODELS:ACTIVATION:MARK_TOKEN_AS_USED:TOKEN_ALREADY_USED",
    });
  }

  tokenObject = await prisma.activateAccountToken.update({
    where: {
      id: tokenId,
    },
    data: {
      used: true,
    },
  });

  return tokenObject;
}

async function findValidUnusedTokenById(tokenId: string) {
  const tokenObject = await prisma.activateAccountToken.findUnique({
    where: {
      id: tokenId,
    },
  });

  if (!tokenObject) {
    throw new NotFoundError({
      message: `O token de ativação não foi encontrado no sistema.`,
      errorLocationCode:
        "MODELS:ACTIVATION:FIND_VALID_UNUSED_TOKEN_BY_ID:TOKEN_NOT_FOUND",
    });
  }

  if (tokenObject.used) {
    throw new NotFoundError({
      message: `O token de ativação já foi utilizado.`,
      errorLocationCode:
        "MODELS:ACTIVATION:FIND_VALID_UNUSED_TOKEN_BY_ID:TOKEN_MARKED_AS_USED",
    });
  }

  if (tokenObject.expiresAt < new Date()) {
    throw new NotFoundError({
      message: `O token de ativação expirou.`,
      errorLocationCode:
        "MODELS:ACTIVATION:FIND_VALID_UNUSED_TOKEN_BY_ID:TOKEN_EXPIRED",
    });
  }

  return tokenObject;
}

export default Object.freeze({
  create,
  createAndSendActivationEmail,
  getActivationPageEndpoint,
  markTokenAsUsed,
  findOneValidTokenByUserId,
  findValidUnusedTokenById,
});
