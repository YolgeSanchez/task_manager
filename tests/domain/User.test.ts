import { describe, expect, it } from 'vitest'
import { User } from '../../src/domain/entities/User.js'
import { EmptyEmailError } from '../../src/domain/errors/EmptyEmailError.js'
import { EmptyLastNameError } from '../../src/domain/errors/EmptyLastNameError.js'
import { EmptyNameError } from '../../src/domain/errors/EmptyNameError.js'
import { EmptyPasswordError } from '../../src/domain/errors/EmptyPasswordError.js'
import { EmptyUsernameError } from '../../src/domain/errors/EmptyUsernameError.js'
import { InvalidEmailError } from '../../src/domain/errors/InvalidEmailError.js'
import { InvalidLastNameError } from '../../src/domain/errors/InvalidLastNameError.js'
import { InvalidNameError } from '../../src/domain/errors/InvalidNameError.js'
import { InvalidPasswordError } from '../../src/domain/errors/InvalidPasswordError.js'
import { InvalidUsernameError } from '../../src/domain/errors/InvalidUsernameError.js'
import { UserDeletedError } from '../../src/domain/errors/UserDeletedError.js'

const validProps = {
  username: 'john_doe',
  name: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
  projectsIds: [] as string[],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const makeUser = (overrides: Partial<typeof validProps> = {}) =>
  new User('test-id', { ...validProps, ...overrides, projectsIds: overrides.projectsIds ?? [] })

describe('User entity', () => {
  describe('construction', () => {
    it('should create a valid user', () => {
      const user = makeUser()
      expect(user.id).toBe('test-id')
      expect(user.username).toBe('john_doe')
      expect(user.name).toBe('John')
      expect(user.lastName).toBe('Doe')
      expect(user.email).toBe('john@example.com')
    })

    it('should throw EmptyUsernameError when username is empty', () => {
      expect(() => makeUser({ username: '' })).toThrow(EmptyUsernameError)
    })

    it('should throw InvalidUsernameError when username has less than 3 characters', () => {
      expect(() => makeUser({ username: 'ab' })).toThrow(InvalidUsernameError)
    })

    it('should throw InvalidUsernameError when username has special characters', () => {
      expect(() => makeUser({ username: 'john doe!' })).toThrow(InvalidUsernameError)
    })

    it('should throw EmptyNameError when name is empty', () => {
      expect(() => makeUser({ name: '' })).toThrow(EmptyNameError)
    })

    it('should throw InvalidNameError when name has less than 3 characters', () => {
      expect(() => makeUser({ name: 'Jo' })).toThrow(InvalidNameError)
    })

    it('should throw EmptyLastNameError when lastName is empty', () => {
      expect(() => makeUser({ lastName: '' })).toThrow(EmptyLastNameError)
    })

    it('should throw InvalidLastNameError when lastName has less than 3 characters', () => {
      expect(() => makeUser({ lastName: 'Do' })).toThrow(InvalidLastNameError)
    })

    it('should throw EmptyEmailError when email is empty', () => {
      expect(() => makeUser({ email: '' })).toThrow(EmptyEmailError)
    })

    it('should throw InvalidEmailError when email is invalid', () => {
      expect(() => makeUser({ email: 'not-an-email' })).toThrow(InvalidEmailError)
    })

    it('should throw EmptyPasswordError when password is empty', () => {
      expect(() => makeUser({ password: '' })).toThrow(EmptyPasswordError)
    })

    it('should throw InvalidPasswordError when password has less than 8 characters', () => {
      expect(() => makeUser({ password: '1234567' })).toThrow(InvalidPasswordError)
    })
  })

  describe('getters', () => {
    it('should return fullName as concatenation of name and lastName', () => {
      const user = makeUser()
      expect(user.fullName).toBe('John Doe')
    })

    it('should return correct createdAt and updatedAt', () => {
      const createdAt = new Date('2024-01-01')
      const updatedAt = new Date('2024-06-01')
      const user = makeUser({ createdAt, updatedAt })
      expect(user.createdAt).toBe(createdAt)
      expect(user.updatedAt).toBe(updatedAt)
    })
  })

  describe('setters', () => {
    it('should update username correctly', () => {
      const user = makeUser()
      user.username = 'new_username'
      expect(user.username).toBe('new_username')
    })

    it('should update updatedAt when username changes', () => {
      const user = makeUser()
      const before = user.updatedAt
      user.username = 'new_username'
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    })

    it('should throw EmptyUsernameError when setting empty username', () => {
      const user = makeUser()
      expect(() => {
        user.username = ''
      }).toThrow(EmptyUsernameError)
    })

    it('should throw InvalidUsernameError when setting invalid username', () => {
      const user = makeUser()
      expect(() => {
        user.username = 'ab'
      }).toThrow(InvalidUsernameError)
    })

    it('should throw EmptyEmailError when setting empty email', () => {
      const user = makeUser()
      expect(() => {
        user.email = ''
      }).toThrow(EmptyEmailError)
    })

    it('should throw InvalidEmailError when setting invalid email', () => {
      const user = makeUser()
      expect(() => {
        user.email = 'not-an-email'
      }).toThrow(InvalidEmailError)
    })

    it('should throw InvalidPasswordError when setting short password', () => {
      const user = makeUser()
      expect(() => {
        user.password = '123'
      }).toThrow(InvalidPasswordError)
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', () => {
      const user = makeUser()
      expect(() => user.deleteUser()).not.toThrow()
    })

    it('should throw UserDeletedError when deleting already deleted user', () => {
      const user = makeUser()
      user.deleteUser()
      expect(() => user.deleteUser()).toThrow(UserDeletedError)
    })
  })

  describe('project management', () => {
    it('should add a project to the user', () => {
      const user = makeUser()
      user.addProject('project-id-1')
      expect(user.projectsIds).toContain('project-id-1')
    })

    it('should add multiple projects to the user', () => {
      const user = makeUser()
      user.addProject('project-id-1')
      user.addProject('project-id-2')
      expect(user.projectsIds).toHaveLength(2)
      expect(user.projectsIds).toContain('project-id-1')
      expect(user.projectsIds).toContain('project-id-2')
    })

    it('should remove a project from the user', () => {
      const user = makeUser({ projectsIds: ['project-id-1', 'project-id-2'] })
      user.removeProject('project-id-1')
      expect(user.projectsIds).not.toContain('project-id-1')
      expect(user.projectsIds).toContain('project-id-2')
    })

    it('should do nothing when removing a project that does not exist', () => {
      const user = makeUser({ projectsIds: ['project-id-1'] })
      user.removeProject('non-existent-id')
      expect(user.projectsIds).toHaveLength(1)
    })
  })

  describe('toJSON', () => {
    it('should not expose password', () => {
      const user = makeUser()
      const json = user.toJSON()
      expect(json).not.toHaveProperty('password')
    })

    it('should include all expected fields', () => {
      const user = makeUser()
      const json = user.toJSON()
      expect(json).toHaveProperty('id')
      expect(json).toHaveProperty('username')
      expect(json).toHaveProperty('fullName')
      expect(json).toHaveProperty('name')
      expect(json).toHaveProperty('lastName')
      expect(json).toHaveProperty('email')
      expect(json).toHaveProperty('createdAt')
      expect(json).toHaveProperty('updatedAt')
    })
  })
})
