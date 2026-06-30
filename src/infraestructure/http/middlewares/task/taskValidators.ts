import type { Request, Response, NextFunction } from "express"
import { TaskInputSchema, UpdateTaskInputSchema } from "../../../../application/dtos/task.dto.js"
import { AppError } from "../../../../domain/errors/AppError.js";
import z from "zod";
import { IdNotValidString } from "../../errors/IdNotValidString.js";

export const validateCreateTask = (req: Request, _: Response, next: NextFunction) => {
  const result = TaskInputSchema.safeParse(req.body);
  if (!result.success) {
    next(new AppError(400, result.error.issues.map((issue) => issue.message + " at " + issue.path).join(', ')));
    return;
  }

  req.body = result.data;
  next();
}

export const validateUpdateTask = (req: Request, _: Response, next: NextFunction) => {
  const result = UpdateTaskInputSchema.safeParse(req.body);
  if (!result.success) {
    next(new AppError(400, result.error.issues.map((issue) => issue.message + " at " + issue.path).join(', ')));
    return;
  }

  req.body = result.data;
  next();
}

export const validateIdParam = (req: Request, _: Response, next: NextFunction) => {
  const result = z.uuidv4().safeParse(req.params.id);
  if (!result.success) {
    next(new IdNotValidString());
    return;
  }

  next();
}