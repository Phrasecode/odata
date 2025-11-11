import { ERROR_CODES, STATUS_CODES } from '../constant';

export class AppError extends Error {
  public readonly code: ERROR_CODES;
  public readonly message: string;
  public readonly details?: any;
  public readonly stack?: string;
  public readonly statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR;

  constructor(code: ERROR_CODES, message: string, details?: any, stack?: string) {
    super(message);
    this.code = code;
    this.message = message;
    this.details = details;
    this.stack = stack;
    this.statusCode = STATUS_CODES[code] ? STATUS_CODES[code] : STATUS_CODES.INTERNAL_SERVER_ERROR;

    Error.captureStackTrace(this, this.constructor);
  }
}
