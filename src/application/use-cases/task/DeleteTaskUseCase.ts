import { TaskNotFoundError } from '../../../domain/errors/TaskNotFoundError.js'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository.js'
import type { ID, SuccessMessage } from '../../../domain/types/types.js'

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: ID): Promise<SuccessMessage> {
    const task = await this.taskRepository.findById(id)
    if (task == null) throw new TaskNotFoundError()

    const successMessage = await this.taskRepository.deleteById(id)
    return successMessage
  }
}
