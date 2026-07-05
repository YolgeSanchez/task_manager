import type { NextFunction, Request, Response } from 'express'
import type { TaskInput } from '../../../application/dtos/task.dto.js'
import type { CreateTaskUseCase } from '../../../application/use-cases/task/CreateTaskUseCase.js'
import type { DeleteTaskUseCase } from '../../../application/use-cases/task/DeleteTaskUseCase.js'
import type { FindAllTasksByProjectIdUseCase } from '../../../application/use-cases/task/FindAllTasksByProjectIdUseCase.js'
import type { FindAllTasksUseCase } from '../../../application/use-cases/task/FindAllTasksUseCase.js'
import type { FindTaskByIdUseCase } from '../../../application/use-cases/task/FindTaskByIdUseCase.js'
import type { UpdateTaskUseCase } from '../../../application/use-cases/task/UpdateTaskUseCase.js'
import { UnauthorizedError } from '../errors/UnauthorizedError.js'

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,

    private readonly findAllTasksUseCase: FindAllTasksUseCase,
    private readonly findAllTasksByProjectIdUseCase: FindAllTasksByProjectIdUseCase,
    private readonly findTaskByIdUseCase: FindTaskByIdUseCase,
  ) {}

  createTask = async (req: Request<{}, {}, TaskInput>, res: Response, next: NextFunction) => {
    try {
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const task = await this.createTaskUseCase.execute(req.body, requestedById)
      res.status(201).json(task)
    } catch (err) {
      next(err)
    }
  }

  updateTask = async (req: Request<{ id: string }, {}, TaskInput>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { sub: requestedById } = this.getAuthenticatedUser(req)

      const task = await this.updateTaskUseCase.execute(id, requestedById, req.body)
      res.status(200).json(task)
    } catch (err) {
      next(err)
    }
  }

  deleteTask = async (req: Request<{ id: string }, {}, {}>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { sub: requestedById } = this.getAuthenticatedUser(req)

      const message = await this.deleteTaskUseCase.execute(id, requestedById)
      res.status(200).json({ message })
    } catch (err) {
      next(err)
    }
  }

  findAllTasks = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = await this.findAllTasksUseCase.execute()
      res.status(200).json(tasks)
    } catch (err) {
      next(err)
    }
  }

  findAllTasksByProjectId = async (
    req: Request<{ projectId: string }, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const tasks = await this.findAllTasksByProjectIdUseCase.execute(req.params, requestedById)
      res.status(200).json(tasks)
    } catch (err) {
      next(err)
    }
  }

  findTaskById = async (req: Request<{ id: string }, {}, {}>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const task = await this.findTaskByIdUseCase.execute(id)
      res.status(200).json(task)
    } catch (err) {
      next(err)
    }
  }

  private getAuthenticatedUser(req: Request) {
    if (!req.user) throw new UnauthorizedError()
    return req.user
  }
}
