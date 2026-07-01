import { AppError } from './AppError.js'

export class EmptyLastNameError extends AppError {
  constructor() {
    super(400, 'The last name cannot be empty!')
  }
}
