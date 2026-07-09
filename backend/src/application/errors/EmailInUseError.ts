import { AppError } from '../../domain/errors/AppError.js'

export class EmailInUseError extends AppError {
  constructor() {
    super(409, 'The email is already in use')
  }
}
