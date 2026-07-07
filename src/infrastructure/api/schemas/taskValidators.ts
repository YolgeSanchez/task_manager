import type { NextFunction, Request, Response } from 'express'
import z from 'zod'
import { TaskInputSchema, UpdateTaskInputSchema } from '../../../application/dtos/task.dto.js'
import { AppError } from '../../../domain/errors/AppError.js'
import { IdNotValidString } from '../errors/IdNotValidString.js'

export const validateCreateTask = (req: Request, _res: Response, next: NextFunction) => {
  const result = TaskInputSchema.safeParse(req.body)
  if (!result.success) {
    next(
      new AppError(400, result.error.issues.map((issue) => issue.message + ' at ' + issue.path).join(', ')),
    )
    return
  }

  req.body = result.data
  next()
}

export const validateUpdateTask = (req: Request, _res: Response, next: NextFunction) => {
  const result = UpdateTaskInputSchema.safeParse(req.body)
  if (!result.success) {
    next(
      new AppError(400, result.error.issues.map((issue) => issue.message + ' at ' + issue.path).join(', ')),
    )
    return
  }

  req.body = result.data
  next()
}

export const validateProjectIdParam = (req: Request, _res: Response, next: NextFunction) => {
  const result = z.uuidv4().safeParse(req.params.projectId)
  if (!result.success) {
    next(new IdNotValidString())
    return
  }

  next()
}
