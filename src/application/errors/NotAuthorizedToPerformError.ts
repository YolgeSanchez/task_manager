import { AppError } from '../../domain/errors/AppError.js'

export class NotAuthorizedToPerformError extends AppError {
  constructor() {
    super(403, 'You are not authorized to perform this action')
  }
}
