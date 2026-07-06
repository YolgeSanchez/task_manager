import { beforeEach, describe, expect, it } from 'vitest'
import { MemberNotFoundError } from '../../src/application/errors/MemberNotFoundError.js'
import { NotAuthorizedToPerformError } from '../../src/application/errors/NotAuthorizedToPerformError.js'
import { ProjectNotFoundError } from '../../src/application/errors/ProjectNotFoundError.js'
import { TaskNotFoundError } from '../../src/application/errors/TaskNotFoundError.js'
import { UserNotFoundError } from '../../src/application/errors/UserNotFoundError.js'
import { AddProjectMemberUseCase } from '../../src/application/use-cases/project/AddProjectMemberUseCase.js'
import { AddProjectTaskUseCase } from '../../src/application/use-cases/project/AddProjectTaskUseCase.js'
import { CreateProjectUseCase } from '../../src/application/use-cases/project/CreateProjectUseCase.js'
import { DeleteProjectUseCase } from '../../src/application/use-cases/project/DeleteProjectUseCase.js'
import { FindAllUserProjectsUseCase } from '../../src/application/use-cases/project/FindAllUserProjects.js'
import { FindProjectByIdUseCase } from '../../src/application/use-cases/project/FindProjectByIdUseCase.js'
import { RemoveProjectMemberUseCase } from '../../src/application/use-cases/project/RemoveProjectMemberUseCase.js'
import { RemoveProjectTaskUseCase } from '../../src/application/use-cases/project/RemoveProjectTaskUseCase.js'
import { UpdateProjectUseCase } from '../../src/application/use-cases/project/UpdateProjectUseCase.js'
import { Project } from '../../src/domain/entities/Project.js'
import { Task } from '../../src/domain/entities/Task.js'
import { User } from '../../src/domain/entities/User.js'
import type { ProjectRepository } from '../../src/domain/repositories/ProjectRepository.js'
import type { TaskRepository } from '../../src/domain/repositories/TaskRepository.js'
import type { UserRepository } from '../../src/domain/repositories/UserRepository.js'
import type { ID, SuccessMessage } from '../../src/domain/types/types.js'

// [ fakes ]
class FakeProjectRepository implements ProjectRepository {
  private projects: Project[] = []

  async save(project: Project): Promise<Project> {
    this.projects.push(project)
    return project
  }

  async update(project: Project): Promise<Project> {
    const idx = this.projects.findIndex((p) => p.id === project.id)
    if (idx !== -1) this.projects[idx] = project
    return project
  }

  async deleteById(id: ID): Promise<SuccessMessage> {
    this.projects = this.projects.filter((p) => p.id !== id)
    return 'Project has been deleted successfully.'
  }

  async findAllUserProjects(userId: ID): Promise<Project[]> {
    return this.projects.filter((p) => p.membersIds.includes(userId))
  }

  async findById(id: ID): Promise<Project | null> {
    return this.projects.find((p) => p.id === id) ?? null
  }
}

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

const makeTask = (userId: string, overrides: Partial<{ id: string; projectId: string | null }> = {}) =>
  new Task(overrides.id ?? 'task-id-1', {
    name: 'Test Task',
    description: 'Test description',
    status: 'in_process',
    userId,
    projectId: overrides.projectId ?? null,
    createdAt: new Date(),
    deadline: new Date('2026-12-31T00:00:00.000Z'),
  })

const makeProject = (ownerId: string, overrides: Partial<{ id: string; membersIds: string[] }> = {}) =>
  new Project(overrides.id ?? 'project-id-1', {
    name: 'Test Project',
    ownerId,
    membersIds: overrides.membersIds ?? [ownerId],
    tasksIds: [],
    createdAt: new Date(),
  })

// [ tests ]
describe('CreateProjectUseCase', () => {
  let projectRepository: FakeProjectRepository
  let userRepository: FakeUserRepository
  let useCase: CreateProjectUseCase

  beforeEach(() => {
    projectRepository = new FakeProjectRepository()
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new CreateProjectUseCase(projectRepository, userRepository)
  })

  it('should create a project successfully', async () => {
    const result = await useCase.execute({ name: 'Test Project' }, 'user-id-1')
    expect(result.name).toBe('Test Project')
    expect(result.ownerId).toBe('user-id-1')
  })

  it('should add owner as first member', async () => {
    const result = await useCase.execute({ name: 'Test Project' }, 'user-id-1')
    expect(result.membersIds).toContain('user-id-1')
  })

  it('should start with empty tasksIds', async () => {
    const result = await useCase.execute({ name: 'Test Project' }, 'user-id-1')
    expect(result.tasksIds).toHaveLength(0)
  })

  it('should throw UserNotFoundError when user does not exist', async () => {
    await expect(useCase.execute({ name: 'Test Project' }, 'non-existing-id')).rejects.toThrow(
      UserNotFoundError,
    )
  })

  it('should generate unique ids for each project', async () => {
    const result1 = await useCase.execute({ name: 'Project 1' }, 'user-id-1')
    const result2 = await useCase.execute({ name: 'Project 2' }, 'user-id-1')
    expect(result1.id).not.toBe(result2.id)
  })
})

describe('FindProjectByIdUseCase', () => {
  let projectRepository: FakeProjectRepository
  let userRepository: FakeUserRepository
  let useCase: FindProjectByIdUseCase

  beforeEach(() => {
    projectRepository = new FakeProjectRepository()
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new FindProjectByIdUseCase(projectRepository, userRepository)
    projectRepository['projects'].push(makeProject('user-id-1'))
  })

  it('should find a project by id', async () => {
    const result = await useCase.execute('project-id-1', 'user-id-1')
    expect(result.id).toBe('project-id-1')
  })

  it('should throw ProjectNotFoundError when project does not exist', async () => {
    await expect(useCase.execute('non-existing-id', 'user-id-1')).rejects.toThrow(ProjectNotFoundError)
  })

  it('should throw UserNotFoundError when user does not exist', async () => {
    await expect(useCase.execute('project-id-1', 'non-existing-id')).rejects.toThrow(UserNotFoundError)
  })

  it('should throw ProjectNotFoundError when user is not a member', async () => {
    const otherUser = makeUser({ id: 'other-user-id', username: 'other', email: 'other@example.com' })
    userRepository['users'].push(otherUser)
    await expect(useCase.execute('project-id-1', 'other-user-id')).rejects.toThrow(ProjectNotFoundError)
  })
})

describe('FindAllUserProjectsUseCase', () => {
  let projectRepository: FakeProjectRepository
  let userRepository: FakeUserRepository
  let useCase: FindAllUserProjectsUseCase

  beforeEach(() => {
    projectRepository = new FakeProjectRepository()
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new FindAllUserProjectsUseCase(projectRepository, userRepository)
  })

  it('should return all projects for a user', async () => {
    projectRepository['projects'].push(makeProject('user-id-1', { id: 'project-id-1' }))
    projectRepository['projects'].push(makeProject('user-id-1', { id: 'project-id-2' }))
    const result = await useCase.execute('user-id-1')
    expect(result).toHaveLength(2)
  })

  it('should return empty array when user has no projects', async () => {
    const result = await useCase.execute('user-id-1')
    expect(result).toHaveLength(0)
  })

  it('should throw UserNotFoundError when user does not exist', async () => {
    await expect(useCase.execute('non-existing-id')).rejects.toThrow(UserNotFoundError)
  })

  it('should not return projects where user is not a member', async () => {
    const otherUser = makeUser({ id: 'other-user-id', username: 'other', email: 'other@example.com' })
    userRepository['users'].push(otherUser)
    projectRepository['projects'].push(makeProject('other-user-id', { id: 'project-id-1' }))
    const result = await useCase.execute('user-id-1')
    expect(result).toHaveLength(0)
  })
})

describe('UpdateProjectUseCase', () => {
  let projectRepository: FakeProjectRepository
  let userRepository: FakeUserRepository
  let useCase: UpdateProjectUseCase

  beforeEach(() => {
    projectRepository = new FakeProjectRepository()
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new UpdateProjectUseCase(projectRepository, userRepository)
    projectRepository['projects'].push(makeProject('user-id-1'))
  })

  it('should update project name successfully', async () => {
    const result = await useCase.execute('project-id-1', 'user-id-1', { name: 'Updated Project' })
    expect(result.name).toBe('Updated Project')
  })

  it('should throw ProjectNotFoundError when project does not exist', async () => {
    await expect(useCase.execute('non-existing-id', 'user-id-1', { name: 'Updated' })).rejects.toThrow(
      ProjectNotFoundError,
    )
  })

  it('should throw UserNotFoundError when user does not exist', async () => {
    await expect(useCase.execute('project-id-1', 'non-existing-id', { name: 'Updated' })).rejects.toThrow(
      UserNotFoundError,
    )
  })

  it('should throw NotAuthorizedToPerformError when user is not the owner', async () => {
    const member = makeUser({ id: 'member-id', username: 'member', email: 'member@example.com' })
    userRepository['users'].push(member)
    projectRepository['projects'][0]?.addMember('member-id')
    await expect(useCase.execute('project-id-1', 'member-id', { name: 'Updated' })).rejects.toThrow(
      NotAuthorizedToPerformError,
    )
  })
})

describe('DeleteProjectUseCase', () => {
  let projectRepository: FakeProjectRepository
  let userRepository: FakeUserRepository
  let useCase: DeleteProjectUseCase

  beforeEach(() => {
    projectRepository = new FakeProjectRepository()
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new DeleteProjectUseCase(projectRepository, userRepository)
    projectRepository['projects'].push(makeProject('user-id-1'))
  })

  it('should delete a project successfully', async () => {
    const result = await useCase.execute('project-id-1', 'user-id-1')
    expect(result).toBe('Project has been deleted successfully.')
  })

  it('should throw ProjectNotFoundError when project does not exist', async () => {
    await expect(useCase.execute('non-existing-id', 'user-id-1')).rejects.toThrow(ProjectNotFoundError)
  })

  it('should throw UserNotFoundError when user does not exist', async () => {
    await expect(useCase.execute('project-id-1', 'non-existing-id')).rejects.toThrow(UserNotFoundError)
  })

  it('should throw NotAuthorizedToPerformError when user is not the owner', async () => {
    const member = makeUser({ id: 'member-id', username: 'member', email: 'member@example.com' })
    userRepository['users'].push(member)
    projectRepository['projects'][0]?.addMember('member-id')
    await expect(useCase.execute('project-id-1', 'member-id')).rejects.toThrow(NotAuthorizedToPerformError)
  })

  it('should make project unfindable after deletion', async () => {
    await useCase.execute('project-id-1', 'user-id-1')
    const findUseCase = new FindProjectByIdUseCase(projectRepository, userRepository)
    await expect(findUseCase.execute('project-id-1', 'user-id-1')).rejects.toThrow(ProjectNotFoundError)
  })
})

describe('AddProjectMemberUseCase', () => {
  let projectRepository: FakeProjectRepository
  let userRepository: FakeUserRepository
  let useCase: AddProjectMemberUseCase

  beforeEach(() => {
    projectRepository = new FakeProjectRepository()
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new AddProjectMemberUseCase(projectRepository, userRepository)
    projectRepository['projects'].push(makeProject('user-id-1'))
  })

  it('should add a member to the project successfully', async () => {
    const member = makeUser({ id: 'member-id', username: 'member', email: 'member@example.com' })
    userRepository['users'].push(member)
    const result = await useCase.execute('project-id-1', 'member-id', 'user-id-1')
    expect(result.membersIds).toContain('member-id')
  })

  it('should throw UserNotFoundError when requester does not exist', async () => {
    await expect(useCase.execute('project-id-1', 'member-id', 'non-existing-id')).rejects.toThrow(
      UserNotFoundError,
    )
  })

  it('should throw ProjectNotFoundError when project does not exist', async () => {
    await expect(useCase.execute('non-existing-id', 'member-id', 'user-id-1')).rejects.toThrow(
      ProjectNotFoundError,
    )
  })

  it('should throw MemberNotFoundError when member does not exist', async () => {
    await expect(useCase.execute('project-id-1', 'non-existing-member', 'user-id-1')).rejects.toThrow(
      MemberNotFoundError,
    )
  })

  it('should throw NotAuthorizedToPerformError when requester is not the owner', async () => {
    const member = makeUser({ id: 'member-id', username: 'member', email: 'member@example.com' })
    const newUser = makeUser({ id: 'new-user-id', username: 'newuser', email: 'new@example.com' })
    userRepository['users'].push(member, newUser)
    projectRepository['projects'][0]?.addMember('member-id')
    await expect(useCase.execute('project-id-1', 'new-user-id', 'member-id')).rejects.toThrow(
      NotAuthorizedToPerformError,
    )
  })
})

describe('RemoveProjectMemberUseCase', () => {
  let projectRepository: FakeProjectRepository
  let userRepository: FakeUserRepository
  let useCase: RemoveProjectMemberUseCase

  beforeEach(() => {
    projectRepository = new FakeProjectRepository()
    const member = makeUser({ id: 'member-id', username: 'member', email: 'member@example.com' })
    userRepository = new FakeUserRepository([makeUser(), member])
    useCase = new RemoveProjectMemberUseCase(projectRepository, userRepository)
    projectRepository['projects'].push(makeProject('user-id-1', { membersIds: ['user-id-1', 'member-id'] }))
  })

  it('should remove a member successfully when owner requests', async () => {
    const result = await useCase.execute('project-id-1', 'member-id', 'user-id-1')
    expect(result.membersIds).not.toContain('member-id')
  })

  it('should allow member to remove himself', async () => {
    const result = await useCase.execute('project-id-1', 'member-id', 'member-id')
    expect(result.membersIds).not.toContain('member-id')
  })

  it('should throw NotAuthorizedToPerformError when non-owner tries to remove another member', async () => {
    const other = makeUser({ id: 'other-id', username: 'other', email: 'other@example.com' })
    userRepository['users'].push(other)
    projectRepository['projects'][0]?.addMember('other-id')
    await expect(useCase.execute('project-id-1', 'other-id', 'member-id')).rejects.toThrow(
      NotAuthorizedToPerformError,
    )
  })

  it('should throw MemberNotFoundError when member does not exist', async () => {
    await expect(useCase.execute('project-id-1', 'non-existing-id', 'user-id-1')).rejects.toThrow(
      MemberNotFoundError,
    )
  })
})

describe('AddProjectTaskUseCase', () => {
  let projectRepository: FakeProjectRepository
  let taskRepository: FakeTaskRepository
  let userRepository: FakeUserRepository
  let useCase: AddProjectTaskUseCase

  beforeEach(() => {
    projectRepository = new FakeProjectRepository()
    taskRepository = new FakeTaskRepository()
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new AddProjectTaskUseCase(projectRepository, userRepository, taskRepository)
    projectRepository['projects'].push(makeProject('user-id-1'))
    taskRepository['tasks'].push(makeTask('user-id-1'))
  })

  it('should add a task to the project successfully', async () => {
    const result = await useCase.execute('project-id-1', 'task-id-1', 'user-id-1')
    expect(result.tasksIds).toContain('task-id-1')
  })

  it('should throw TaskNotFoundError when task does not exist', async () => {
    await expect(useCase.execute('project-id-1', 'non-existing-task', 'user-id-1')).rejects.toThrow(
      TaskNotFoundError,
    )
  })

  it('should throw ProjectNotFoundError when project does not exist', async () => {
    await expect(useCase.execute('non-existing-project', 'task-id-1', 'user-id-1')).rejects.toThrow(
      ProjectNotFoundError,
    )
  })

  it('should throw TaskNotFoundError when task does not belong to the user', async () => {
    const otherTask = makeTask('other-user-id', { id: 'task-id-2' })
    taskRepository['tasks'].push(otherTask)
    await expect(useCase.execute('project-id-1', 'task-id-2', 'user-id-1')).rejects.toThrow(TaskNotFoundError)
  })
})

describe('RemoveProjectTaskUseCase', () => {
  let projectRepository: FakeProjectRepository
  let taskRepository: FakeTaskRepository
  let userRepository: FakeUserRepository
  let useCase: RemoveProjectTaskUseCase

  beforeEach(() => {
    projectRepository = new FakeProjectRepository()
    taskRepository = new FakeTaskRepository()
    userRepository = new FakeUserRepository([makeUser()])
    useCase = new RemoveProjectTaskUseCase(projectRepository, userRepository, taskRepository)
    const project = makeProject('user-id-1')
    const task = makeTask('user-id-1')
    project.addTask('task-id-1')
    task.addToProject('project-id-1')
    projectRepository['projects'].push(project)
    taskRepository['tasks'].push(task)
  })

  it('should remove a task from the project successfully', async () => {
    const result = await useCase.execute('project-id-1', 'task-id-1', 'user-id-1')
    expect(result.tasksIds).not.toContain('task-id-1')
  })

  it('should throw TaskNotFoundError when task does not exist', async () => {
    await expect(useCase.execute('project-id-1', 'non-existing-task', 'user-id-1')).rejects.toThrow(
      TaskNotFoundError,
    )
  })

  it('should throw ProjectNotFoundError when project does not exist', async () => {
    await expect(useCase.execute('non-existing-project', 'task-id-1', 'user-id-1')).rejects.toThrow(
      ProjectNotFoundError,
    )
  })

  it('should throw NotAuthorizedToPerformError when user is neither owner nor task owner', async () => {
    const member = makeUser({ id: 'member-id', username: 'member', email: 'member@example.com' })
    userRepository['users'].push(member)
    projectRepository['projects'][0]?.addMember('member-id')
    await expect(useCase.execute('project-id-1', 'task-id-1', 'member-id')).rejects.toThrow(
      NotAuthorizedToPerformError,
    )
  })
})
