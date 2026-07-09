import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { UserOutput } from '../../dtos/user.dto.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class FindUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: ID): Promise<UserOutput> {
    const user = await this.userRepository.findById(id)
    if (user == null) throw new UserNotFoundError()

    return user.toJSON()
  }
}
