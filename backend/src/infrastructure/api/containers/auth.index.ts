import { SignInUseCase } from '../../../application/use-cases/auth/SignInUseCase.js'
import { SignUpUseCase } from '../../../application/use-cases/auth/SignUpUseCase.js'
import { BcryptPasswordHasher } from '../../shared/services/BcryptPasswordHasher.js'
import { JoseTokenService } from '../../shared/services/JoseTokenService.js'
import { AuthController } from '../controllers/AuthController.js'
import { prismaUserRepository } from './repository.index.js'

const bcryptPasswordHasher = new BcryptPasswordHasher()
export const joseTokenService = new JoseTokenService()

const signUpUseCase = new SignUpUseCase(prismaUserRepository, joseTokenService, bcryptPasswordHasher)
const signInUseCase = new SignInUseCase(prismaUserRepository, joseTokenService, bcryptPasswordHasher)

const authController = new AuthController(signUpUseCase, signInUseCase)

export { authController }
