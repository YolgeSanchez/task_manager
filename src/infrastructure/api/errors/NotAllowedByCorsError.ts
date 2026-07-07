import { AppError } from '../../../domain/errors/AppError.js'

export class NotAllowedByCorsError extends AppError {
  constructor() {
    super(403, 'Not allowed by CORS')
  }
}
