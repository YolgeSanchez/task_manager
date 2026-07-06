import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from '../../../src/app.js'
import { prisma } from '../../../src/infraestructure/libs/prisma.js'
import { cleanDatabase } from '../helpers/cleanDatabase.js'

const userA = {
  username: 'john_doe',
  name: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
}

const userB = {
  username: 'jane_doe',
  name: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  password: 'password123',
}

const signUpAndGetAuth = async (input: typeof userA) => {
  const res = await request(app).post('/api/auth').send(input)
  const cookies = res.headers['set-cookie'] as unknown as string[]
  return { id: res.body.id as string, cookies }
}

const validTaskBody = () => ({
  name: 'Test Task',
  description: 'Test description',
  status: 'in_process' as const,
  deadline: new Date(Date.now() + 86400000).toISOString(),
})

const createTask = async (cookies: string[], overrides: Partial<ReturnType<typeof validTaskBody>> = {}) => {
  const res = await request(app)
    .post('/api/tasks')
    .set('Cookie', cookies)
    .send({ ...validTaskBody(), ...overrides })
  return res.body as { id: string; userId: string }
}

const createProject = async (cookies: string[], name = 'Test Project') => {
  const res = await request(app).post('/api/projects').set('Cookie', cookies).send({ name })
  return res.body as { id: string }
}

const NON_EXISTING_UUID = '00000000-0000-4000-8000-000000000000'

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  await cleanDatabase()
})

describe('POST /api/tasks', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).post('/api/tasks').send(validTaskBody())
    expect(res.status).toBe(403)
  })

  it('should create a task successfully', async () => {
    const { id: userId, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).post('/api/tasks').set('Cookie', cookies).send(validTaskBody())

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Test Task')
    expect(res.body.userId).toBe(userId)
  })

  it('should assign projectId as null by default', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).post('/api/tasks').set('Cookie', cookies).send(validTaskBody())
    expect(res.body.projectId).toBeNull()
  })

  it('should persist the task in the database', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).post('/api/tasks').set('Cookie', cookies).send(validTaskBody())

    const found = await prisma.task.findUnique({ where: { id: res.body.id } })
    expect(found).not.toBeNull()
  })

  it('should return 400 when name is empty', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookies)
      .send({ ...validTaskBody(), name: '' })

    expect(res.status).toBe(400)
  })

  it('should return 400 when status is invalid', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookies)
      .send({ ...validTaskBody(), status: 'not_a_status' })

    expect(res.status).toBe(400)
  })

  it('should return 400 when deadline is missing', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const { deadline: _deadline, ...bodyWithoutDeadline } = validTaskBody()
    const res = await request(app).post('/api/tasks').set('Cookie', cookies).send(bodyWithoutDeadline)

    expect(res.status).toBe(400)
  })

  it('should return 400 when deadline is before createdAt (validated at entity level)', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookies)
      .send({ ...validTaskBody(), deadline: new Date('2020-01-01').toISOString() })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/tasks', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(403)
  })

  it('should return all tasks regardless of owner', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    await createTask(cookiesA)
    await createTask(cookiesB)

    const res = await request(app).get('/api/tasks').set('Cookie', cookiesA)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  it('should return empty array when no tasks exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get('/api/tasks').set('Cookie', cookies)
    expect(res.body).toHaveLength(0)
  })
})

describe('GET /api/tasks/:id', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).get('/api/tasks/some-id')
    expect(res.status).toBe(403)
  })

  it('should return a task by id', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const task = await createTask(cookies)

    const res = await request(app).get(`/api/tasks/${task.id}`).set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(task.id)
  })

  it('should allow viewing a task owned by another user (no ownership check on read)', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const task = await createTask(cookiesA)

    const res = await request(app).get(`/api/tasks/${task.id}`).set('Cookie', cookiesB)

    expect(res.status).toBe(200)
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get('/api/tasks/not-a-uuid').set('Cookie', cookies)
    expect(res.status).toBe(400)
  })

  it('should return 404 when task does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get(`/api/tasks/${NON_EXISTING_UUID}`).set('Cookie', cookies)
    expect(res.status).toBe(404)
  })
})

describe('GET /api/projects/:projectId/tasks', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).get(`/api/projects/${NON_EXISTING_UUID}/tasks`)
    expect(res.status).toBe(403)
  })

  it('should return tasks belonging to the project when requester is a member', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    const task = await createTask(cookies)

    await request(app).post(`/api/projects/${project.id}/tasks/${task.id}`).set('Cookie', cookies)

    const res = await request(app).get(`/api/projects/${project.id}/tasks`).set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].id).toBe(task.id)
  })

  it('should return empty array when project has no tasks', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)

    const res = await request(app).get(`/api/projects/${project.id}/tasks`).set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })

  it('should return 400 when projectId is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get('/api/projects/not-a-uuid/tasks').set('Cookie', cookies)
    expect(res.status).toBe(400)
  })

  it('should return 404 when project does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get(`/api/projects/${NON_EXISTING_UUID}/tasks`).set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it('should return 404 when requester is not a member of the project', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)

    const res = await request(app).get(`/api/projects/${project.id}/tasks`).set('Cookie', cookiesB)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/tasks/:id', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).patch('/api/tasks/some-id').send({ name: 'Updated' })
    expect(res.status).toBe(403)
  })

  it('should update the task successfully when updating himself', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const task = await createTask(cookies)

    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set('Cookie', cookies)
      .send({ name: 'Updated' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Updated')
  })

  it('should update status successfully', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const task = await createTask(cookies)

    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set('Cookie', cookies)
      .send({ status: 'completed' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('completed')
  })

  it('should persist the update in the database', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const task = await createTask(cookies)
    await request(app).patch(`/api/tasks/${task.id}`).set('Cookie', cookies).send({ name: 'Updated' })

    const found = await prisma.task.findUnique({ where: { id: task.id } })
    expect(found?.name).toBe('Updated')
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .patch('/api/tasks/not-a-uuid')
      .set('Cookie', cookies)
      .send({ name: 'Updated' })
    expect(res.status).toBe(400)
  })

  it('should return 404 when task does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .patch(`/api/tasks/${NON_EXISTING_UUID}`)
      .set('Cookie', cookies)
      .send({ name: 'Updated' })

    expect(res.status).toBe(404)
  })

  it('should return 400 when status is invalid', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const task = await createTask(cookies)
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set('Cookie', cookies)
      .send({ status: 'not_a_status' })

    expect(res.status).toBe(400)
  })

  it("should return 403 when a user tries to update another user's task", async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const task = await createTask(cookiesA)

    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set('Cookie', cookiesB)
      .send({ name: 'Hacked' })

    expect(res.status).toBe(403)
  })

  it('should not modify the task when unauthorized', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const task = await createTask(cookiesA)

    await request(app).patch(`/api/tasks/${task.id}`).set('Cookie', cookiesB).send({ name: 'Hacked' })

    const found = await prisma.task.findUnique({ where: { id: task.id } })
    expect(found?.name).toBe('Test Task')
  })
})

describe('DELETE /api/tasks/:id', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).delete('/api/tasks/some-id')
    expect(res.status).toBe(403)
  })

  it('should delete the task successfully when deleting himself', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const task = await createTask(cookies)

    const res = await request(app).delete(`/api/tasks/${task.id}`).set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Task has been deleted successfully.')
  })

  it('should physically remove the task from the database', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const task = await createTask(cookies)
    await request(app).delete(`/api/tasks/${task.id}`).set('Cookie', cookies)

    const found = await prisma.task.findUnique({ where: { id: task.id } })
    expect(found).toBeNull()
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).delete('/api/tasks/not-a-uuid').set('Cookie', cookies)
    expect(res.status).toBe(400)
  })

  it('should return 404 when task does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).delete(`/api/tasks/${NON_EXISTING_UUID}`).set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it("should return 403 when a user tries to delete another user's task", async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const task = await createTask(cookiesA)

    const res = await request(app).delete(`/api/tasks/${task.id}`).set('Cookie', cookiesB)

    expect(res.status).toBe(403)
  })

  it('should not delete the task when unauthorized', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const task = await createTask(cookiesA)

    await request(app).delete(`/api/tasks/${task.id}`).set('Cookie', cookiesB)

    const found = await prisma.task.findUnique({ where: { id: task.id } })
    expect(found).not.toBeNull()
  })
})
