import { v4 as uuidv4 } from 'uuid'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../src/domain/entities/Project.js'
import { prisma } from '../../src/infraestructure/libs/prisma.js'
import { PrismaProjectRepository } from '../../src/infraestructure/repositories/PrismaProjectRepository.js'
import { cleanDatabase } from './helpers/cleanDatabase.js'

const repository = new PrismaProjectRepository()

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

const makeProjectData = (ownerId: string, overrides: Partial<{ id: string; name: string }> = {}) => ({
  id: overrides.id ?? uuidv4(),
  name: overrides.name ?? 'Test Project',
  ownerId,
  createdAt: new Date(),
  membersIds: [] as string[],
  tasksIds: [] as string[],
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

describe('PrismaProjectRepository', () => {
  describe('save', () => {
    it('should save a project successfully', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      const saved = await repository.save(project)
      expect(saved.id).toBe(data.id)
      expect(saved.name).toBe('Test Project')
      expect(saved.ownerId).toBe(owner.id)
    })

    it('should persist the project in the database', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      await repository.save(project)
      const found = await prisma.project.findUnique({ where: { id: data.id } })
      expect(found).not.toBeNull()
      expect(found?.name).toBe('Test Project')
    })

    it('should automatically add the owner as a member', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      const saved = await repository.save(project)
      expect(saved.membersIds).toContain(owner.id)
    })

    it('should throw when ownerId does not reference an existing user', async () => {
      const data = makeProjectData('non-existing-user-id')
      const project = new Project(data.id, data)
      await expect(repository.save(project)).rejects.toThrow()
    })
  })

  describe('findById', () => {
    it('should find a project by id', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      await repository.save(project)
      const found = await repository.findById(data.id)
      expect(found).not.toBeNull()
      expect(found?.id).toBe(data.id)
    })

    it('should return null when project does not exist', async () => {
      const found = await repository.findById('non-existing-id')
      expect(found).toBeNull()
    })

    it('should return null when project is soft deleted', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      await repository.save(project)
      await repository.deleteById(data.id)
      const found = await repository.findById(data.id)
      expect(found).toBeNull()
    })
  })

  describe('findAllUserProjects', () => {
    it('should return projects where the user is a member (owner)', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      await repository.save(project)
      const projects = await repository.findAllUserProjects(owner.id)
      expect(projects).toHaveLength(1)
      expect(projects[0].id).toBe(data.id)
    })

    it('should return projects where the user was added as a member (not owner)', async () => {
      const owner = await makeUserInDb()
      const member = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      const saved = await repository.save(project)

      saved.addMember(member.id)
      await repository.update(saved)

      const projects = await repository.findAllUserProjects(member.id)
      expect(projects).toHaveLength(1)
      expect(projects[0].id).toBe(data.id)
    })

    it('should return empty array when user has no projects', async () => {
      const user = await makeUserInDb()
      const projects = await repository.findAllUserProjects(user.id)
      expect(projects).toHaveLength(0)
    })

    it('should not return soft deleted projects', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      await repository.save(project)
      await repository.deleteById(data.id)
      const projects = await repository.findAllUserProjects(owner.id)
      expect(projects).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('should update a project name', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      const saved = await repository.save(project)
      saved.name = 'Updated Project'
      const updated = await repository.update(saved)
      expect(updated.name).toBe('Updated Project')
    })

    it('should persist the update in the database', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      const saved = await repository.save(project)
      saved.name = 'Updated Project'
      await repository.update(saved)
      const found = await prisma.project.findUnique({ where: { id: data.id } })
      expect(found?.name).toBe('Updated Project')
    })

    it('should add a new member and persist it', async () => {
      const owner = await makeUserInDb()
      const newMember = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      const saved = await repository.save(project)

      saved.addMember(newMember.id)
      const updated = await repository.update(saved)

      expect(updated.membersIds).toContain(owner.id)
      expect(updated.membersIds).toContain(newMember.id)
      expect(updated.membersIds).toHaveLength(2)
    })

    it('should remove a member (not the owner) and persist it', async () => {
      const owner = await makeUserInDb()
      const member = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      const saved = await repository.save(project)

      saved.addMember(member.id)
      await repository.update(saved)

      saved.removeMember(member.id)
      const updated = await repository.update(saved)

      expect(updated.membersIds).not.toContain(member.id)
      expect(updated.membersIds).toContain(owner.id)
    })
  })

  describe('deleteById', () => {
    it('should soft delete a project successfully', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      await repository.save(project)
      const result = await repository.deleteById(data.id)
      expect(result).toBe('Project has been deleted successfully.')
    })

    it('should set deletedAt in the database', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      await repository.save(project)
      await repository.deleteById(data.id)
      const found = await prisma.project.findUnique({ where: { id: data.id } })
      expect(found?.deletedAt).not.toBeNull()
    })

    it('should not physically delete the project from the database', async () => {
      const owner = await makeUserInDb()
      const data = makeProjectData(owner.id)
      const project = new Project(data.id, data)
      await repository.save(project)
      await repository.deleteById(data.id)
      const found = await prisma.project.findUnique({ where: { id: data.id } })
      expect(found).not.toBeNull()
    })
  })
})
