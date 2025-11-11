import { ERROR_CODES } from '../../constant';
import { AppError } from '../appError';

export class BadRequestError extends AppError {
  constructor(message: string, details?: any) {
    super(ERROR_CODES.BAD_REQUEST_ERROR, message, details);
  }
}
