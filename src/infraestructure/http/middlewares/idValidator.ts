import type { NextFunction, Request, Response } from 'express'
import z from 'zod'
import { IdNotValidString } from '../errors/IdNotValidString.js'

export const validateIdParam = (req: Request, _res: Response, next: NextFunction) => {
  const result = z.uuidv4().safeParse(req.params.id)
  if (!result.success) {
    next(new IdNotValidString())
    return
  }

  next()
}
