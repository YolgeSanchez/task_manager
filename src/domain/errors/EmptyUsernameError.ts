import { AppError } from "./AppError.js";

export class EmptyUsernameError extends AppError {
  constructor() {
    super(400, "The username cannot be empty!");
  }
}
