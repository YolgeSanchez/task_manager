import type { ID, TaskStatus } from "../../domain/types/types.js";

export interface TaskInput {
  name: string;
  description: string;
  status: TaskStatus;
  deadline: Date;
}

export interface TaskOutput {
  id: ID;
  name: string;
  description: string;
  status: TaskStatus;
  deadline: Date;
  createdAt: Date;
}
