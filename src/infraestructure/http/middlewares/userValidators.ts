import type { NextFunction, Request, Response } from 'express'
import { UpdateUserInputSchema } from '../../../application/dtos/user.dto.js'
import { AppError } from '../../../domain/errors/AppError.js'

export const validateUpdateUser = (req: Request, _res: Response, next: NextFunction) => {
  const result = UpdateUserInputSchema.safeParse(req.body)
  if (!result.success) {
    next(
      new AppError(400, result.error.issues.map((issue) => issue.message + ' at ' + issue.path).join(', ')),
    )
    return
  }

  req.body = result.data
  next()
}
