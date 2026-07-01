import { AppError } from "./AppError.js";

export class InvalidPasswordError extends AppError {
  constructor() {
    super(400, "The password must contain at least 8 characters");
  }
}