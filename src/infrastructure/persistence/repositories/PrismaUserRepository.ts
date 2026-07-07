import { User } from '../../../domain/entities/User.js'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { ID, SuccessMessage } from '../../../domain/types/types.js'
import { prisma } from '../prisma.js'

type UserWithProjects = {
  id: string
  username: string
  name: string
  lastName: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  memberProjects: { id: string }[]
}

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
    return new User(saved.id, {
      username: saved.username,
      name: saved.name,
      lastName: saved.lastName,
      email: saved.email,
      password: saved.password,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
      projectsIds: [],
    })
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
      include: { memberProjects: true },
    })
    return this.toEntity(updated)
  }

  async deleteById(id: ID): Promise<SuccessMessage> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return 'User has been deleted successfully.'
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: { memberProjects: true },
    })
    return users.map((user) => this.toEntity(user))
  }

  async findById(id: ID): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { memberProjects: true },
    })
    return user ? this.toEntity(user) : null
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { memberProjects: true },
    })
    return user ? this.toEntity(user) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { memberProjects: true },
    })
    return user ? this.toEntity(user) : null
  }

  private toEntity(user: UserWithProjects): User {
    return new User(user.id, {
      username: user.username,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      projectsIds: user.memberProjects.map((p) => p.id),
    })
  }
}
