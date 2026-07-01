export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
