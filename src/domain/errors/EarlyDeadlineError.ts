import { AppError } from "./AppError.js";

export class EarlyDeadlineError extends AppError {
  constructor() {
    super(400, "The deadline cannot be earlier than the creation date!");
  }
}
