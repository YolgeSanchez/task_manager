import { AppError } from '../../../domain/errors/AppError.js'

export class NoTokenError extends AppError {
  constructor() {
    super(403, 'There is no token')
  }
}
