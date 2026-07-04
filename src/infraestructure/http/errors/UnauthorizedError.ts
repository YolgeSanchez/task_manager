import { AppError } from '../../../domain/errors/AppError.js'

export class UnauthorizedError extends AppError {
  constructor() {
    super(401, 'Unauthorized: You do not have permission to access this resource.')
  }
}
