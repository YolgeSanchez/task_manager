import type { TaskRepository } from '../../../domain/repositories/TaskRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { TaskInput, TaskOutput } from '../../dtos/task.dto.js'
import { NotAuthorizedToPerformError } from '../../errors/NotAuthorizedToPerformError.js'
import { TaskNotFoundError } from '../../errors/TaskNotFoundError.js'

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: ID, requestedById: ID, changes: Partial<TaskInput>): Promise<TaskOutput> {
    // [ find the task by its ID ]
    const task = await this.taskRepository.findById(id)
    if (task == null) throw new TaskNotFoundError()

    // [ verify that the user requesting the update is the owner of the task ]
    if (task.userId !== requestedById) throw new NotAuthorizedToPerformError()

    // [ apply the changes to the task ]
    if (changes.name !== undefined) task.name = changes.name
    if (changes.description !== undefined) task.description = changes.description
    if (changes.status !== undefined) task.status = changes.status
    if (changes.deadline !== undefined) task.deadline = changes.deadline

    // [ update the task in the repository and return the updated task ]
    const updatedTask = await this.taskRepository.update(task)
    return updatedTask.toJSON()
  }
}
