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

describe('GET /api/users', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).get('/api/users')
    expect(res.status).toBe(403)
  })

  it('should return all users when authenticated', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    await request(app).post('/api/auth').send(userB)

    const res = await request(app).get('/api/users').set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  it('should only return the requester when no other users have registered', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get('/api/users').set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('should not include soft deleted users', async () => {
    const { cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { id: userBId, cookies: cookiesB } = await signUpAndGetAuth(userB)

    await request(app).delete(`/api/users/${userBId}`).set('Cookie', cookiesB)

    const res = await request(app).get('/api/users').set('Cookie', cookiesA)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body.find((u: { id: string }) => u.id === userBId)).toBeUndefined()
  })
})

describe('GET /api/users/:id', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).get('/api/users/some-id')
    expect(res.status).toBe(403)
  })

  it('should return a user by id', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get(`/api/users/${id}`).set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(id)
    expect(res.body.username).toBe('john_doe')
  })

  it('should not expose the password', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get(`/api/users/${id}`).set('Cookie', cookies)
    expect(res.body.password).toBeUndefined()
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get('/api/users/not-a-uuid').set('Cookie', cookies)

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/valid uuid/i)
  })

  it('should return 404 when user does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).get(`/api/users/${NON_EXISTING_UUID}`).set('Cookie', cookies)

    expect(res.status).toBe(404)
  })

  it('should return 404 when the requested user is soft deleted', async () => {
    const { id: userAId, cookies: cookiesA } = await signUpAndGetAuth(userA)
    const { id: userBId, cookies: cookiesB } = await signUpAndGetAuth(userB)

    await request(app).delete(`/api/users/${userBId}`).set('Cookie', cookiesB)

    const res = await request(app).get(`/api/users/${userBId}`).set('Cookie', cookiesA)
    expect(res.status).toBe(404)
    void userAId
  })
})

describe('PATCH /api/users/:id', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).patch('/api/users/some-id').send({ name: 'Updated' })
    expect(res.status).toBe(403)
  })

  it('should update the user successfully when updating himself', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).patch(`/api/users/${id}`).set('Cookie', cookies).send({ name: 'Updated' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Updated')
  })

  it('should update multiple fields at once', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .patch(`/api/users/${id}`)
      .set('Cookie', cookies)
      .send({ name: 'Updated', lastName: 'NewLastName' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Updated')
    expect(res.body.lastName).toBe('NewLastName')
  })

  it('should persist the update in the database', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    await request(app).patch(`/api/users/${id}`).set('Cookie', cookies).send({ name: 'Updated' })

    const found = await prisma.user.findUnique({ where: { id } })
    expect(found?.name).toBe('Updated')
  })

  it('should allow a partial update without touching other fields', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).patch(`/api/users/${id}`).set('Cookie', cookies).send({ name: 'Updated' })

    expect(res.body.lastName).toBe('Doe')
    expect(res.body.username).toBe('john_doe')
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .patch('/api/users/not-a-uuid')
      .set('Cookie', cookies)
      .send({ name: 'Updated' })

    expect(res.status).toBe(400)
  })

  it('should return 404 when target user does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .patch(`/api/users/${NON_EXISTING_UUID}`)
      .set('Cookie', cookies)
      .send({ name: 'Updated' })

    // UserNotFoundError se lanza antes que NotAuthorizedToPerformError en el use case
    expect(res.status).toBe(404)
  })

  it('should return 400 when email is invalid', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app)
      .patch(`/api/users/${id}`)
      .set('Cookie', cookies)
      .send({ email: 'not-an-email' })

    expect(res.status).toBe(400)
  })

  it('should return 400 when name is set to an empty string', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).patch(`/api/users/${id}`).set('Cookie', cookies).send({ name: '' })

    expect(res.status).toBe(400)
  })

  it("should return 403 when a user tries to update another user's profile", async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const { id: userBId } = await signUpAndGetAuth(userB)

    const res = await request(app)
      .patch(`/api/users/${userBId}`)
      .set('Cookie', cookies)
      .send({ name: 'Hacked Name' })

    expect(res.status).toBe(403)
  })

  it('should not modify the target user when unauthorized', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const { id: userBId } = await signUpAndGetAuth(userB)

    await request(app).patch(`/api/users/${userBId}`).set('Cookie', cookies).send({ name: 'Hacked Name' })

    const found = await prisma.user.findUnique({ where: { id: userBId } })
    expect(found?.name).toBe('Jane')
  })
})

describe('DELETE /api/users/:id', () => {
  it('should return 403 without auth', async () => {
    const res = await request(app).delete('/api/users/some-id')
    expect(res.status).toBe(403)
  })

  it('should delete the user successfully when deleting himself', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).delete(`/api/users/${id}`).set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('User has been deleted successfully.')
  })

  it('should soft delete the user in the database', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    await request(app).delete(`/api/users/${id}`).set('Cookie', cookies)

    const found = await prisma.user.findUnique({ where: { id } })
    expect(found?.deletedAt).not.toBeNull()
  })

  it('should not physically remove the user from the database', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    await request(app).delete(`/api/users/${id}`).set('Cookie', cookies)

    const found = await prisma.user.findUnique({ where: { id } })
    expect(found).not.toBeNull()
  })

  it('should return 400 when id is not a valid UUID', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).delete('/api/users/not-a-uuid').set('Cookie', cookies)

    expect(res.status).toBe(400)
  })

  it('should return 404 when user does not exist', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const res = await request(app).delete(`/api/users/${NON_EXISTING_UUID}`).set('Cookie', cookies)

    expect(res.status).toBe(404)
  })

  it('should return 404 when trying to delete an already soft deleted user', async () => {
    const { id, cookies } = await signUpAndGetAuth(userA)
    await request(app).delete(`/api/users/${id}`).set('Cookie', cookies)

    const res = await request(app).delete(`/api/users/${id}`).set('Cookie', cookies)
    expect(res.status).toBe(404)
  })

  it("should return 403 when a user tries to delete another user's account", async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const { id: userBId } = await signUpAndGetAuth(userB)

    const res = await request(app).delete(`/api/users/${userBId}`).set('Cookie', cookies)

    expect(res.status).toBe(403)
  })

  it('should not delete the target user when unauthorized', async () => {
    const { cookies } = await signUpAndGetAuth(userA)
    const { id: userBId } = await signUpAndGetAuth(userB)

    await request(app).delete(`/api/users/${userBId}`).set('Cookie', cookies)

    const found = await prisma.user.findUnique({ where: { id: userBId } })
    expect(found?.deletedAt).toBeNull()
  })
})
