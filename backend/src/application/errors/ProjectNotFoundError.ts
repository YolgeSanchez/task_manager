import { AppError } from '../../domain/errors/AppError.js'

export class ProjectNotFoundError extends AppError {
  constructor() {
    super(404, 'Project not found!')
  }
}
