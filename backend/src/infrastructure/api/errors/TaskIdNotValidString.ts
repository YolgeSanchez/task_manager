import { AppError } from '../../../domain/errors/AppError.js'

export class TaskIdNotValidString extends AppError {
  constructor() {
    super(400, 'Task ID must be a valid UUID')
  }
}
