import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { UserOutput } from '../../dtos/user.dto.js'

export class FindAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserOutput[]> {
    const users = await this.userRepository.findAll()
    return users.map((user) => user.toJSON())
  }
}
