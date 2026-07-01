import { User } from '../../domain/entities/User.js'
import type { UserRepository } from '../../domain/repositories/UserRepository.js'
import type { ID, SuccessMessage } from '../../domain/types/types.js'
import type { UserModel } from '../../generated/prisma/models.js'
import { prisma } from '../libs/prisma.js'

export class PrismaUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const saved = await prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
      },
    })

    return this.toEntity(saved)
  }

  async update(user: User): Promise<User> {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: user.username,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
      },
    })

    return this.toEntity(updated)
  }

  async deleteById(id: ID): Promise<SuccessMessage> {
    await prisma.user.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    })
    return 'User has been deleted successfully.'
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({ where: { deletedAt: null } })
    return users.map((user) => this.toEntity(user))
  }

  async findById(id: ID): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id: id, deletedAt: null } })
    return user ? this.toEntity(user) : null
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { username: username } })
    return user ? this.toEntity(user) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email: email } })
    return user ? this.toEntity(user) : null
  }

  private toEntity(user: UserModel): User {
    return new User(user.id, {
      ...user,
    })
  }
}
