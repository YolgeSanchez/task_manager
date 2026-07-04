import { CreateUserUseCase } from '../../../application/use-cases/user/CreateUserUseCase.js'
import { DeleteUserUseCase } from '../../../application/use-cases/user/DeleteUserUseCase.js'
import { FindAllUsersUseCase } from '../../../application/use-cases/user/FindAllUsersUseCase.js'
import { FindUserByIdUseCase } from '../../../application/use-cases/user/FindUserByIdUseCase.js'
import { UpdateUserUseCase } from '../../../application/use-cases/user/UpdateUserUseCase.js'
import { BcryptPasswordHasher } from '../../libs/BcryptPasswordHasher.js'
import { UserController } from '../controllers/UserController.js'
import { prismaUserRepository } from './repository.index.js'

const bcrypPasswordHasher = new BcryptPasswordHasher()

const createUserUseCase = new CreateUserUseCase(prismaUserRepository, bcrypPasswordHasher)
const updateUserUseCase = new UpdateUserUseCase(prismaUserRepository)
const deleteUserUseCase = new DeleteUserUseCase(prismaUserRepository)

const findAllUsersUseCase = new FindAllUsersUseCase(prismaUserRepository)
const findUserByIdUseCase = new FindUserByIdUseCase(prismaUserRepository)

const userController = new UserController(
  createUserUseCase,
  updateUserUseCase,
  deleteUserUseCase,
  findAllUsersUseCase,
  findUserByIdUseCase,
)

export { userController }
