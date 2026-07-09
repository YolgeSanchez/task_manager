import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { ProjectOutput } from '../../dtos/project.dto.js'
import { MemberNotFoundError } from '../../errors/MemberNotFoundError.js'
import { NotAuthorizedToPerformError } from '../../errors/NotAuthorizedToPerformError.js'
import { ProjectNotFoundError } from '../../errors/ProjectNotFoundError.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class AddProjectMemberUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: ID, memberId: ID, requestedById: ID): Promise<ProjectOutput> {
    // [ check existances ]
    const user = await this.userRepository.findById(requestedById)
    if (user == null) throw new UserNotFoundError()

    const project = await this.projectRepository.findById(id)
    if (project == null) throw new ProjectNotFoundError()

    const member = await this.userRepository.findById(memberId)
    if (member == null) throw new MemberNotFoundError()

    // [ check permissions]
    if (!project.membersIds.includes(requestedById)) throw new ProjectNotFoundError()
    if (project.ownerId !== requestedById) throw new NotAuthorizedToPerformError()

    // [ add member ]
    project.addMember(memberId)
    const updated = await this.projectRepository.update(project)

    member.addProject(project.id)
    await this.userRepository.update(member)

    return updated.toJSON()
  }
}
