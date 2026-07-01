import type { NextFunction, Request, Response } from 'express'
import { UserInputSchema } from '../../../application/dtos/user.dto.js'
import { AppError } from '../../../domain/errors/AppError.js'

export const validateCreateUser = (req: Request, _res: Response, next: NextFunction) => {
  const result = UserInputSchema.safeParse(req.body)
  if (!result.success) {
    next(
      new AppError(400, result.error.issues.map((issue) => issue.message + ' at ' + issue.path).join(', ')),
    )
    return
  }

  req.body = result.data
  next()
}

export const validateUpdateUser = (req: Request, _res: Response, next: NextFunction) => {
  const result = UserInputSchema.partial().safeParse(req.body)
  if (!result.success) {
    next(
      new AppError(400, result.error.issues.map((issue) => issue.message + ' at ' + issue.path).join(', ')),
    )
    return
  }

  req.body = result.data
  next()
}
