import type { NextFunction, Request, Response } from 'express'
import { ProjectInputSchema, UpdateProjectInputSchema } from '../../../application/dtos/project.dto.js'
import { AppError } from '../../../domain/errors/AppError.js'

export const validateCreateProject = (req: Request, _res: Response, next: NextFunction) => {
  const result = ProjectInputSchema.safeParse(req.body)
  if (!result.success) {
    next(
      new AppError(400, result.error.issues.map((issue) => issue.message + ' at ' + issue.path).join(', ')),
    )
    return
  }

  req.body = result.data
  next()
}

export const validateUpdateProject = (req: Request, _res: Response, next: NextFunction) => {
  const result = UpdateProjectInputSchema.safeParse(req.body)
  if (!result.success) {
    next(
      new AppError(400, result.error.issues.map((issue) => issue.message + ' at ' + issue.path).join(', ')),
    )
    return
  }

  req.body = result.data
  next()
}
