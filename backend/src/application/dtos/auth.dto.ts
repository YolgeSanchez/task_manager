import z from 'zod'
import type { UserOutput } from './user.dto.js'

export const SignUpInputSchema = z.object({
  username: z.string('Username must be a defined string').min(1, { message: 'Username cannot be empty' }),
  name: z.string('Name must be a defined string').min(1, { message: 'Name cannot be empty' }),
  lastName: z.string('Last name must be a defined string').min(1, { message: 'Last name cannot be empty' }),
  email: z.email('Email must be a valid email address'),
  password: z.string('Password must be a defined string'),
})

export const SignInInputSchema = z.object({
  username: z.string('Username must be a defined string').min(1, { message: 'Username cannot be empty' }),
  password: z.string('Password must be a defined string'),
})

export interface SignUpOutput {
  user: UserOutput
  token: string
}

export interface SignInInput {
  username: string
  password: string
}
