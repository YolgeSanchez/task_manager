import type { Task } from "../../../domain/entities/Task.js";
import type { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import type { TaskOutput } from "../../dtos/task.dto.js";

export class FindAllTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) { }

  async execute(): Promise<TaskOutput[]> {
    const tasks = await this.taskRepository.findAll();
    return tasks.map((task) => task.toJSON());
  }
}
