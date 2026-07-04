import { v4 as uuidv4 } from 'uuid'
import { User } from '../../../domain/entities/User.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { PasswordHasher } from '../../../domain/services/PasswordHasher.js'
import type { UserInput, UserOutput } from '../../dtos/user.dto.js'
import { EmailInUseError } from '../../errors/EmailInUseError.js'
import { UsernameInUseError } from '../../errors/UsernameInUseError.js'

export class SignUpUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(userInput: UserInput): Promise<UserOutput> {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const saved = await this.userRepository.save(user)
    return saved.toJSON()
  }
}
