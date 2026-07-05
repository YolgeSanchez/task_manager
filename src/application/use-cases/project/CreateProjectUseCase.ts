import { v4 as uuidv4 } from 'uuid'
import { Project } from '../../../domain/entities/Project.js'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { ProjectInput, ProjectOutput } from '../../dtos/project.dto.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(projectInput: ProjectInput, requestedById: ID): Promise<ProjectOutput> {
    // [ check user existance ]
    const user = await this.userRepository.findById(requestedById)
    if (user == null) throw new UserNotFoundError()

    // [ create project ]
    const project = new Project(uuidv4(), {
      ...projectInput,
      ownerId: requestedById,
      membersIds: [requestedById],
      tasksIds: [],
      createdAt: new Date(),
    })

    // [ save project ]
    const saved = await this.projectRepository.save(project)
    return saved.toJSON()
  }
}
