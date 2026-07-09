import type z from 'zod'
import type { ID } from '../../domain/types/types.js'
import { SignUpInputSchema } from './auth.dto.js'

export const UpdateUserInputSchema = SignUpInputSchema.partial()

export type UserInput = z.infer<typeof SignUpInputSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>

export interface UserOutput {
  id: ID
  username: string
  fullName: string
  name: string
  lastName: string
  email: string
  createdAt: Date
  updatedAt: Date
}
