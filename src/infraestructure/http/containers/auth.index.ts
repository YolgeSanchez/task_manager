import { SignInUseCase } from '../../../application/use-cases/auth/SignInUseCase.js'
import { SignUpUseCase } from '../../../application/use-cases/auth/SignUpUseCase.js'
import { AuthController } from '../controllers/AuthController.js'
import { BcryptPasswordHasher } from '../services/BcryptPasswordHasher.js'
import { prismaUserRepository } from './repository.index.js'

const bcryptPasswordHasher = new BcryptPasswordHasher()

const signUpUseCase = new SignUpUseCase(prismaUserRepository, bcryptPasswordHasher)
const signInUseCase = new SignInUseCase(prismaUserRepository)

const authController = new AuthController(signUpUseCase, signInUseCase)

export { authController }
