import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository.js'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { ProjectOutput, TaskIdInput } from '../../dtos/project.dto.js'
import { ProjectNotFoundError } from '../../errors/ProjectNotFoundError.js'
import { TaskNotFoundError } from '../../errors/TaskNotFoundError.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class AddProjectTaskUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(id: ID, { taskId }: TaskIdInput, requestedById: ID): Promise<ProjectOutput> {
    // [ check existances ]
    const user = await this.userRepository.findById(requestedById)
    if (user == null) throw new UserNotFoundError()

    const project = await this.projectRepository.findById(id)
    if (project == null) throw new ProjectNotFoundError()

    const task = await this.taskRepository.findById(taskId)
    if (task == null) throw new TaskNotFoundError()
    if (task.userId !== user.id) throw new TaskNotFoundError()

    // [ check permissions]
    if (!project.membersIds.includes(requestedById)) throw new ProjectNotFoundError()

    // [ add task ]
    project.addTask(taskId)
    const updated = await this.projectRepository.update(project)

    task.addToProject(project.id)
    await this.taskRepository.update(task)

    return updated.toJSON()
  }
}
