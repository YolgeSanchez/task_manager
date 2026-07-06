import { AddProjectMemberUseCase } from '../../../application/use-cases/project/AddProjectMemberUseCase.js'
import { AddProjectTaskUseCase } from '../../../application/use-cases/project/AddProjectTaskUseCase.js'
import { CreateProjectUseCase } from '../../../application/use-cases/project/CreateProjectUseCase.js'
import { DeleteProjectUseCase } from '../../../application/use-cases/project/DeleteProjectUseCase.js'
import { FindAllUserProjectsUseCase } from '../../../application/use-cases/project/FindAllUserProjects.js'
import { FindProjectByIdUseCase } from '../../../application/use-cases/project/FindProjectByIdUseCase.js'
import { RemoveProjectMemberUseCase } from '../../../application/use-cases/project/RemoveProjectMemberUseCase.js'
import { RemoveProjectTaskUseCase } from '../../../application/use-cases/project/RemoveProjectTaskUseCase.js'
import { UpdateProjectUseCase } from '../../../application/use-cases/project/UpdateProjectUseCase.js'
import { ProjectController } from '../controllers/ProjectController.js'
import { prismaProjectRepository, prismaTaskRepository, prismaUserRepository } from './repository.index.js'

const createProjectUseCase = new CreateProjectUseCase(prismaProjectRepository, prismaUserRepository)
const updateProjectUseCase = new UpdateProjectUseCase(prismaProjectRepository, prismaUserRepository)
const deleteProjectUseCase = new DeleteProjectUseCase(prismaProjectRepository, prismaUserRepository)

const addProjectTaskUseCase = new AddProjectTaskUseCase(
  prismaProjectRepository,
  prismaUserRepository,
  prismaTaskRepository,
)
const removeProjectTaskUseCase = new RemoveProjectTaskUseCase(
  prismaProjectRepository,
  prismaUserRepository,
  prismaTaskRepository,
)
const addProjectMemberUseCase = new AddProjectMemberUseCase(prismaProjectRepository, prismaUserRepository)
const removeProjectMemberUseCase = new RemoveProjectMemberUseCase(
  prismaProjectRepository,
  prismaUserRepository,
)

const findAllUserProjectsUseCase = new FindAllUserProjectsUseCase(
  prismaProjectRepository,
  prismaUserRepository,
)
const findProjectByIdUseCase = new FindProjectByIdUseCase(prismaProjectRepository, prismaUserRepository)

const projectController = new ProjectController(
  createProjectUseCase,
  updateProjectUseCase,
  deleteProjectUseCase,
  addProjectTaskUseCase,
  removeProjectTaskUseCase,
  addProjectMemberUseCase,
  removeProjectMemberUseCase,
  findAllUserProjectsUseCase,
  findProjectByIdUseCase,
)

export { projectController }
