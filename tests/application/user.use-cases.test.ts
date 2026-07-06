import { beforeEach, describe, expect, it } from 'vitest'
import { UserNotFoundError } from '../../src/application/errors/UserNotFoundError.js'
import { DeleteUserUseCase } from '../../src/application/use-cases/user/DeleteUserUseCase.js'
import { FindAllUsersUseCase } from '../../src/application/use-cases/user/FindAllUsersUseCase.js'
import { FindUserByIdUseCase } from '../../src/application/use-cases/user/FindUserByIdUseCase.js'
import { UpdateUserUseCase } from '../../src/application/use-cases/user/UpdateUserUseCase.js'
import { User } from '../../src/domain/entities/User.js'
import { EmptyUsernameError } from '../../src/domain/errors/EmptyUsernameError.js'
import { InvalidEmailError } from '../../src/domain/errors/InvalidEmailError.js'
import { InvalidPasswordError } from '../../src/domain/errors/InvalidPasswordError.js'
import type { UserRepository } from '../../src/domain/repositories/UserRepository.js'
import type { ID, SuccessMessage } from '../../src/domain/types/types.js'

// [ fake ]
class FakeUserRepository implements UserRepository {
  public users: User[] = []

  constructor(initialUsers: User[] = []) {
    this.users = initialUsers
  }

  async save(user: User): Promise<User> {
    this.users.push(user)
    return user
  }

  async update(user: User): Promise<User> {
    const idx = this.users.findIndex((u) => u.id === user.id)
    if (idx !== -1) this.users[idx] = user
    return user
  }

  async deleteById(id: ID): Promise<SuccessMessage> {
    this.users = this.users.filter((u) => u.id !== id)
    return 'User has been deleted successfully.'
  }

  async findAll(): Promise<User[]> {
    return this.users
  }

  async findById(id: ID): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find((u) => u.username === username) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null
  }
}

// [ helpers ]
const makeUser = (overrides: Partial<{ id: string; username: string; email: string }> = {}) =>
  new User(overrides.id ?? 'user-id-1', {
    username: overrides.username ?? 'john_doe',
    name: 'John',
    lastName: 'Doe',
    email: overrides.email ?? 'john@example.com',
    password: 'password123',
    projectsIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

// [ tests ]
describe('FindUserByIdUseCase', () => {
  let userRepository: FakeUserRepository
  let useCase: FindUserByIdUseCase

  beforeEach(() => {
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new FindUserByIdUseCase(userRepository)
  })

  it('should find a user by id', async () => {
    const result = await useCase.execute('user-id-1')
    expect(result.id).toBe('user-id-1')
    expect(result.username).toBe('john_doe')
  })

  it('should throw UserNotFoundError when user does not exist', async () => {
    await expect(useCase.execute('non-existing-id')).rejects.toThrow(UserNotFoundError)
  })

  it('should not expose password in the result', async () => {
    const result = await useCase.execute('user-id-1')
    expect(result).not.toHaveProperty('password')
  })

  it('should return fullName correctly', async () => {
    const result = await useCase.execute('user-id-1')
    expect(result.fullName).toBe('John Doe')
  })
})

describe('FindAllUsersUseCase', () => {
  let userRepository: FakeUserRepository
  let useCase: FindAllUsersUseCase

  beforeEach(() => {
    userRepository = new FakeUserRepository()
    useCase = new FindAllUsersUseCase(userRepository)
  })

  it('should return all users', async () => {
    userRepository.users.push(
      makeUser({ id: 'user-id-1', username: 'john_doe', email: 'john@example.com' }),
      makeUser({ id: 'user-id-2', username: 'jane_doe', email: 'jane@example.com' }),
    )
    const result = await useCase.execute()
    expect(result).toHaveLength(2)
  })

  it('should return empty array when no users exist', async () => {
    const result = await useCase.execute()
    expect(result).toHaveLength(0)
  })

  it('should not expose passwords in the result', async () => {
    userRepository.users.push(makeUser())
    const result = await useCase.execute()
    result.forEach((user) => expect(user).not.toHaveProperty('password'))
  })
})

describe('UpdateUserUseCase', () => {
  let userRepository: FakeUserRepository
  let useCase: UpdateUserUseCase

  beforeEach(() => {
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new UpdateUserUseCase(userRepository)
  })

  it('should update username successfully', async () => {
    const result = await useCase.execute('user-id-1', { username: 'new_username' })
    expect(result.username).toBe('new_username')
  })

  it('should update name successfully', async () => {
    const result = await useCase.execute('user-id-1', { name: 'Jane' })
    expect(result.name).toBe('Jane')
  })

  it('should update email successfully', async () => {
    const result = await useCase.execute('user-id-1', { email: 'newemail@example.com' })
    expect(result.email).toBe('newemail@example.com')
  })

  it('should update multiple fields at once', async () => {
    const result = await useCase.execute('user-id-1', {
      username: 'updated_user',
      name: 'Updated',
    })
    expect(result.username).toBe('updated_user')
    expect(result.name).toBe('Updated')
  })

  it('should throw UserNotFoundError when user does not exist', async () => {
    await expect(useCase.execute('non-existing-id', { username: 'new_username' })).rejects.toThrow(
      UserNotFoundError,
    )
  })

  it('should throw EmptyUsernameError when setting empty username', async () => {
    await expect(useCase.execute('user-id-1', { username: '' })).rejects.toThrow(EmptyUsernameError)
  })

  it('should throw InvalidEmailError when setting invalid email', async () => {
    await expect(useCase.execute('user-id-1', { email: 'not-an-email' })).rejects.toThrow(InvalidEmailError)
  })

  it('should throw InvalidPasswordError when setting short password', async () => {
    await expect(useCase.execute('user-id-1', { password: '123' })).rejects.toThrow(InvalidPasswordError)
  })

  it('should not modify fields that are not passed', async () => {
    await useCase.execute('user-id-1', { username: 'new_username' })
    const result = await useCase.execute('user-id-1', { name: 'Jane' })
    expect(result.username).toBe('new_username')
    expect(result.name).toBe('Jane')
    expect(result.email).toBe('john@example.com')
  })
})

describe('DeleteUserUseCase', () => {
  let userRepository: FakeUserRepository
  let useCase: DeleteUserUseCase

  beforeEach(() => {
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new DeleteUserUseCase(userRepository)
  })

  it('should delete a user successfully', async () => {
    const result = await useCase.execute('user-id-1')
    expect(result).toBe('User has been deleted successfully.')
  })

  it('should throw UserNotFoundError when user does not exist', async () => {
    await expect(useCase.execute('non-existing-id')).rejects.toThrow(UserNotFoundError)
  })

  it('should make user unfindable after deletion', async () => {
    await useCase.execute('user-id-1')
    const findUseCase = new FindUserByIdUseCase(userRepository)
    await expect(findUseCase.execute('user-id-1')).rejects.toThrow(UserNotFoundError)
  })
})
