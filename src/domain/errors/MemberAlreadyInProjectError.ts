import { AppError } from './AppError.js'

export class MemberAlreadyInProjectError extends AppError {
  constructor() {
    super(409, 'This member is already in the project')
  }
}
