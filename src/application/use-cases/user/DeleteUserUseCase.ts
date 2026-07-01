import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID, SuccessMessage } from '../../../domain/types/types.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: ID): Promise<SuccessMessage> {
    const user = await this.userRepository.findById(id)
    if (user == null) throw new UserNotFoundError()

    const successMessage = await this.userRepository.deleteById(id)
    return successMessage
  }
}
