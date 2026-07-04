import type { NextFunction, Request, Response } from 'express'
import type { TokenService } from '../../../domain/services/TokenService.js'
import { InvalidTokenError } from '../errors/InvalidTokenError.js'
import { NoTokenError } from '../errors/NoTokenError.js'

export const authMiddleware =
  (tokenService: TokenService) => async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.token

    // [ verify token existance]
    if (!token) {
      next(new NoTokenError())
      return
    }

    // [ verify token ]
    const payload = await tokenService.verifyToken(token)
    if (!payload) {
      next(new InvalidTokenError())
      return
    }

    // [ assign ]
    req.user = payload
    next()
  }
