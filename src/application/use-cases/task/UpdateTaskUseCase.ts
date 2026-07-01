import { TaskNotFoundError } from '../../errors/TaskNotFoundError.js'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { TaskInput, TaskOutput } from '../../dtos/task.dto.js'

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: ID, changes: Partial<TaskInput>): Promise<TaskOutput> {
    const task = await this.taskRepository.findById(id)
    if (task == null) throw new TaskNotFoundError()

    if (changes.name !== undefined) task.name = changes.name
    if (changes.description !== undefined) task.description = changes.description
    if (changes.status !== undefined) task.status = changes.status
    if (changes.deadline !== undefined) task.deadline = changes.deadline

    const updatedTask = await this.taskRepository.update(task)
    return updatedTask.toJSON()
  }
}
