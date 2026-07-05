import { AppError } from '../../../domain/errors/AppError.js'

export class MemberIdNotValidString extends AppError {
  constructor() {
    super(400, 'Member ID must be a valid UUID')
  }
}
