import type { User } from '../entities/User.js'
import type { ID, SuccessMessage } from '../types/types.js'

export interface UserRepository {
  save(user: User): Promise<User>
  update(user: User): Promise<User>
  deleteById(id: ID): Promise<SuccessMessage>

  findAll(): Promise<User[]>
  findById(id: ID): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
}
