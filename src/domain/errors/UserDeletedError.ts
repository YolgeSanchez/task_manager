import { AppError } from "./AppError.js";

export class UserDeletedError extends AppError {
  constructor() {
    super(404, "The user is already deleted");
  }
}