import type { NextFunction, Request, Response } from 'express'
import type { SignInInput } from '../../../application/dtos/auth.dto.js'
import type { UserInput } from '../../../application/dtos/user.dto.js'
import type { SignInUseCase } from '../../../application/use-cases/auth/SignInUseCase.js'
import type { SignUpUseCase } from '../../../application/use-cases/auth/SignUpUseCase.js'

export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
  ) {}

  signIn = async (req: Request<{}, {}, SignInInput>, res: Response, next: NextFunction) => {
    try {
      const { token } = await this.signInUseCase.execute(req.body.username, req.body.password)
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        })
        .status(200)
        .json({ message: 'Sign in successful' })
    } catch (err) {
      next(err)
    }
  }

  signUp = async (req: Request<{}, {}, UserInput>, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await this.signUpUseCase.execute(req.body)

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        })
        .status(201)
        .json(user)
    } catch (err) {
      next(err)
    }
  }
}
