import { beforeEach, describe, expect, it } from 'vitest'
import { NotAuthorizedToPerformError } from '../../src/application/errors/NotAuthorizedToPerformError.js'
import { TaskNotFoundError } from '../../src/application/errors/TaskNotFoundError.js'
import { UserNotFoundError } from '../../src/application/errors/UserNotFoundError.js'
import { CreateTaskUseCase } from '../../src/application/use-cases/task/CreateTaskUseCase.js'
import { DeleteTaskUseCase } from '../../src/application/use-cases/task/DeleteTaskUseCase.js'
import { FindTaskByIdUseCase } from '../../src/application/use-cases/task/FindTaskByIdUseCase.js'
import { UpdateTaskUseCase } from '../../src/application/use-cases/task/UpdateTaskUseCase.js'
import type { Task } from '../../src/domain/entities/Task.js'
import { User } from '../../src/domain/entities/User.js'
import type { TaskRepository } from '../../src/domain/repositories/TaskRepository.js'
import type { UserRepository } from '../../src/domain/repositories/UserRepository.js'
import type { ID, SuccessMessage } from '../../src/domain/types/types.js'

// [ fakes ]
class FakeTaskRepository implements TaskRepository {
  private tasks: Task[] = []

  async save(task: Task): Promise<Task> {
    this.tasks.push(task)
    return task
  }

  async update(task: Task): Promise<Task> {
    const idx = this.tasks.findIndex((t) => t.id === task.id)
    if (idx !== -1) this.tasks[idx] = task
    return task
  }

  async deleteById(id: ID): Promise<SuccessMessage> {
    this.tasks = this.tasks.filter((t) => t.id !== id)
    return 'Task has been deleted successfully.'
  }

  async findAll(): Promise<Task[]> {
    return this.tasks
  }

  async findAllByProjectId(projectId: ID): Promise<Task[]> {
    return this.tasks.filter((t) => t.projectId === projectId)
  }

  async findById(id: ID): Promise<Task | null> {
    return this.tasks.find((t) => t.id === id) ?? null
  }
}

class FakeUserRepository implements UserRepository {
  private users: User[] = []

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
const makeUser = (overrides: Partial<{ id: string; username: string }> = {}) =>
  new User(overrides.id ?? 'user-id-1', {
    username: overrides.username ?? 'john_doe',
    name: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    projectsIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

const makeTaskInput = (overrides = {}) => ({
  name: 'Test Task',
  description: 'Test description',
  status: 'in_process' as const,
  deadline: new Date('2026-12-31T00:00:00.000Z'),
  ...overrides,
})

// [ tests ]
describe('CreateTaskUseCase', () => {
  let taskRepository: FakeTaskRepository
  let userRepository: FakeUserRepository
  let useCase: CreateTaskUseCase

  beforeEach(() => {
    taskRepository = new FakeTaskRepository()
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new CreateTaskUseCase(taskRepository, userRepository)
  })

  it('should create a task successfully', async () => {
    const result = await useCase.execute(makeTaskInput(), 'user-id-1')
    expect(result.name).toBe('Test Task')
    expect(result.userId).toBe('user-id-1')
    expect(result.status).toBe('in_process')
  })

  it('should throw UserNotFoundError when user does not exist', async () => {
    await expect(useCase.execute(makeTaskInput(), 'non-existing-id')).rejects.toThrow(UserNotFoundError)
  })

  it('should assign projectId as null by default', async () => {
    const result = await useCase.execute(makeTaskInput(), 'user-id-1')
    expect(result.projectId).toBeNull()
  })

  it('should generate a unique id for each task', async () => {
    const result1 = await useCase.execute(makeTaskInput(), 'user-id-1')
    const result2 = await useCase.execute(makeTaskInput(), 'user-id-1')
    expect(result1.id).not.toBe(result2.id)
  })
})

describe('FindTaskByIdUseCase', () => {
  let taskRepository: FakeTaskRepository
  let useCase: FindTaskByIdUseCase

  beforeEach(() => {
    taskRepository = new FakeTaskRepository()
    useCase = new FindTaskByIdUseCase(taskRepository)
  })

  it('should find a task by id', async () => {
    const userRepository = new FakeUserRepository([makeUser()])
    const createUseCase = new CreateTaskUseCase(taskRepository, userRepository)
    const created = await createUseCase.execute(makeTaskInput(), 'user-id-1')
    const result = await useCase.execute(created.id)
    expect(result.id).toBe(created.id)
    expect(result.name).toBe('Test Task')
  })

  it('should throw TaskNotFoundError when task does not exist', async () => {
    await expect(useCase.execute('non-existing-id')).rejects.toThrow(TaskNotFoundError)
  })
})

describe('UpdateTaskUseCase', () => {
  let taskRepository: FakeTaskRepository
  let useCase: UpdateTaskUseCase
  let createdTaskId: string

  beforeEach(async () => {
    taskRepository = new FakeTaskRepository()
    const userRepository = new FakeUserRepository([makeUser()])
    useCase = new UpdateTaskUseCase(taskRepository)
    const createUseCase = new CreateTaskUseCase(taskRepository, userRepository)
    const created = await createUseCase.execute(makeTaskInput(), 'user-id-1')
    createdTaskId = created.id
  })

  it('should update task name successfully', async () => {
    const result = await useCase.execute(createdTaskId, 'user-id-1', { name: 'Updated Task' })
    expect(result.name).toBe('Updated Task')
  })

  it('should update task status successfully', async () => {
    const result = await useCase.execute(createdTaskId, 'user-id-1', { status: 'completed' })
    expect(result.status).toBe('completed')
  })

  it('should update task deadline successfully', async () => {
    const newDeadline = new Date('2027-06-01T00:00:00.000Z')
    const result = await useCase.execute(createdTaskId, 'user-id-1', { deadline: newDeadline })
    expect(result.deadline).toEqual(newDeadline)
  })

  it('should throw TaskNotFoundError when task does not exist', async () => {
    await expect(useCase.execute('non-existing-id', 'user-id-1', { name: 'Updated' })).rejects.toThrow(
      TaskNotFoundError,
    )
  })

  it('should throw NotAuthorizedToPerformError when user is not the owner', async () => {
    await expect(useCase.execute(createdTaskId, 'other-user-id', { name: 'Updated' })).rejects.toThrow(
      NotAuthorizedToPerformError,
    )
  })
})

describe('DeleteTaskUseCase', () => {
  let taskRepository: FakeTaskRepository
  let useCase: DeleteTaskUseCase
  let createdTaskId: string

  beforeEach(async () => {
    taskRepository = new FakeTaskRepository()
    const userRepository = new FakeUserRepository([makeUser()])
    useCase = new DeleteTaskUseCase(taskRepository)
    const createUseCase = new CreateTaskUseCase(taskRepository, userRepository)
    const created = await createUseCase.execute(makeTaskInput(), 'user-id-1')
    createdTaskId = created.id
  })

  it('should delete a task successfully', async () => {
    const result = await useCase.execute(createdTaskId, 'user-id-1')
    expect(result).toBe('Task has been deleted successfully.')
  })

  it('should throw TaskNotFoundError when task does not exist', async () => {
    await expect(useCase.execute('non-existing-id', 'user-id-1')).rejects.toThrow(TaskNotFoundError)
  })

  it('should throw NotAuthorizedToPerformError when user is not the owner', async () => {
    await expect(useCase.execute(createdTaskId, 'other-user-id')).rejects.toThrow(NotAuthorizedToPerformError)
  })

  it('should make task unfindable after deletion', async () => {
    await useCase.execute(createdTaskId, 'user-id-1')
    const findUseCase = new FindTaskByIdUseCase(taskRepository)
    await expect(findUseCase.execute(createdTaskId)).rejects.toThrow(TaskNotFoundError)
  })
})
