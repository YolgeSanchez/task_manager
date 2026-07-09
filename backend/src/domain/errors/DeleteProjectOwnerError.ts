import { AppError } from './AppError.js'

export class DeleteProjectOwnerError extends AppError {
  constructor() {
    super(409, 'Project owner can not be removed from it!')
  }
}
