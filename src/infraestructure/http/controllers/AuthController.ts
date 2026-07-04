import type { NextFunction, Request, Response } from 'express'
import type { UserInput } from '../../../application/dtos/user.dto.js'
import type { SignInUseCase } from '../../../application/use-cases/auth/SignInUseCase.js'
import type { SignUpUseCase } from '../../../application/use-cases/auth/SignUpUseCase.js'

export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
  ) {}

  // TODO: [ implement ]
  signIn = async (_req: Request, _res: Response) => {
    return null
  }

  signUp = async (req: Request<{}, {}, UserInput>, res: Response, next: NextFunction) => {
    try {
      const user = await this.signUpUseCase.execute(req.body)
      res.status(201).json(user)
    } catch (err) {
      next(err)
    }
  }
}
