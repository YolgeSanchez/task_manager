import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { ProjectOutput } from '../../dtos/project.dto.js'
import { ProjectNotFoundError } from '../../errors/ProjectNotFoundError.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class FindProjectByIdUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: ID, requestedById: ID): Promise<ProjectOutput> {
    // [ check existance ]
    const user = await this.userRepository.findById(requestedById)
    if (user == null) throw new UserNotFoundError()

    const project = await this.projectRepository.findById(id)
    if (project == null) throw new ProjectNotFoundError()

    // [ check permissions ]
    if (!project.membersIds.includes(requestedById)) throw new ProjectNotFoundError()

    // [ return result ]
    return project.toJSON()
  }
}
