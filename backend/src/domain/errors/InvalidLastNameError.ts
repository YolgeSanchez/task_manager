import { AppError } from './AppError.js'

export class InvalidLastNameError extends AppError {
  constructor() {
    super(400, 'The last name must contain at least 3 characters')
  }
}
