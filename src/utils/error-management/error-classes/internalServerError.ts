import { ERROR_CODES } from '../../constant';
import { AppError } from '../appError';

export class InternalServerError extends AppError {
  constructor(message: string, details?: any, stack?: string) {
    super(ERROR_CODES.NOT_FOUND_ERROR, message, details, stack);
  }
}
