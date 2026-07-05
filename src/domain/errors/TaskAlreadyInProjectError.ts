import { AppError } from './AppError.js'

export class TaskAlreadyInProjectError extends AppError {
  constructor() {
    super(409, 'This task is already in the project')
  }
}
