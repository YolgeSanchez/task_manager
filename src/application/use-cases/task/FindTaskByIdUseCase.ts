import { TaskNotFoundError } from "../../../domain/errors/TaskNotFoundError.js";
import type { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import type { ID } from "../../../domain/types/types.js";
import type { TaskOutput } from "../../dtos/task.dto.js";

export class FindTaskByIdUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: ID): Promise<TaskOutput> {
    const task = await this.taskRepository.findById(id);
    if (task == null) throw new TaskNotFoundError();

    return task.toJSON();
  }
}
