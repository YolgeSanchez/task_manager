import { AppError } from './AppError.js'

export class MemberNotInProjectError extends AppError {
  constructor() {
    super(404, 'Member not found in project!')
  }
}
