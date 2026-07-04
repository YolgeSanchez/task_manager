import type { NextFunction, Request, Response } from 'express'
import type { UserInput } from '../../../application/dtos/user.dto.js'
import type { DeleteUserUseCase } from '../../../application/use-cases/user/DeleteUserUseCase.js'
import type { FindAllUsersUseCase } from '../../../application/use-cases/user/FindAllUsersUseCase.js'
import type { FindUserByIdUseCase } from '../../../application/use-cases/user/FindUserByIdUseCase.js'
import type { UpdateUserUseCase } from '../../../application/use-cases/user/UpdateUserUseCase.js'

export class UserController {
  constructor(
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,

    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  updateUser = async (req: Request<{ id: string }, {}, UserInput>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const user = await this.updateUserUseCase.execute(id, req.body)
      res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  }

  deleteUser = async (req: Request<{ id: string }, {}, {}>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const message = await this.deleteUserUseCase.execute(id)
      res.status(200).json({ message })
    } catch (err) {
      next(err)
    }
  }

  findAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.findAllUsersUseCase.execute()
      res.status(200).json(users)
    } catch (err) {
      next(err)
    }
  }

  findUserById = async (req: Request<{ id: string }, {}, {}>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const user = await this.findUserByIdUseCase.execute(id)
      res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  }
}
