import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID } from '../../../domain/types/types.js'
import type { UserInput, UserOutput } from '../../dtos/user.dto.js'
import { NotAuthorizedToPerformError } from '../../errors/NotAuthorizedToPerformError.js'
import { UserNotFoundError } from '../../errors/UserNotFoundError.js'

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: ID, requestedById: ID, changes: Partial<UserInput>): Promise<UserOutput> {
    const user = await this.userRepository.findById(id)
    if (user == null) throw new UserNotFoundError()
    if (user.id !== requestedById) throw new NotAuthorizedToPerformError()

    if (changes.username !== undefined) user.username = changes.username
    if (changes.name !== undefined) user.name = changes.name
    if (changes.lastName !== undefined) user.lastName = changes.lastName
    if (changes.email !== undefined) user.email = changes.email
    if (changes.password !== undefined) user.password = changes.password

    const updatedUser = await this.userRepository.update(user)
    return updatedUser.toJSON()
  }
}
