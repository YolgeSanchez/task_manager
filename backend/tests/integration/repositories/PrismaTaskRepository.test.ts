import { v4 as uuidv4 } from 'uuid'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Task } from '../../../src/domain/entities/Task.js'
import { prisma } from '../../../src/infrastructure/persistence/prisma.js'
import { PrismaTaskRepository } from '../../../src/infrastructure/persistence/repositories/PrismaTaskRepository.js'
import { cleanDatabase } from '../helpers/cleanDatabase.js'

const repository = new PrismaTaskRepository()

const makeUserInDb = async (overrides: Partial<{ id: string; username: string; email: string }> = {}) => {
  const id = overrides.id ?? uuidv4()
  return prisma.user.create({
    data: {
      id,
      username: overrides.username ?? `user_${id.slice(0, 8)}`,
      name: 'John',
      lastName: 'Doe',
      email: overrides.email ?? `${id.slice(0, 8)}@example.com`,
      password: 'hashed_password123',
    },
  })
}

const makeProjectInDb = async (ownerId: string, overrides: Partial<{ id: string; name: string }> = {}) => {
  const id = overrides.id ?? uuidv4()
  return prisma.project.create({
    data: {
      id,
      name: overrides.name ?? 'Test Project',
      ownerId,
    },
  })
}

const makeTaskData = (
  userId: string,
  overrides: Partial<{
    id: string
    name: string
    status: 'in_process' | 'completed' | 'cancelled'
    projectId: string | null
  }> = {},
) => ({
  id: overrides.id ?? uuidv4(),
  name: overrides.name ?? 'Test Task',
  description: 'Task description',
  status: overrides.status ?? ('in_process' as const),
  userId,
  projectId: overrides.projectId ?? null,
  createdAt: new Date(),
  deadline: new Date(Date.now() + 86400000), // +1 día
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

describe('PrismaTaskRepository', () => {
  describe('save', () => {
    it('should save a task successfully without a project', async () => {
      const user = await makeUserInDb()
      const data = makeTaskData(user.id)
      const task = new Task(data.id, data)
      const saved = await repository.save(task)
      expect(saved.id).toBe(data.id)
      expect(saved.name).toBe('Test Task')
      expect(saved.userId).toBe(user.id)
      expect(saved.projectId).toBeNull()
    })

    it('should save a task successfully with a project', async () => {
      const user = await makeUserInDb()
      const project = await makeProjectInDb(user.id)
      const data = makeTaskData(user.id, { projectId: project.id })
      const task = new Task(data.id, data)
      const saved = await repository.save(task)
      expect(saved.projectId).toBe(project.id)
    })

    it('should persist the task in the database', async () => {
      const user = await makeUserInDb()
      const data = makeTaskData(user.id)
      const task = new Task(data.id, data)
      await repository.save(task)
      const found = await prisma.task.findUnique({ where: { id: data.id } })
      expect(found).not.toBeNull()
      expect(found?.name).toBe('Test Task')
    })

    it('should throw when userId does not reference an existing user', async () => {
      const data = makeTaskData('non-existing-user-id')
      const task = new Task(data.id, data)
      await expect(repository.save(task)).rejects.toThrow()
    })
  })

  describe('findById', () => {
    it('should find a task by id', async () => {
      const user = await makeUserInDb()
      const data = makeTaskData(user.id)
      const task = new Task(data.id, data)
      await repository.save(task)
      const found = await repository.findById(data.id)
      expect(found).not.toBeNull()
      expect(found?.id).toBe(data.id)
    })

    it('should return null when task does not exist', async () => {
      const found = await repository.findById('non-existing-id')
      expect(found).toBeNull()
    })
  })

  describe('findAllByUserId', () => {
    it('should return all tasks belonging to the given user', async () => {
      const user = await makeUserInDb()
      const data1 = makeTaskData(user.id, { name: 'Task 1' })
      const data2 = makeTaskData(user.id, { name: 'Task 2' })
      await repository.save(new Task(data1.id, data1))
      await repository.save(new Task(data2.id, data2))
      const tasks = await repository.findAllByUserId(user.id)
      expect(tasks).toHaveLength(2)
    })

    it('should return empty array when user has no tasks', async () => {
      const user = await makeUserInDb()
      const tasks = await repository.findAllByUserId(user.id)
      expect(tasks).toHaveLength(0)
    })

    it('should not return tasks belonging to another user', async () => {
      const userA = await makeUserInDb()
      const userB = await makeUserInDb()

      const dataA = makeTaskData(userA.id, { name: 'Task A' })
      const dataB = makeTaskData(userB.id, { name: 'Task B' })
      await repository.save(new Task(dataA.id, dataA))
      await repository.save(new Task(dataB.id, dataB))

      const tasks = await repository.findAllByUserId(userA.id)
      expect(tasks).toHaveLength(1)
      expect(tasks[0].id).toBe(dataA.id)
    })
  })

  describe('findAllByProjectId', () => {
    it('should return only tasks belonging to the given project', async () => {
      const user = await makeUserInDb()
      const project = await makeProjectInDb(user.id)
      const otherProject = await makeProjectInDb(user.id, { id: uuidv4(), name: 'Other Project' })

      const dataInProject = makeTaskData(user.id, { projectId: project.id })
      const dataInOtherProject = makeTaskData(user.id, { projectId: otherProject.id })
      const dataWithoutProject = makeTaskData(user.id)

      await repository.save(new Task(dataInProject.id, dataInProject))
      await repository.save(new Task(dataInOtherProject.id, dataInOtherProject))
      await repository.save(new Task(dataWithoutProject.id, dataWithoutProject))

      const tasks = await repository.findAllByProjectId(project.id)
      expect(tasks).toHaveLength(1)
      expect(tasks[0].id).toBe(dataInProject.id)
    })

    it('should return empty array when project has no tasks', async () => {
      const user = await makeUserInDb()
      const project = await makeProjectInDb(user.id)
      const tasks = await repository.findAllByProjectId(project.id)
      expect(tasks).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('should update a task successfully', async () => {
      const user = await makeUserInDb()
      const data = makeTaskData(user.id)
      const task = new Task(data.id, data)
      await repository.save(task)
      task.name = 'Updated Task'
      task.status = 'completed'
      const updated = await repository.update(task)
      expect(updated.name).toBe('Updated Task')
      expect(updated.status).toBe('completed')
    })

    it('should persist the update in the database', async () => {
      const user = await makeUserInDb()
      const data = makeTaskData(user.id)
      const task = new Task(data.id, data)
      await repository.save(task)
      task.name = 'Updated Task'
      await repository.update(task)
      const found = await prisma.task.findUnique({ where: { id: data.id } })
      expect(found?.name).toBe('Updated Task')
    })
  })

  describe('deleteById', () => {
    it('should delete a task successfully', async () => {
      const user = await makeUserInDb()
      const data = makeTaskData(user.id)
      const task = new Task(data.id, data)
      await repository.save(task)
      const result = await repository.deleteById(data.id)
      expect(result).toBe('Task has been deleted successfully.')
    })

    it('should physically remove the task from the database', async () => {
      const user = await makeUserInDb()
      const data = makeTaskData(user.id)
      const task = new Task(data.id, data)
      await repository.save(task)
      await repository.deleteById(data.id)
      const found = await prisma.task.findUnique({ where: { id: data.id } })
      expect(found).toBeNull()
    })
  })
})
