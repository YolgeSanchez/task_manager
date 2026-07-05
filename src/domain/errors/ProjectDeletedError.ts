import { AppError } from './AppError.js'

export class ProjectDeletedError extends AppError {
  constructor() {
    super(404, 'The project is already deleted')
  }
}
