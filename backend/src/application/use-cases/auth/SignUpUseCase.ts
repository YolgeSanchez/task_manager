import { v4 as uuidv4 } from 'uuid'
import { User } from '../../../domain/entities/User.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { PasswordHasher } from '../../../domain/services/PasswordHasher.js'
import type { TokenService } from '../../../domain/services/TokenService.js'
import type { SignUpOutput } from '../../dtos/auth.dto.js'
import type { UserInput } from '../../dtos/user.dto.js'
import { EmailInUseError } from '../../errors/EmailInUseError.js'
import { UsernameInUseError } from '../../errors/UsernameInUseError.js'

export class SignUpUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(userInput: UserInput): Promise<SignUpOutput> {
    // [ checks for existance ]
    let existingUser = await this.userRepository.findByUsername(userInput.username)
    if (existingUser) throw new UsernameInUseError()

    existingUser = await this.userRepository.findByEmail(userInput.email)
    if (existingUser) throw new EmailInUseError()

    // [ result ]
    const hashedPassword = await this.passwordHasher.hash(userInput.password)

    const user = new User(uuidv4(), {
      ...userInput,
      password: hashedPassword,
      projectsIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const token = await this.tokenService.generateToken({ sub: user.id, username: user.username })
    const saved = await this.userRepository.save(user)

    return { user: saved.toJSON(), token }
  }
}
