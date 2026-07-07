import { Project } from '../../../domain/entities/Project.js'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository.js'
import type { ID, SuccessMessage } from '../../../domain/types/types.js'
import { prisma } from '../prisma.js'

type ProjectWithRelations = {
  id: string
  name: string
  ownerId: string
  createdAt: Date
  deletedAt: Date | null
  members: { id: string }[]
  tasks: { id: string }[]
}

export class PrismaProjectRepository implements ProjectRepository {
  async save(project: Project): Promise<Project> {
    const saved = await prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        ownerId: project.ownerId,
        members: {
          connect: { id: project.ownerId },
        },
      },
      include: { members: true, tasks: true },
    })
    return this.toEntity(saved)
  }

  async update(project: Project): Promise<Project> {
    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        members: {
          set: project.membersIds.map((id) => ({ id })),
        },
        tasks: {
          set: project.tasksIds.map((id) => ({ id })),
        },
      },
      include: { members: true, tasks: true },
    })
    return this.toEntity(updated)
  }

  async deleteById(id: ID): Promise<SuccessMessage> {
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return 'Project has been deleted successfully.'
  }

  async findAllUserProjects(userId: ID): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        members: { some: { id: userId } },
      },
      include: { members: true, tasks: true },
    })
    return projects.map((project) => this.toEntity(project))
  }

  async findById(id: ID): Promise<Project | null> {
    const project = await prisma.project.findUnique({
      where: { id, deletedAt: null },
      include: { members: true, tasks: true },
    })
    return project ? this.toEntity(project) : null
  }

  private toEntity(project: ProjectWithRelations): Project {
    return new Project(project.id, {
      name: project.name,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      membersIds: project.members.map((m) => m.id),
      tasksIds: project.tasks.map((t) => t.id),
    })
  }
}
