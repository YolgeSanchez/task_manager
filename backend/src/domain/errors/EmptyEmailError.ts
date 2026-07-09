import { AppError } from './AppError.js'

export class EmptyEmailError extends AppError {
  constructor() {
    super(400, 'The email cannot be empty!')
  }
}
