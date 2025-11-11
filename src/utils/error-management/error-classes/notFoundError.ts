import { ERROR_CODES } from '../../constant';
import { AppError } from '../appError';

export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(ERROR_CODES.NOT_FOUND_ERROR, message, details);
  }
}
