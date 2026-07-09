import { describe, expect, it } from 'vitest'
import { Project } from '../../src/domain/entities/Project.js'
import { DeleteProjectOwnerError } from '../../src/domain/errors/DeleteProjectOwnerError.js'
import { EmptyNameError } from '../../src/domain/errors/EmptyNameError.js'
import { InvalidNameError } from '../../src/domain/errors/InvalidNameError.js'
import { MemberAlreadyInProjectError } from '../../src/domain/errors/MemberAlreadyInProjectError.js'
import { MemberNotInProjectError } from '../../src/domain/errors/MemberNotInProjectError.js'
import { ProjectDeletedError } from '../../src/domain/errors/ProjectDeletedError.js'
import { TaskAlreadyInProjectError } from '../../src/domain/errors/TaskAlreadyInProjectError.js'
import { TaskNotInProjectError } from '../../src/domain/errors/TaskNotInProjectError.js'

const validProps = {
  name: 'Test Project',
  ownerId: 'owner-id-1',
  tasksIds: [] as string[],
  membersIds: ['owner-id-1'] as string[],
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
}

const makeProject = (overrides: Partial<typeof validProps> = {}) =>
  new Project('project-id-1', {
    ...validProps,
    ...overrides,
    tasksIds: overrides.tasksIds ?? [],
    membersIds: overrides.membersIds ?? ['owner-id-1'],
  })

describe('Project entity', () => {
  describe('construction', () => {
    it('should create a valid project', () => {
      const project = makeProject()
      expect(project.id).toBe('project-id-1')
      expect(project.name).toBe('Test Project')
      expect(project.ownerId).toBe('owner-id-1')
    })

    it('should throw EmptyNameError when name is empty', () => {
      expect(() => makeProject({ name: '' })).toThrow(EmptyNameError)
    })

    it('should throw InvalidNameError when name has less than 3 characters', () => {
      expect(() => makeProject({ name: 'ab' })).toThrow(InvalidNameError)
    })
  })

  describe('name setter', () => {
    it('should update name correctly', () => {
      const project = makeProject()
      project.name = 'Updated Project'
      expect(project.name).toBe('Updated Project')
    })

    it('should throw EmptyNameError when setting empty name', () => {
      const project = makeProject()
      expect(() => {
        project.name = ''
      }).toThrow(EmptyNameError)
    })

    it('should throw InvalidNameError when setting name with less than 3 characters', () => {
      const project = makeProject()
      expect(() => {
        project.name = 'ab'
      }).toThrow(InvalidNameError)
    })
  })

  describe('deleteProject', () => {
    it('should delete project successfully', () => {
      const project = makeProject()
      expect(() => project.deleteProject()).not.toThrow()
    })

    it('should throw ProjectDeletedError when deleting already deleted project', () => {
      const project = makeProject()
      project.deleteProject()
      expect(() => project.deleteProject()).toThrow(ProjectDeletedError)
    })
  })

  describe('member management', () => {
    it('should add a member to the project', () => {
      const project = makeProject()
      project.addMember('member-id-1')
      expect(project.membersIds).toContain('member-id-1')
    })

    it('should throw MemberAlreadyInProjectError when adding existing member', () => {
      const project = makeProject({ membersIds: ['owner-id-1', 'member-id-1'] })
      expect(() => project.addMember('member-id-1')).toThrow(MemberAlreadyInProjectError)
    })

    it('should remove a member from the project', () => {
      const project = makeProject({ membersIds: ['owner-id-1', 'member-id-1'] })
      project.removeMember('member-id-1')
      expect(project.membersIds).not.toContain('member-id-1')
    })

    it('should keep remaining members after removing one', () => {
      const project = makeProject({ membersIds: ['owner-id-1', 'member-id-1', 'member-id-2'] })
      project.removeMember('member-id-1')
      expect(project.membersIds).toContain('owner-id-1')
      expect(project.membersIds).toContain('member-id-2')
      expect(project.membersIds).toHaveLength(2)
    })

    it('should throw DeleteProjectOwnerError when removing the owner', () => {
      const project = makeProject()
      expect(() => project.removeMember('owner-id-1')).toThrow(DeleteProjectOwnerError)
    })

    it('should throw MemberNotInProjectError when removing non-existing member', () => {
      const project = makeProject()
      expect(() => project.removeMember('non-existing-id')).toThrow(MemberNotInProjectError)
    })
  })

  describe('task management', () => {
    it('should add a task to the project', () => {
      const project = makeProject()
      project.addTask('task-id-1')
      expect(project.tasksIds).toContain('task-id-1')
    })

    it('should throw TaskAlreadyInProjectError when adding existing task', () => {
      const project = makeProject({ tasksIds: ['task-id-1'] })
      expect(() => project.addTask('task-id-1')).toThrow(TaskAlreadyInProjectError)
    })

    it('should remove a task from the project', () => {
      const project = makeProject({ tasksIds: ['task-id-1', 'task-id-2'] })
      project.removeTask('task-id-1')
      expect(project.tasksIds).not.toContain('task-id-1')
      expect(project.tasksIds).toContain('task-id-2')
    })

    it('should keep remaining tasks after removing one', () => {
      const project = makeProject({ tasksIds: ['task-id-1', 'task-id-2', 'task-id-3'] })
      project.removeTask('task-id-2')
      expect(project.tasksIds).toHaveLength(2)
      expect(project.tasksIds).toContain('task-id-1')
      expect(project.tasksIds).toContain('task-id-3')
    })

    it('should throw TaskNotInProjectError when removing non-existing task', () => {
      const project = makeProject()
      expect(() => project.removeTask('non-existing-id')).toThrow(TaskNotInProjectError)
    })
  })

  describe('toJSON', () => {
    it('should include all expected fields', () => {
      const project = makeProject()
      const json = project.toJSON()
      expect(json).toHaveProperty('id')
      expect(json).toHaveProperty('name')
      expect(json).toHaveProperty('ownerId')
      expect(json).toHaveProperty('tasksIds')
      expect(json).toHaveProperty('membersIds')
      expect(json).toHaveProperty('createdAt')
    })

    it('should reflect updated name after setter', () => {
      const project = makeProject()
      project.name = 'Updated Project'
      expect(project.toJSON().name).toBe('Updated Project')
    })
  })
})
