import { AppError } from '../../domain/errors/AppError.js'

export class UsernameInUseError extends AppError {
  constructor() {
    super(409, 'The username is already in use')
  }
}
