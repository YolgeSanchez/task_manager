import { AppError } from "./AppError.js";

export class EmptyNameError extends AppError {
  constructor() {
    super(400, "The name cannot be empty!");
  }
}
