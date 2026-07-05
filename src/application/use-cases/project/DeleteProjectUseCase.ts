import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID, SuccessMessage } from '../../../domain/types/types.js'
import { NotAuthorizedToPerformError } from '../../errors/NotAuthorizedToPerformError.js'
import { ProjectNotFoundError } from '../../errors/ProjectNotFoundError.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class DeleteProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: ID, requestedById: ID): Promise<SuccessMessage> {
    // [ check existances ]
    const user = await this.userRepository.findById(requestedById)
    if (user == null) throw new UserNotFoundError()

    const project = await this.projectRepository.findById(id)
    if (project == null) throw new ProjectNotFoundError()

    // [ check ownership ]
    if (!project.membersIds.includes(requestedById)) throw new ProjectNotFoundError()
    if (project.ownerId !== requestedById) throw new NotAuthorizedToPerformError()

    // [ delete project ]
    const successMessage = await this.projectRepository.deleteById(id)
    return successMessage
  }
}
