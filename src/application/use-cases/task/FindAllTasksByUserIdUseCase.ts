import type { TaskRepository } from '../../../domain/repositories/TaskRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { TaskOutput } from '../../dtos/task.dto.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class FindAllTasksByUserIdUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(requestedById: ID): Promise<TaskOutput[]> {
    const user = await this.userRepository.findById(requestedById)
    if (user == null) throw new UserNotFoundError()

    const tasks = await this.taskRepository.findAllByUserId(requestedById)
    return tasks.map((task) => task.toJSON())
  }
}
