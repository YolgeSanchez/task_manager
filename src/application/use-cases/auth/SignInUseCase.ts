import type { UserRepository } from '../../../domain/repositories/UserRepository.js'

export class SignInUseCase {
  constructor(private readonly userRepository: UserRepository) {}
}
