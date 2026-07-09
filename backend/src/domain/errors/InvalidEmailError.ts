import { AppError } from './AppError.js'

export class InvalidEmailError extends AppError {
  constructor() {
    super(400, 'The email must be a valid email address')
  }
}
