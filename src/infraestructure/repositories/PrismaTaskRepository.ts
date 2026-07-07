import { Task } from '../../domain/entities/Task.js'
import type { TaskRepository } from '../../domain/repositories/TaskRepository.js'
import type { ID, SuccessMessage } from '../../domain/types/types.js'
import type { TaskModel } from '../../generated/prisma/models.js'
import { prisma } from '../libs/prisma.js'

export class PrismaTaskRepository implements TaskRepository {
  async save(task: Task): Promise<Task> {
    const { createdAt: _, ...taskData } = task.toJSON()

    const saved = await prisma.task.create({
      data: {
        ...taskData,
      },
    })

    return this.toEntity(saved)
  }

  async update(task: Task): Promise<Task> {
    const { createdAt: _, ...taskData } = task.toJSON()

    const updated = await prisma.task.update({
      where: { id: task.id },
      data: {
        ...taskData,
      },
    })

    return this.toEntity(updated)
  }

  async deleteById(id: ID): Promise<SuccessMessage> {
    await prisma.task.delete({
      where: { id },
    })

    return `Task has been deleted successfully.`
  }

  async findAllByUserId(userId: ID): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { userId: userId },
    })
    return tasks.map((task) => this.toEntity(task))
  }

  async findAllByProjectId(projectId: ID): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { projectId: projectId },
    })
    return tasks.map((task) => this.toEntity(task))
  }

  async findById(id: ID): Promise<Task | null> {
    const task = await prisma.task.findUnique({ where: { id } })
    return task ? this.toEntity(task) : null
  }

  private toEntity(task: TaskModel): Task {
    return new Task(task.id, {
      name: task.name,
      description: task.description,
      status: task.status,
      userId: task.userId,
      projectId: task.projectId,
      createdAt: task.createdAt,
      deadline: task.deadline,
    })
  }
}
