import type { NextFunction, Request, Response } from 'express'
import { SignInInputSchema, SignUpInputSchema } from '../../../application/dtos/auth.dto.js'
import { AppError } from '../../../domain/errors/AppError.js'

export const validateSignUpUser = (req: Request, _res: Response, next: NextFunction) => {
  const result = SignUpInputSchema.safeParse(req.body)
  if (!result.success) {
    next(
      new AppError(400, result.error.issues.map((issue) => issue.message + ' at ' + issue.path).join(', ')),
    )
    return
  }

  req.body = result.data
  next()
}

export const validateSignInUser = (req: Request, _res: Response, next: NextFunction) => {
  const result = SignInInputSchema.safeParse(req.body)
  if (!result.success) {
    next(
      new AppError(400, result.error.issues.map((issue) => issue.message + ' at ' + issue.path).join(', ')),
    )
    return
  }

  req.body = result.data
  next()
}
