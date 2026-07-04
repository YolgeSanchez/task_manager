import { v4 as uuidv4 } from 'uuid'
import { Task } from '../../../domain/entities/Task.js'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { TaskInput, TaskOutput } from '../../dtos/task.dto.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(taskInput: TaskInput): Promise<TaskOutput> {
    const user = await this.userRepository.findById(taskInput.userId)
    if (user == null) throw new UserNotFoundError()

    const task = new Task(uuidv4(), { ...taskInput, createdAt: new Date() })
    const savedTask = await this.taskRepository.save(task)
    return savedTask.toJSON()
  }
}
