import { AppError } from '../../../domain/errors/AppError.js'

export class IdNotValidString extends AppError {
  constructor() {
    super(400, 'ID must be a valid UUID')
  }
}
