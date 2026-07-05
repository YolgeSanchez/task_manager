import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { ProjectOutput, UpdateProjectInput } from '../../dtos/project.dto.js'
import { NotAuthorizedToPerformError } from '../../errors/NotAuthorizedToPerformError.js'
import { ProjectNotFoundError } from '../../errors/ProjectNotFoundError.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class UpdateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: ID, requestedById: ID, changes: UpdateProjectInput): Promise<ProjectOutput> {
    // [ check existances ]
    const user = await this.userRepository.findById(requestedById)
    if (user == null) throw new UserNotFoundError()

    const project = await this.projectRepository.findById(id)
    if (project == null) throw new ProjectNotFoundError()

    // [ check permissions ]
    if (!project.membersIds.includes(requestedById)) throw new ProjectNotFoundError()
    if (project.ownerId !== requestedById) throw new NotAuthorizedToPerformError()

    // [ update project ]
    if (changes.name !== undefined) project.name = changes.name
    const updated = await this.projectRepository.update(project)
    return updated.toJSON()
  }
}
