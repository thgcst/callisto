export type ErrorType = {
   message?: string;
   errorLocationCode: string;
};

export type ErrorWithStatusCode = ErrorType & { statusCode?: number };

class BaseError extends Error {
   statusCode: number;
   errorLocationCode?: string;

   constructor({
      message,
      statusCode,
      errorLocationCode,
   }: {
      message: string;
      statusCode?: number;
      errorLocationCode?: string;
   }) {
      super();
      this.name = this.constructor.name;
      this.message = message;
      this.statusCode = statusCode || 500;
      this.errorLocationCode = errorLocationCode;
   }
}

export class InternalServerError extends BaseError {
   constructor({
      message,
      statusCode,
      errorLocationCode,
   }: ErrorWithStatusCode) {
      super({
         message: message || "Um erro interno não esperado aconteceu.",
         statusCode: statusCode || 500,
         errorLocationCode,
      });
   }
}

export class NotFoundError extends BaseError {
   constructor({ message, errorLocationCode }: ErrorType) {
      super({
         message:
            message || "Não foi possível encontrar este recurso no sistema.",
         statusCode: 404,
         errorLocationCode,
      });
   }
}

export class ServiceError extends BaseError {
   constructor({
      message,
      statusCode,
      errorLocationCode,
   }: ErrorWithStatusCode) {
      super({
         message: message || "Serviço indisponível no momento.",
         statusCode: statusCode || 503,
         errorLocationCode,
      });
   }
}

export class ValidationError extends BaseError {
   constructor({
      message,
      statusCode,
      errorLocationCode,
   }: ErrorWithStatusCode) {
      super({
         message: message || "Um erro de validação ocorreu.",
         statusCode: statusCode || 400,
         errorLocationCode,
      });
   }
}

export class UnauthorizedError extends BaseError {
   constructor({ message, errorLocationCode }: ErrorType) {
      super({
         message: message || "Usuário não autenticado.",
         statusCode: 401,
         errorLocationCode,
      });
   }
}

export class ForbiddenError extends BaseError {
   constructor({ message, errorLocationCode }: ErrorType) {
      super({
         message:
            message || "Você não possui permissão para executar esta ação.",
         statusCode: 403,
         errorLocationCode,
      });
   }
}

export class TooManyRequestsError extends BaseError {
   constructor({ message, errorLocationCode }: ErrorType) {
      super({
         message: message || "Você realizou muitas requisições recentemente.",
         statusCode: 429,
         errorLocationCode,
      });
   }
}

export class UnprocessableEntityError extends BaseError {
   constructor({ message, errorLocationCode }: ErrorType) {
      super({
         message: message || "Não foi possível realizar esta operação.",
         statusCode: 422,
         errorLocationCode,
      });
   }
}

export class ConflictError extends BaseError {
   constructor({ message, errorLocationCode }: ErrorType) {
      super({
         message: message || "Conflito de dados.",
         statusCode: 409,
         errorLocationCode,
      });
   }
}
