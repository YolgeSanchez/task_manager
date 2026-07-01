import { AppError } from './AppError.js'

export class TaskNotFoundError extends AppError {
  constructor() {
    super(404, 'Task not found!')
  }
}
