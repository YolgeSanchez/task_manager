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

const userC = {
  username: 'bob_smith',
  name: 'Bob',
  lastName: 'Smith',
  email: 'bob@example.com',
  password: 'password123',
}

const signUpAndGetAuth = async (input: typeof userA) => {
  const res = await request(app).post('/api/auth').send(input)
  const cookies = res.headers['set-cookie'] as unknown as string[]
  return { id: res.body.id as string, cookies }
}

const createProject = async (cookies: string[], name = 'Test Project') => {
  const res = await request(app).post('/api/projects').set('Cookie', cookies).send({ name })
  return res.body as { id: string; ownerId: string; membersIds: string[]; tasksIds: string[] }
}

const createTask = async (cookies: string[]) => {
  const res = await request(app)
    .post('/api/tasks')
    .set('Cookie', cookies)
    .send({
      name: 'Test Task',
      description: 'Test description',
      status: 'in_process',
      deadline: new Date(Date.now() + 86400000).toISOString(),
    })
  return res.body as { id: string; userId: string }
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

describe('POST /api/projects', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'Test Project' })
    expect(res.status).toBe(403)
  })

  it('should create a project successfully', async () => {
    const { id: userId, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).post('/api/projects').set('Cookie', cookies).send({ name: 'Test Project' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Test Project')
    expect(res.body.ownerId).toBe(userId)
  })

  it('should automatically add the owner as a member', async () => {
    const { id: userId, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).post('/api/projects').set('Cookie', cookies).send({ name: 'Test Project' })

    expect(res.body.membersIds).toContain(userId)
  })

  it('should persist the project in the database', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).post('/api/projects').set('Cookie', cookies).send({ name: 'Test Project' })

    const found = await prisma.project.findUnique({ where: { id: res.body.id } })
    expect(found).not.toBeNull()
  })

  it('should return 400 when name is empty', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).post('/api/projects').set('Cookie', cookies).send({ name: '' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/projects', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).get('/api/projects')
    expect(res.status).toBe(403)
  })

  it('should return only projects where the user is a member', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    await createProject(cookiesA)
    await createProject(cookiesB)

    const res = await request(app).get('/api/projects').set('Cookie', cookiesA)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('should return empty array when user has no projects', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get('/api/projects').set('Cookie', cookies)
    expect(res.body).toHaveLength(0)
  })
})

describe('GET /api/projects/:id', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).get('/api/projects/some-id')
    expect(res.status).toBe(403)
  })

  it('should return a project by id when requester is a member', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)

    const res = await request(app).get(`/api/projects/${project.id}`).set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(project.id)
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get('/api/projects/not-a-uuid').set('Cookie', cookies)
    expect(res.status).toBe(400)
  })

  it('should return 404 when project does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get(`/api/projects/${NON_EXISTING_UUID}`).set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it('should return 404 when requester is not a member of the project', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)

    const res = await request(app).get(`/api/projects/${project.id}`).set('Cookie', cookiesB)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/projects/:id', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).patch('/api/projects/some-id').send({ name: 'Updated' })
    expect(res.status).toBe(403)
  })

  it('should update the project name when requester is the owner', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)

    const res = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set('Cookie', cookies)
      .send({ name: 'Updated Project' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Updated Project')
  })

  it('should persist the update in the database', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    await request(app)
      .patch(`/api/projects/${project.id}`)
      .set('Cookie', cookies)
      .send({ name: 'Updated Project' })

    const found = await prisma.project.findUnique({ where: { id: project.id } })
    expect(found?.name).toBe('Updated Project')
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .patch('/api/projects/not-a-uuid')
      .set('Cookie', cookies)
      .send({ name: 'Updated' })
    expect(res.status).toBe(400)
  })

  it('should return 400 when name is empty', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    const res = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set('Cookie', cookies)
      .send({ name: '' })
    expect(res.status).toBe(400)
  })

  it('should return 404 when project does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .patch(`/api/projects/${NON_EXISTING_UUID}`)
      .set('Cookie', cookies)
      .send({ name: 'Updated' })
    expect(res.status).toBe(404)
  })

  it('should return 404 when requester is not a member of the project', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)

    const res = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set('Cookie', cookiesB)
      .send({ name: 'Hacked' })
    expect(res.status).toBe(404)
  })

  it('should return 403 when requester is a member but not the owner', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { id: userBId, cookies: cookiesB } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)

    await request(app).post(`/api/projects/${project.id}/members/${userBId}`).set('Cookie', cookiesA)

    const res = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set('Cookie', cookiesB)
      .send({ name: 'Hacked' })
    expect(res.status).toBe(403)
  })
})

describe('DELETE /api/projects/:id', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).delete('/api/projects/some-id')
    expect(res.status).toBe(403)
  })

  it('should delete the project when requester is the owner', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)

    const res = await request(app).delete(`/api/projects/${project.id}`).set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Project has been deleted successfully.')
  })

  it('should soft delete the project in the database', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    await request(app).delete(`/api/projects/${project.id}`).set('Cookie', cookies)

    const found = await prisma.project.findUnique({ where: { id: project.id } })
    expect(found?.deletedAt).not.toBeNull()
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).delete('/api/projects/not-a-uuid').set('Cookie', cookies)
    expect(res.status).toBe(400)
  })

  it('should return 404 when project does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).delete(`/api/projects/${NON_EXISTING_UUID}`).set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it('should return 404 when requester is not a member of the project', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)

    const res = await request(app).delete(`/api/projects/${project.id}`).set('Cookie', cookiesB)
    expect(res.status).toBe(404)
  })

  it('should return 403 when requester is a member but not the owner', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { id: userBId, cookies: cookiesB } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)

    await request(app).post(`/api/projects/${project.id}/members/${userBId}`).set('Cookie', cookiesA)

    const res = await request(app).delete(`/api/projects/${project.id}`).set('Cookie', cookiesB)
    expect(res.status).toBe(403)
  })
})

describe('POST /api/projects/:id/members/:memberId', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).post(`/api/projects/${NON_EXISTING_UUID}/members/${NON_EXISTING_UUID}`)
    expect(res.status).toBe(403)
  })

  it('should add a member when requester is the owner', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { id: userBId } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)

    const res = await request(app)
      .post(`/api/projects/${project.id}/members/${userBId}`)
      .set('Cookie', cookiesA)

    expect(res.status).toBe(200)
    expect(res.body.membersIds).toContain(userBId)
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .post(`/api/projects/not-a-uuid/members/${NON_EXISTING_UUID}`)
      .set('Cookie', cookies)
    expect(res.status).toBe(400)
  })

  it('should return 400 when memberId is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    const res = await request(app)
      .post(`/api/projects/${project.id}/members/not-a-uuid`)
      .set('Cookie', cookies)
    expect(res.status).toBe(400)
  })

  it('should return 404 when project does not exist', async () => {
    const { id: userBId, cookies } = await signUpAndGetAuth(userB)
    const res = await request(app)
      .post(`/api/projects/${NON_EXISTING_UUID}/members/${userBId}`)
      .set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it('should return 404 when member to add does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    const res = await request(app)
      .post(`/api/projects/${project.id}/members/${NON_EXISTING_UUID}`)
      .set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it('should return 403 when requester is a member but not the owner', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { id: userBId, cookies: cookiesB } = await signUpAndGetAuth(userB)
    const { id: userCId } = await signUpAndGetAuth(userC)
    const project = await createProject(cookiesA)

    await request(app).post(`/api/projects/${project.id}/members/${userBId}`).set('Cookie', cookiesA)

    const res = await request(app)
      .post(`/api/projects/${project.id}/members/${userCId}`)
      .set('Cookie', cookiesB)
    expect(res.status).toBe(403)
  })
})

describe('DELETE /api/projects/:id/members/:memberId', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).delete(`/api/projects/${NON_EXISTING_UUID}/members/${NON_EXISTING_UUID}`)
    expect(res.status).toBe(403)
  })

  it('should remove a member when requester is the owner', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { id: userBId } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)
    await request(app).post(`/api/projects/${project.id}/members/${userBId}`).set('Cookie', cookiesA)

    const res = await request(app)
      .delete(`/api/projects/${project.id}/members/${userBId}`)
      .set('Cookie', cookiesA)

    expect(res.status).toBe(200)
    expect(res.body.membersIds).not.toContain(userBId)
  })

  it('should allow a member to remove himself', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { id: userBId, cookies: cookiesB } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)
    await request(app).post(`/api/projects/${project.id}/members/${userBId}`).set('Cookie', cookiesA)

    const res = await request(app)
      .delete(`/api/projects/${project.id}/members/${userBId}`)
      .set('Cookie', cookiesB)

    expect(res.status).toBe(200)
  })

  it('should return 404 when member to remove does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    const res = await request(app)
      .delete(`/api/projects/${project.id}/members/${NON_EXISTING_UUID}`)
      .set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it('should return 403 when a non-owner tries to remove someone else', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { id: userBId, cookies: cookiesB } = await signUpAndGetAuth(userB)
    const { id: userCId } = await signUpAndGetAuth(userC)
    const project = await createProject(cookiesA)

    await request(app).post(`/api/projects/${project.id}/members/${userBId}`).set('Cookie', cookiesA)
    await request(app).post(`/api/projects/${project.id}/members/${userCId}`).set('Cookie', cookiesA)

    const res = await request(app)
      .delete(`/api/projects/${project.id}/members/${userCId}`)
      .set('Cookie', cookiesB)
    expect(res.status).toBe(403)
  })

  it('should return a 409 when the owner tries to remove himself (domain rule violation)', async () => {
    const { id: userId, cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)

    const res = await request(app)
      .delete(`/api/projects/${project.id}/members/${userId}`)
      .set('Cookie', cookies)

    expect(res.status).toBe(409)
  })
})

describe('POST /api/projects/:id/tasks/:taskId', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).post(`/api/projects/${NON_EXISTING_UUID}/tasks/${NON_EXISTING_UUID}`)
    expect(res.status).toBe(403)
  })

  it('should add a task when requester owns the task and is a project member', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    const task = await createTask(cookies)

    const res = await request(app).post(`/api/projects/${project.id}/tasks/${task.id}`).set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.tasksIds).toContain(task.id)
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .post(`/api/projects/not-a-uuid/tasks/${NON_EXISTING_UUID}`)
      .set('Cookie', cookies)
    expect(res.status).toBe(400)
  })

  it('should return 400 when taskId is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    const res = await request(app).post(`/api/projects/${project.id}/tasks/not-a-uuid`).set('Cookie', cookies)
    expect(res.status).toBe(400)
  })

  it('should return 404 when project does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const task = await createTask(cookies)
    const res = await request(app)
      .post(`/api/projects/${NON_EXISTING_UUID}/tasks/${task.id}`)
      .set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it('should return 404 when task does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks/${NON_EXISTING_UUID}`)
      .set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it('should return 404 when the task belongs to another user', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)
    const task = await createTask(cookiesB)

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks/${task.id}`)
      .set('Cookie', cookiesA)
    expect(res.status).toBe(404)
  })

  it('should return 404 when requester is not a member of the project', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { cookies: cookiesB } = await signUpAndGetAuth(userB)
    const project = await createProject(cookiesA)
    const task = await createTask(cookiesB)

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks/${task.id}`)
      .set('Cookie', cookiesB)
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/projects/:id/tasks/:taskId', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).delete(`/api/projects/${NON_EXISTING_UUID}/tasks/${NON_EXISTING_UUID}`)
    expect(res.status).toBe(403)
  })

  it('should remove a task when requester is the project owner', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    const task = await createTask(cookies)
    await request(app).post(`/api/projects/${project.id}/tasks/${task.id}`).set('Cookie', cookies)

    const res = await request(app)
      .delete(`/api/projects/${project.id}/tasks/${task.id}`)
      .set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.tasksIds).not.toContain(task.id)
  })

  it('should return 404 when task does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const project = await createProject(cookies)
    const res = await request(app)
      .delete(`/api/projects/${project.id}/tasks/${NON_EXISTING_UUID}`)
      .set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it('should return 403 when requester is neither project owner nor task owner', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { id: userBId, cookies: cookiesB } = await signUpAndGetAuth(userB)
    const { id: userCId } = await signUpAndGetAuth(userC)
    const project = await createProject(cookiesA)
    const task = await createTask(cookiesA)
    await request(app).post(`/api/projects/${project.id}/tasks/${task.id}`).set('Cookie', cookiesA)

    await request(app).post(`/api/projects/${project.id}/members/${userBId}`).set('Cookie', cookiesA)
    await request(app).post(`/api/projects/${project.id}/members/${userCId}`).set('Cookie', cookiesA)

    const res = await request(app)
      .delete(`/api/projects/${project.id}/tasks/${task.id}`)
      .set('Cookie', cookiesB)
    expect(res.status).toBe(403)
  })
})
