import z from 'zod'

export const ProjectInputSchema = z.object({
  name: z.string('Name must be a defined string').min(1, { message: 'Name cannot be empty' }),
})

export const UpdateProjectInputSchema = z.object({
  name: z.string('Name must be a defined string').min(1, { message: 'Name cannot be empty' }),
})

export type ProjectInput = z.infer<typeof ProjectInputSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>

export interface ProjectOutput {
  id: string
  name: string
  ownerId: string
  tasksIds: string[]
  membersIds: string[]
  createdAt: Date
}
