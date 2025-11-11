import { ERROR_CODES } from '../../constant';
import { AppError } from '../appError';

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(ERROR_CODES.VALIDATION_ERROR, message, details);
  }
}
