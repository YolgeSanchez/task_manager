import { CreateTaskUseCase } from '../../../application/use-cases/task/CreateTaskUseCase.js'
import { DeleteTaskUseCase } from '../../../application/use-cases/task/DeleteTaskUseCase.js'
import { FindAllTasksByProjectIdUseCase } from '../../../application/use-cases/task/FindAllTasksByProjectIdUseCase.js'
import { FindAllTasksByUserIdUseCase } from '../../../application/use-cases/task/FindAllTasksByUserIdUseCase.js'
import { FindTaskByIdUseCase } from '../../../application/use-cases/task/FindTaskByIdUseCase.js'
import { UpdateTaskUseCase } from '../../../application/use-cases/task/UpdateTaskUseCase.js'
import { TaskController } from '../controllers/TaskController.js'
import { prismaProjectRepository, prismaTaskRepository, prismaUserRepository } from './repository.index.js'

const createTaskUseCase = new CreateTaskUseCase(prismaTaskRepository, prismaUserRepository)
const updateTaskUseCase = new UpdateTaskUseCase(prismaTaskRepository)
const deleteTaskUseCase = new DeleteTaskUseCase(prismaTaskRepository)

const findAllTasksByUserIdUseCase = new FindAllTasksByUserIdUseCase(
  prismaTaskRepository,
  prismaUserRepository,
)
const findAllTasksByProjectIdUseCase = new FindAllTasksByProjectIdUseCase(
  prismaTaskRepository,
  prismaUserRepository,
  prismaProjectRepository,
)
const findByIdUseCase = new FindTaskByIdUseCase(prismaTaskRepository)

const taskController = new TaskController(
  createTaskUseCase,
  updateTaskUseCase,
  deleteTaskUseCase,

  findAllTasksByUserIdUseCase,
  findAllTasksByProjectIdUseCase,

  findByIdUseCase,
)

export { taskController }
