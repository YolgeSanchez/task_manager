import z from 'zod'

export const ProjectIdInputSchema = z.object({
  projectId: z.uuidv4('Project ID must be a valid UUIDv4 string'),
})

export type ProjectIdInput = z.infer<typeof ProjectIdInputSchema>
