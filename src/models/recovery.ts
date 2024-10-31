import { Prisma, RecoverPasswordToken } from "@prisma/client";

import { ForbiddenError, NotFoundError, ServiceError } from "@/errors";
import email from "@/infra/email";
import { prisma } from "@/infra/prisma";
import webserver from "@/infra/webserver";

async function create(email: string) {
  const token = await prisma.recoverPasswordToken.findFirst({
    where: {
      user: {
        email,
      },
      used: false,
      expiresAt: {
        gte: new Date(),
      },
    },
  });

  if (token) {
    throw new ForbiddenError({
      message: `Enviamos recentemente um e-mail para alteração de senha, confira seu Spam.`,
      errorLocationCode: `MODELS:RECOVERY:CREATE_AND_SEND_RECOVERY_EMAIL:TOKEN_VALID_EXISTS`,
    });
  }

  try {
    const recoverPasswordToken = await prisma.recoverPasswordToken.create({
      data: {
        user: {
          connect: {
            email,
          },
        },
        expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
      },
    });
    return recoverPasswordToken;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ForbiddenError({
        message: `Não encontramos um usuário com o e-mail "${email}".`,
        errorLocationCode: `MODELS:RECOVERY:CREATE:USER_NOT_FOUND`,
      });
    }

    throw new ServiceError({
      message: `Erro ao criar token de recuperação de senha.`,
      errorLocationCode: `MODELS:RECOVERY:CREATE:UNKNOWN_ERROR`,
    });
  }
}

async function createAndSendRecoveryEmail(email: string) {
  const tokenObject = await create(email);
  await sendEmailToUser(email, tokenObject.id);

  return tokenObject;
}

async function sendEmailToUser(
  userEmail: string,
  tokenId: RecoverPasswordToken["id"]
) {
  const recoverPageEndpoint = getRecoveryPageEndpoint(tokenId);

  try {
    await email.send({
      from: {
        name: "Callisto",
        address: "nao_responda@trial-yzkq3405pq6gd796.mlsender.net",
      },
      to: userEmail,
      subject: "Altere sua senha no Callisto",
      text: `Clique no link abaixo para alterar sua senha no Callisto:
      
      ${recoverPageEndpoint}
      
      Caso você não tenha feito esta requisição, ignore esse email.
      
      Atenciosamente,
      Equipe de TI do Callisto`,
    });
  } catch (error) {
    await markTokenAsUsed(tokenId);
    throw error;
  }
}

function getRecoveryPageEndpoint(tokenId: RecoverPasswordToken["id"]) {
  const webserverHost = webserver.getHost();
  return `${webserverHost}/recuperar/${tokenId}`;
}

async function findOneValidTokenById(tokenId: string) {
  const token = await prisma.recoverPasswordToken.findFirst({
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
        "MODELS:RECOVERY:FIND_ONE_VALID_TOKEN_BY_ID:TOKEN_NOT_FOUND",
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
        "MODELS:RECOVERY:MARK_TOKEN_AS_USED:TOKEN_ALREADY_USED",
    });
  }

  tokenObject = await prisma.recoverPasswordToken.update({
    where: {
      id: tokenId,
    },
    data: {
      used: true,
    },
  });

  return tokenObject;
}

async function findOneValidTokenByUserId(userId: string) {
  const token = await prisma.recoverPasswordToken.findFirst({
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
        "MODELS:RECOVERY:FIND_ONE_VALID_TOKEN_BY_USER_ID:TOKEN_NOT_FOUND",
    });
  }

  return token;
}

async function findValidUnusedTokenById(tokenId: string) {
  const tokenObject = await prisma.recoverPasswordToken.findUnique({
    where: {
      id: tokenId,
    },
  });

  if (!tokenObject) {
    throw new NotFoundError({
      message: `O token de ativação não foi encontrado no sistema.`,
      errorLocationCode:
        "MODELS:RECOVERY:FIND_VALID_UNUSED_TOKEN_BY_ID:TOKEN_NOT_FOUND",
    });
  }

  if (tokenObject.used) {
    throw new NotFoundError({
      message: `O token de ativação já foi utilizado.`,
      errorLocationCode:
        "MODELS:RECOVERY:FIND_VALID_UNUSED_TOKEN_BY_ID:TOKEN_MARKED_AS_USED",
    });
  }

  if (tokenObject.expiresAt < new Date()) {
    throw new NotFoundError({
      message: `O token de ativação expirou.`,
      errorLocationCode:
        "MODELS:RECOVERY:FIND_VALID_UNUSED_TOKEN_BY_ID:TOKEN_EXPIRED",
    });
  }

  return tokenObject;
}

export default Object.freeze({
  create,
  createAndSendRecoveryEmail,
  getRecoveryPageEndpoint,
  findOneValidTokenById,
  markTokenAsUsed,
  findOneValidTokenByUserId,
  findValidUnusedTokenById,
});
