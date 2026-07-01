import { v4 as uuidv4 } from "uuid";
import { Task } from "../../../domain/entities/Task.js";
import type { TaskRepository } from "../../../domain/repositories/TaskRepository.js";
import type { TaskInput, TaskOutput } from "../../dtos/task.dto.js";

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) { }

  async execute(taskInput: TaskInput): Promise<TaskOutput> {
    const task = new Task(uuidv4(), { ...taskInput, createdAt: new Date() });
    const savedTask = await this.taskRepository.save(task);
    return savedTask.toJSON();
  }
}
