import { AppError } from "./AppError.js";

export class InvalidNameError extends AppError {
  constructor() {
    super(400, "The name must contain at least 3 characters");
  }
}