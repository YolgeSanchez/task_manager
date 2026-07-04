import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { PasswordHasher } from '../../../domain/services/PasswordHasher.js'
import type { TokenService } from '../../../domain/services/TokenService.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class SignInUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(username: string, password: string): Promise<{ token: string }> {
    // [ find user by username ]
    const user = await this.userRepository.findByUsername(username)
    if (!user) throw new UserNotFoundError()

    // [ verify password ]
    const isPasswordValid = await this.passwordHasher.compare(password, user.password)
    if (!isPasswordValid) throw new UserNotFoundError()

    // [ generate token ]
    const token = await this.tokenService.generateToken({ sub: user.id, username: user.username })
    return { token }
  }
}
