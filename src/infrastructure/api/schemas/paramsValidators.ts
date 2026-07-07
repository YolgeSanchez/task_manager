import type { NextFunction, Request, Response } from 'express'
import z from 'zod'
import { IdNotValidString } from '../errors/IdNotValidString.js'
import { MemberIdNotValidString } from '../errors/MemberIdNotValidString.js'
import { TaskIdNotValidString } from '../errors/TaskIdNotValidString.js'

export const validateIdParam = (req: Request, _res: Response, next: NextFunction) => {
  const result = z.uuidv4().safeParse(req.params.id)
  if (!result.success) {
    next(new IdNotValidString())
    return
  }

  next()
}

export const validateTaskIdParam = (req: Request, _res: Response, next: NextFunction) => {
  const result = z.uuidv4().safeParse(req.params.taskId)
  if (!result.success) {
    next(new TaskIdNotValidString())
    return
  }

  next()
}

export const validateMemberIdParam = (req: Request, _res: Response, next: NextFunction) => {
  const result = z.uuidv4().safeParse(req.params.memberId)
  if (!result.success) {
    next(new MemberIdNotValidString())
    return
  }

  next()
}
