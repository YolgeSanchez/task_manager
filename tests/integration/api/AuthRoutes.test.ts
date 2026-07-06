import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from '../../../src/app.js'
import { prisma } from '../../../src/infraestructure/libs/prisma.js'
import { cleanDatabase } from '../helpers/cleanDatabase.js'

const validSignUpBody = {
  username: 'john_doe',
  name: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
}

const extractCookieValue = (setCookieHeader: string[], name: string): string | undefined => {
  const cookieLine = setCookieHeader.find((c) => c.startsWith(`${name}=`))
  if (!cookieLine) return undefined
  const match = cookieLine.match(new RegExp(`^${name}=([^;]+)`))
  return match?.[1]
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

describe('POST /api/auth (sign up)', () => {
  it('should register a user successfully and return 201', async () => {
    const res = await request(app).post('/api/auth').send(validSignUpBody)

    expect(res.status).toBe(201)
    expect(res.body.username).toBe('john_doe')
    expect(res.body.email).toBe('john@example.com')
  })

  it('should not expose the password in the response', async () => {
    const res = await request(app).post('/api/auth').send(validSignUpBody)
    expect(res.body.password).toBeUndefined()
  })

  it('should set a token cookie on success', async () => {
    const res = await request(app).post('/api/auth').send(validSignUpBody)
    const cookies = res.headers['set-cookie'] as unknown as string[]
    expect(cookies).toBeDefined()
    const token = extractCookieValue(cookies, 'token')
    expect(token).toBeDefined()
  })

  it('should persist the user in the database', async () => {
    await request(app).post('/api/auth').send(validSignUpBody)
    const found = await prisma.user.findUnique({ where: { username: 'john_doe' } })
    expect(found).not.toBeNull()
  })

  it('should return 409 when username is already in use', async () => {
    await request(app).post('/api/auth').send(validSignUpBody)
    const res = await request(app)
      .post('/api/auth')
      .send({ ...validSignUpBody, email: 'other@example.com' })

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/username/i)
  })

  it('should return 409 when email is already in use', async () => {
    await request(app).post('/api/auth').send(validSignUpBody)
    const res = await request(app)
      .post('/api/auth')
      .send({ ...validSignUpBody, username: 'other_user' })

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/email/i)
  })

  it('should return 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth')
      .send({ ...validSignUpBody, email: 'not-an-email' })

    expect(res.status).toBe(400)
  })

  it('should return 400 when username is missing', async () => {
    const { username: _username, ...bodyWithoutUsername } = validSignUpBody
    const res = await request(app).post('/api/auth').send(bodyWithoutUsername)

    expect(res.status).toBe(400)
  })

  it('should return 400 when name is empty', async () => {
    const res = await request(app)
      .post('/api/auth')
      .send({ ...validSignUpBody, name: '' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/signin (sign in)', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth').send(validSignUpBody)
  })

  it('should sign in successfully and return 200', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ username: 'john_doe', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Sign in successful')
  })

  it('should set a token cookie on success', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ username: 'john_doe', password: 'password123' })

    const cookies = res.headers['set-cookie'] as unknown as string[]
    expect(cookies).toBeDefined()
    const token = extractCookieValue(cookies, 'token')
    expect(token).toBeDefined()
  })

  it('should return 404 when username does not exist', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ username: 'non_existing_user', password: 'password123' })

    expect(res.status).toBe(404)
  })

  it('should return 404 when password is incorrect', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ username: 'john_doe', password: 'wrong_password' })

    expect(res.status).toBe(404)
  })

  it('should return 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/signin').send({ username: 'john_doe' })

    expect(res.status).toBe(400)
  })
})
