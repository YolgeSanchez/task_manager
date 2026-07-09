import { AppError } from '../../domain/errors/AppError.js'

export class UserNotFoundError extends AppError {
  constructor() {
    super(404, 'User not found!')
  }
}
