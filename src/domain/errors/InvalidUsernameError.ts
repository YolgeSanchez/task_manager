import { AppError } from "./AppError.js";

export class InvalidUsernameError extends AppError {
  constructor() {
    super(400, "The username must contain at least 3 characters");
  }
}