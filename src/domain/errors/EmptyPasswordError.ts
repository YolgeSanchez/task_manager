import { AppError } from "./AppError.js";

export class EmptyPasswordError extends AppError {
  constructor() {
    super(400, "The password cannot be empty!");
  }
}
