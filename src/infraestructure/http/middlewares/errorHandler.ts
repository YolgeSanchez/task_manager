import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../domain/errors/AppError.js";

export const errorHandler = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: "An error has occured" });
};
