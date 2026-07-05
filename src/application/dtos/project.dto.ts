import z from 'zod'

export const ProjectInputSchema = z.object({
  name: z.string('Name must be a defined string').min(1, { message: 'Name cannot be empty' }),
})

export const UpdateProjectInputSchema = z.object({
  name: z.string('Name must be a defined string').min(1, { message: 'Name cannot be empty' }),
})

export const TaskIdInputSchema = z.object({
  taskId: z.uuidv4('Task ID must be a valid UUIDv4 string'),
})

export const MemberIdInputSchema = z.object({
  memberId: z.uuidv4('Member ID must be a valid UUIDv4 string'),
})

export type ProjectInput = z.infer<typeof ProjectInputSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>
export type TaskIdInput = z.infer<typeof TaskIdInputSchema>
export type MemberIdInput = z.infer<typeof MemberIdInputSchema>

export interface ProjectOutput {
  id: string
  name: string
  ownerId: string
  tasksIds: string[]
  membersIds: string[]
  createdAt: Date
}
