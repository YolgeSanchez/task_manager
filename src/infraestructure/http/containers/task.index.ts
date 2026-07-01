import { CreateTaskUseCase } from '../../../application/use-cases/task/CreateTaskUseCase.js'
import { DeleteTaskUseCase } from '../../../application/use-cases/task/DeleteTaskUseCase.js'
import { FindAllTasksUseCase } from '../../../application/use-cases/task/FindAllTasksUseCase.js'
import { FindTaskByIdUseCase } from '../../../application/use-cases/task/FindTaskByIdUseCase.js'
import { UpdateTaskUseCase } from '../../../application/use-cases/task/UpdateTaskUseCase.js'
import { PrismaTaskRepository } from '../../repositories/PrismaTaskRepository.js'
import { TaskController } from '../controllers/TaskController.js'

const prismaTaskRepository = new PrismaTaskRepository()

const createTaskUseCase = new CreateTaskUseCase(prismaTaskRepository)
const updateTaskUseCase = new UpdateTaskUseCase(prismaTaskRepository)
const deleteTaskUseCase = new DeleteTaskUseCase(prismaTaskRepository)

const findAllTasksUseCase = new FindAllTasksUseCase(prismaTaskRepository)
const findByIdUseCase = new FindTaskByIdUseCase(prismaTaskRepository)

const taskController = new TaskController(
  createTaskUseCase,
  updateTaskUseCase,
  deleteTaskUseCase,
  findAllTasksUseCase,
  findByIdUseCase,
)

export { taskController }
