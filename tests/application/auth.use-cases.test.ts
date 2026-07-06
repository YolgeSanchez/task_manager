import { beforeEach, describe, expect, it } from 'vitest'
import { EmailInUseError } from '../../src/application/errors/EmailInUseError.js'
import { UsernameInUseError } from '../../src/application/errors/UsernameInUseError.js'
import { UserNotFoundError } from '../../src/application/errors/UserNotFoundError.js'
import { SignInUseCase } from '../../src/application/use-cases/auth/SignInUseCase.js'
import { SignUpUseCase } from '../../src/application/use-cases/auth/SignUpUseCase.js'
import { User } from '../../src/domain/entities/User.js'
import type { UserRepository } from '../../src/domain/repositories/UserRepository.js'
import type { PasswordHasher } from '../../src/domain/services/PasswordHasher.js'
import type { TokenPayload, TokenService } from '../../src/domain/services/TokenService.js'
import type { ID, SuccessMessage, Token } from '../../src/domain/types/types.js'

// [ fakes ]
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

class FakePasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return `hashed_${password}`
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return hashedPassword === `hashed_${password}`
  }
}

class FakeTokenService implements TokenService {
  async generateToken(payload: TokenPayload): Promise<Token> {
    return `fake_token_${payload.sub}`
  }

  async verifyToken(token: Token): Promise<TokenPayload | null> {
    if (!token.startsWith('fake_token_')) return null
    const sub = token.replace('fake_token_', '')
    return { sub, username: 'john_doe' }
  }

  async decodeToken(token: Token): Promise<TokenPayload | null> {
    return this.verifyToken(token)
  }
}

// [ helpers ]
const makeUser = (
  overrides: Partial<{ id: string; username: string; email: string; password: string }> = {},
) =>
  new User(overrides.id ?? 'user-id-1', {
    username: overrides.username ?? 'john_doe',
    name: 'John',
    lastName: 'Doe',
    email: overrides.email ?? 'john@example.com',
    password: overrides.password ?? 'hashed_password123',
    projectsIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

const validUserInput = {
  username: 'john_doe',
  name: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
}

// [ tests ]
describe('SignUpUseCase', () => {
  let userRepository: FakeUserRepository
  let passwordHasher: FakePasswordHasher
  let tokenService: FakeTokenService
  let useCase: SignUpUseCase

  beforeEach(() => {
    userRepository = new FakeUserRepository()
    passwordHasher = new FakePasswordHasher()
    tokenService = new FakeTokenService()
    useCase = new SignUpUseCase(userRepository, tokenService, passwordHasher)
  })

  it('should sign up a user successfully', async () => {
    const result = await useCase.execute(validUserInput)
    expect(result.user.username).toBe('john_doe')
    expect(result.user.email).toBe('john@example.com')
  })

  it('should return a token on sign up', async () => {
    const result = await useCase.execute(validUserInput)
    expect(result.token).toBeDefined()
    expect(result.token.length).toBeGreaterThan(0)
  })

  it('should hash the password before saving', async () => {
    await useCase.execute(validUserInput)
    const saved = userRepository.users[0]
    expect(saved?.password).toBe('hashed_password123')
    expect(saved?.password).not.toBe('password123')
  })

  it('should not expose password in the result', async () => {
    const result = await useCase.execute(validUserInput)
    expect(result.user).not.toHaveProperty('password')
  })

  it('should throw UsernameInUseError when username already exists', async () => {
    userRepository.users.push(makeUser())
    await expect(useCase.execute(validUserInput)).rejects.toThrow(UsernameInUseError)
  })

  it('should throw EmailInUseError when email already exists', async () => {
    userRepository.users.push(makeUser({ username: 'other_user' }))
    await expect(useCase.execute(validUserInput)).rejects.toThrow(EmailInUseError)
  })

  it('should generate a unique id for each user', async () => {
    const result1 = await useCase.execute(validUserInput)
    userRepository.users = []
    const result2 = await useCase.execute(validUserInput)
    expect(result1.user.id).not.toBe(result2.user.id)
  })
})

describe('SignInUseCase', () => {
  let userRepository: FakeUserRepository
  let passwordHasher: FakePasswordHasher
  let tokenService: FakeTokenService
  let useCase: SignInUseCase

  beforeEach(() => {
    userRepository = new FakeUserRepository([makeUser()])
    passwordHasher = new FakePasswordHasher()
    tokenService = new FakeTokenService()
    useCase = new SignInUseCase(userRepository, tokenService, passwordHasher)
  })

  it('should sign in successfully with valid credentials', async () => {
    const result = await useCase.execute('john_doe', 'password123')
    expect(result.token).toBeDefined()
    expect(result.token.length).toBeGreaterThan(0)
  })

  it('should throw UserNotFoundError when username does not exist', async () => {
    await expect(useCase.execute('non_existing_user', 'password123')).rejects.toThrow(UserNotFoundError)
  })

  it('should throw UserNotFoundError when password is incorrect', async () => {
    await expect(useCase.execute('john_doe', 'wrong_password')).rejects.toThrow(UserNotFoundError)
  })

  it('should not reveal whether username or password is wrong', async () => {
    const wrongUsername = useCase.execute('non_existing', 'password123').catch((e) => e)
    const wrongPassword = useCase.execute('john_doe', 'wrong_password').catch((e) => e)
    const [err1, err2] = await Promise.all([wrongUsername, wrongPassword])
    expect(err1).toBeInstanceOf(UserNotFoundError)
    expect(err2).toBeInstanceOf(UserNotFoundError)
  })

  it('should generate a token containing the user id', async () => {
    const result = await useCase.execute('john_doe', 'password123')
    expect(result.token).toContain('user-id-1')
  })
})
