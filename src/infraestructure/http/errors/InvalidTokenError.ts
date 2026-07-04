import { AppError } from '../../../domain/errors/AppError.js'

export class InvalidTokenError extends AppError {
  constructor() {
    super(403, 'The access token provided is expired, revoked, or malformed.')
  }
}
