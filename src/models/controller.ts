import { NextApiRequest, NextApiResponse } from "next";

import {
  InternalServerError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
  UnauthorizedError,
  TooManyRequestsError,
  UnprocessableEntityError,
  ConflictError,
} from "@/errors";

import session from "./session";

async function onNoMatchHandler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const publicErrorObject = new NotFoundError({
    errorLocationCode: "MODELS:CONTROLLER:ON_NO_MATCH_HANDLER",
  });

  return response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(
  error: any,
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError ||
    error instanceof UnprocessableEntityError ||
    error instanceof TooManyRequestsError ||
    error instanceof ConflictError
  ) {
    const publicErrorObject = {
      ...error,
    };

    return response.status(error.statusCode).json(publicErrorObject);
  }

  if (error instanceof UnauthorizedError) {
    const publicErrorObject = {
      ...error,
    };

    session.clearSessionIdCookie(response);

    return response.status(error.statusCode).json(publicErrorObject);
  }

  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
    errorLocationCode: error.errorLocationCode,
  });

  return response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

export default Object.freeze({
  onNoMatchHandler,
  onErrorHandler,
});
