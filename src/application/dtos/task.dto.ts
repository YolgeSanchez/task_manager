import z from 'zod'
import type { ID } from '../../domain/types/types.js'

// [ schemas ]
export const taskStatusSchema = z.enum(['completed', 'cancelled', 'in_process'])

export const TaskInputSchema = z.object({
  name: z.string('Name must be a defined string').min(1, { message: 'Name cannot be empty' }),
  description: z.string('Description must be a defined string'),
  status: taskStatusSchema,
  deadline: z.coerce.date(),
})

export const UpdateTaskInputSchema = TaskInputSchema.partial()

// [ types ]
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type TaskInput = z.infer<typeof TaskInputSchema>
export interface TaskOutput {
  id: ID
  name: string
  description: string
  status: TaskStatus
  deadline: Date
  projectId: ID | null
  createdAt: Date
  userId: ID
}
