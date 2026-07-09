import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository.js'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { ProjectOutput } from '../../dtos/project.dto.js'
import { NotAuthorizedToPerformError } from '../../errors/NotAuthorizedToPerformError.js'
import { ProjectNotFoundError } from '../../errors/ProjectNotFoundError.js'
import { TaskNotFoundError } from '../../errors/TaskNotFoundError.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class RemoveProjectTaskUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(id: ID, taskId: ID, requestedById: ID): Promise<ProjectOutput> {
    // [ check existances ]
    const user = await this.userRepository.findById(requestedById)
    if (user == null) throw new UserNotFoundError()

    const project = await this.projectRepository.findById(id)
    if (project == null) throw new ProjectNotFoundError()

    const task = await this.taskRepository.findById(taskId)
    if (task == null) throw new TaskNotFoundError()

    // [ check permissions ]
    if (!project.membersIds.includes(requestedById)) throw new ProjectNotFoundError()
    if (!(project.ownerId == requestedById || task.userId == requestedById)) {
      throw new NotAuthorizedToPerformError()
    }

    // [ remove task ]
    project.removeTask(taskId)
    const updated = await this.projectRepository.update(project)

    task.removeFromProject()
    await this.taskRepository.update(task)

    return updated.toJSON()
  }
}
