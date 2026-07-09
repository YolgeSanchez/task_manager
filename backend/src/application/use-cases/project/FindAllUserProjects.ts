import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ProjectOutput } from '../../dtos/project.dto.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class FindAllUserProjectsUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(requestedById: string): Promise<ProjectOutput[]> {
    // [ check existance ]
    const user = await this.userRepository.findById(requestedById)
    if (user == null) throw new UserNotFoundError()

    // [ find all user projects ]
    const projects = await this.projectRepository.findAllUserProjects(requestedById)
    return projects.map((project) => project.toJSON())
  }
}
