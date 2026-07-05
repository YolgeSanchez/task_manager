import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository.js'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { TaskOutput } from '../../dtos/task.dto.js'
import type { ProjectIdInput } from '../../dtos/types.dto.js'
import { ProjectNotFoundError } from '../../errors/ProjectNotFoundError.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class FindAllByProjectIdUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute({ projectId }: ProjectIdInput, requestedById: ID): Promise<TaskOutput[]> {
    // [ check existance and permissions ]
    const user = await this.userRepository.findById(requestedById)
    if (user == null) throw new UserNotFoundError()

    const project = await this.projectRepository.findById(projectId)
    if (project == null) throw new ProjectNotFoundError()

    if (!project.membersIds.includes(requestedById)) throw new ProjectNotFoundError()

    // [ get tasks ]
    const tasks = await this.taskRepository.findAllByProjectId(projectId)
    return tasks.map((task) => task.toJSON())
  }
}
