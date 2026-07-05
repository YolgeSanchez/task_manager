import { AppError } from '../../domain/errors/AppError.js'

export class MemberNotFoundError extends AppError {
  constructor() {
    super(404, 'Member not found!')
  }
}
