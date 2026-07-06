import { describe, expect, it } from 'vitest'
import { Task } from '../../src/domain/entities/Task.js'
import { EarlyDeadlineError } from '../../src/domain/errors/EarlyDeadlineError.js'
import { EmptyNameError } from '../../src/domain/errors/EmptyNameError.js'
import type { TaskStatus } from '../../src/generated/prisma/enums.js'

const now = new Date('2025-01-01T00:00:00.000Z')
const future = new Date('2025-12-31T00:00:00.000Z')
const past = new Date('2024-01-01T00:00:00.000Z')

const validProps = {
  name: 'Test Task',
  description: 'Test description',
  status: 'in_process' as const,
  userId: 'user-id-1',
  projectId: null as string | null,
  createdAt: now,
  deadline: future,
}

const makeTask = (overrides: Partial<typeof validProps> = {}) =>
  new Task('task-id-1', { ...validProps, ...overrides })

describe('Task entity', () => {
  describe('construction', () => {
    it('should create a valid task', () => {
      const task = makeTask()
      expect(task.id).toBe('task-id-1')
      expect(task.name).toBe('Test Task')
      expect(task.description).toBe('Test description')
      expect(task.status).toBe('in_process')
      expect(task.userId).toBe('user-id-1')
      expect(task.projectId).toBeNull()
    })

    it('should throw EmptyNameError when name is empty', () => {
      expect(() => makeTask({ name: '' })).toThrow(EmptyNameError)
    })

    it('should throw EarlyDeadlineError when deadline is before createdAt', () => {
      expect(() => makeTask({ deadline: past })).toThrow(EarlyDeadlineError)
    })

    it('should throw EarlyDeadlineError when deadline equals createdAt', () => {
      expect(() => makeTask({ deadline: now })).toThrow(EarlyDeadlineError)
    })

    it('should create task with a projectId', () => {
      const task = makeTask({ projectId: 'project-id-1' })
      expect(task.projectId).toBe('project-id-1')
    })
  })

  describe('getters', () => {
    it('should return correct userId', () => {
      const task = makeTask()
      expect(task.userId).toBe('user-id-1')
    })

    it('should return correct createdAt', () => {
      const task = makeTask()
      expect(task.createdAt).toBe(now)
    })

    it('should return correct deadline', () => {
      const task = makeTask()
      expect(task.deadline).toBe(future)
    })
  })

  describe('setters', () => {
    it('should update name correctly', () => {
      const task = makeTask()
      task.name = 'Updated Task'
      expect(task.name).toBe('Updated Task')
    })

    it('should throw EmptyNameError when setting empty name', () => {
      const task = makeTask()
      expect(() => {
        task.name = ''
      }).toThrow(EmptyNameError)
    })

    it('should update description correctly', () => {
      const task = makeTask()
      task.description = 'Updated description'
      expect(task.description).toBe('Updated description')
    })

    it('should update status correctly', () => {
      const task = makeTask()
      task.status = 'completed'
      expect(task.status).toBe('completed')
    })

    it('should not update status when value is invalid', () => {
      const task = makeTask()
      task.status = 'invalid_status' as unknown as TaskStatus
      expect(task.status).toBe('in_process')
    })

    it('should update deadline correctly', () => {
      const task = makeTask()
      const newDeadline = new Date('2026-06-01T00:00:00.000Z')
      task.deadline = newDeadline
      expect(task.deadline).toBe(newDeadline)
    })

    it('should throw EarlyDeadlineError when setting deadline before createdAt', () => {
      const task = makeTask()
      expect(() => {
        task.deadline = past
      }).toThrow(EarlyDeadlineError)
    })
  })

  describe('project management', () => {
    it('should add task to a project', () => {
      const task = makeTask()
      task.addToProject('project-id-1')
      expect(task.projectId).toBe('project-id-1')
    })

    it('should remove task from project', () => {
      const task = makeTask({ projectId: 'project-id-1' })
      task.removeFromProject()
      expect(task.projectId).toBeNull()
    })

    it('should override projectId when adding to a new project', () => {
      const task = makeTask({ projectId: 'project-id-1' })
      task.addToProject('project-id-2')
      expect(task.projectId).toBe('project-id-2')
    })
  })

  describe('toJSON', () => {
    it('should include all expected fields', () => {
      const task = makeTask()
      const json = task.toJSON()
      expect(json).toHaveProperty('id')
      expect(json).toHaveProperty('name')
      expect(json).toHaveProperty('description')
      expect(json).toHaveProperty('status')
      expect(json).toHaveProperty('userId')
      expect(json).toHaveProperty('projectId')
      expect(json).toHaveProperty('createdAt')
      expect(json).toHaveProperty('deadline')
    })

    it('should reflect updated values after setters', () => {
      const task = makeTask()
      task.name = 'Updated Task'
      task.status = 'completed'
      const json = task.toJSON()
      expect(json.name).toBe('Updated Task')
      expect(json.status).toBe('completed')
    })
  })
})
