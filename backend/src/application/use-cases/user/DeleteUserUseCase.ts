import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID, SuccessMessage } from '../../../domain/types/types.js'
import { NotAuthorizedToPerformError } from '../../errors/NotAuthorizedToPerformError.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: ID, requestedById: ID): Promise<SuccessMessage> {
    const user = await this.userRepository.findById(id)
    if (user == null) throw new UserNotFoundError()
    if (user.id !== requestedById) throw new NotAuthorizedToPerformError()

    const successMessage = await this.userRepository.deleteById(id)
    return successMessage
  }
}
