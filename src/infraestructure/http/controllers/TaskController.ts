import type { NextFunction, Request, Response } from 'express'
import type { CreateTaskUseCase } from '../../../application/use-cases/task/CreateTaskUseCase.js'
import type { DeleteTaskUseCase } from '../../../application/use-cases/task/DeleteTaskUseCase.js'
import type { FindAllTasksUseCase } from '../../../application/use-cases/task/FindAllTasksUseCase.js'
import type { FindTaskByIdUseCase } from '../../../application/use-cases/task/FindTaskByIdUseCase.js'
import type { UpdateTaskUseCase } from '../../../application/use-cases/task/UpdateTaskUseCase.js'
import type { TaskInput } from '../../../application/dtos/task.dto.js'

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,

    private readonly findAllTasksUseCase: FindAllTasksUseCase,
    private readonly findTaskByIdUseCase: FindTaskByIdUseCase,
  ) {}

  createTask = async (req: Request<{}, {}, TaskInput>, res: Response, next: NextFunction) => {
    try {
      const task = await this.createTaskUseCase.execute(req.body)
      res.status(201).json(task)
    } catch (err) {
      next(err)
    }
  }

  updateTask = async (req: Request<{ id: string }, {}, TaskInput>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const task = await this.updateTaskUseCase.execute(id, req.body)
      res.status(200).json(task)
    } catch (err) {
      next(err)
    }
  }

  deleteTask = async (req: Request<{ id: string }, {}, {}>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const message = await this.deleteTaskUseCase.execute(id)
      res.status(200).json({ message })
    } catch (err) {
      next(err)
    }
  }

  findAllTasks = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = await this.findAllTasksUseCase.execute()
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
}
