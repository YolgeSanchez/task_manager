import { v4 as uuidv4 } from 'uuid'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../src/infraestructure/libs/prisma.js'
import { PrismaUserRepository } from '../../src/infraestructure/repositories/PrismaUserRepository.js'
import { cleanDatabase } from './helpers/cleanDatabase.js'

const repository = new PrismaUserRepository()

const makeUserData = (
  overrides: Partial<{
    id: string
    username: string
    email: string
  }> = {},
) => ({
  id: overrides.id ?? uuidv4(),
  username: overrides.username ?? 'john_doe',
  name: 'John',
  lastName: 'Doe',
  email: overrides.email ?? 'john@example.com',
  password: 'hashed_password123',
  createdAt: new Date(),
  updatedAt: new Date(),
  projectsIds: [],
})

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  await cleanDatabase()
})

describe('PrismaUserRepository', () => {
  describe('save', () => {
    it('should save a user successfully', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      const saved = await repository.save(user)
      expect(saved.id).toBe(data.id)
      expect(saved.username).toBe('john_doe')
      expect(saved.email).toBe('john@example.com')
    })

    it('should persist the user in the database', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      const found = await prisma.user.findUnique({ where: { id: data.id } })
      expect(found).not.toBeNull()
      expect(found?.username).toBe('john_doe')
    })

    it('should return user with empty projectsIds', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      const saved = await repository.save(user)
      expect(saved.projectsIds).toHaveLength(0)
    })
  })

  describe('findById', () => {
    it('should find a user by id', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      const found = await repository.findById(data.id)
      expect(found).not.toBeNull()
      expect(found?.id).toBe(data.id)
    })

    it('should return null when user does not exist', async () => {
      const found = await repository.findById('non-existing-id')
      expect(found).toBeNull()
    })

    it('should return null when user is soft deleted', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      await repository.deleteById(data.id)
      const found = await repository.findById(data.id)
      expect(found).toBeNull()
    })
  })

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      const found = await repository.findByUsername('john_doe')
      expect(found).not.toBeNull()
      expect(found?.username).toBe('john_doe')
    })

    it('should return null when username does not exist', async () => {
      const found = await repository.findByUsername('non_existing')
      expect(found).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      const found = await repository.findByEmail('john@example.com')
      expect(found).not.toBeNull()
      expect(found?.email).toBe('john@example.com')
    })

    it('should return null when email does not exist', async () => {
      const found = await repository.findByEmail('non@existing.com')
      expect(found).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const user1 = new User(uuidv4(), makeUserData({ username: 'user1', email: 'user1@example.com' }))
      const user2 = new User(uuidv4(), makeUserData({ username: 'user2', email: 'user2@example.com' }))
      await repository.save(user1)
      await repository.save(user2)
      const users = await repository.findAll()
      expect(users).toHaveLength(2)
    })

    it('should return empty array when no users exist', async () => {
      const users = await repository.findAll()
      expect(users).toHaveLength(0)
    })

    it('should not return soft deleted users', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      await repository.deleteById(data.id)
      const users = await repository.findAll()
      expect(users).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('should update a user successfully', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      user.username = 'updated_username'
      const updated = await repository.update(user)
      expect(updated.username).toBe('updated_username')
    })

    it('should persist the update in the database', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      user.username = 'updated_username'
      await repository.update(user)
      const found = await prisma.user.findUnique({ where: { id: data.id } })
      expect(found?.username).toBe('updated_username')
    })
  })

  describe('deleteById', () => {
    it('should soft delete a user successfully', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      const result = await repository.deleteById(data.id)
      expect(result).toBe('User has been deleted successfully.')
    })

    it('should set deletedAt in the database', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      await repository.deleteById(data.id)
      const found = await prisma.user.findUnique({ where: { id: data.id } })
      expect(found?.deletedAt).not.toBeNull()
    })

    it('should not physically delete the user from the database', async () => {
      const { User } = await import('../../src/domain/entities/User.js')
      const data = makeUserData()
      const user = new User(data.id, data)
      await repository.save(user)
      await repository.deleteById(data.id)
      const found = await prisma.user.findUnique({ where: { id: data.id } })
      expect(found).not.toBeNull()
    })
  })
})
