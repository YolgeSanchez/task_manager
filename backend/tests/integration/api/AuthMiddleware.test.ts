import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from '../../../src/app.js'
import { prisma } from '../../../src/infrastructure/persistence/prisma.js'
import { JoseTokenService } from '../../../src/infrastructure/shared/services/JoseTokenService.js'
import { cleanDatabase } from '../helpers/cleanDatabase.js'

const tokenService = new JoseTokenService()

const validSignUpBody = {
  username: 'john_doe',
  name: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
}

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  await cleanDatabase()
})

describe('authMiddleware (via GET /api/users)', () => {
  it('should return 403 when no token cookie is present', async () => {
    const res = await request(app).get('/api/users')

    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/no token/i)
  })

  it('should return 403 when token is invalid/malformed', async () => {
    const res = await request(app).get('/api/users').set('Cookie', 'token=not-a-valid-jwt')

    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/expired, revoked, or malformed/i)
  })

  it('should return 403 when token is expired', async () => {
    const token = await tokenService.generateToken({ sub: 'user-id-1', username: 'john_doe' }, -10)
    const res = await request(app).get('/api/users').set('Cookie', `token=${token}`)

    expect(res.status).toBe(403)
  })

  it('should allow access to a protected route when token is valid', async () => {
    await request(app).post('/api/auth').send(validSignUpBody)
    const signInRes = await request(app)
      .post('/api/auth/signin')
      .send({ username: 'john_doe', password: 'password123' })

    const cookies = signInRes.headers['set-cookie'] as unknown as string[]

    const res = await request(app).get('/api/users').set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})
