import type { Task } from '../entities/Task.js'
import type { ID, SuccessMessage } from '../types/types.js'

export interface TaskRepository {
  save(task: Task): Promise<Task>
  update(task: Task): Promise<Task>
  deleteById(id: ID): Promise<SuccessMessage>

  findAll(): Promise<Task[]>
  findAllByProjectId(projectId: ID): Promise<Task[]>
  findById(id: ID): Promise<Task | null>
}
