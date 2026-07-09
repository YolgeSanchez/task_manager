import { AppError } from './AppError.js'

export class TaskNotInProjectError extends AppError {
  constructor() {
    super(404, 'Task not found in project!')
  }
}
