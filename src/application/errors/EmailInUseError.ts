import { AppError } from '../../domain/errors/AppError.js'

export class EmailInUseError extends AppError {
  constructor() {
    super(400, 'The email is already in use')
  }
}
