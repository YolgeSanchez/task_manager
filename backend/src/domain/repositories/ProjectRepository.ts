import type { Project } from '../entities/Project.js'
import type { ID, SuccessMessage } from '../types/types.js'

export interface ProjectRepository {
  save(task: Project): Promise<Project>
  update(task: Project): Promise<Project>
  deleteById(id: ID): Promise<SuccessMessage>

  findAllUserProjects(userId: ID): Promise<Project[]>
  findById(id: ID): Promise<Project | null>
}
