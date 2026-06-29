import { EarlyDeadlineError } from "../errors/EarlyDeadlineError.js";
import { EmptyNameError } from "../errors/EmptyNameError.js";
import type { ID, TaskStatus } from "../types/types.js";

interface TaskProps {
  name: string;
  description: string;
  status: TaskStatus;
  deadline: Date;
}

export class Task {
  private readonly createdAt: Date = new Date();

  constructor(
    public readonly id: ID,
    private props: TaskProps,
  ) {
    if (props.name.length == 0) throw new EmptyNameError();
    if (props.deadline < this.createdAt) throw new EarlyDeadlineError();
  }

  private isValidStatus(status: string): status is TaskStatus {
    return ["completed", "cancelled", "in_process"].includes(status);
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get status() {
    return this.props.status;
  }

  get deadline() {
    return this.props.deadline;
  }

  set name(name: string) {
    if (name.length == 0) throw new EmptyNameError();
    this.props.name = name;
  }

  set description(description: string) {
    this.props.description = description;
  }

  set status(status: TaskStatus) {
    if (this.isValidStatus(status)) this.props.status = status;
  }

  set deadline(deadline: Date) {
    if (deadline < this.createdAt) throw new EarlyDeadlineError();
    this.props.deadline = deadline;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.props.name,
      description: this.props.description,
      status: this.props.status,
      createdAt: this.createdAt,
      deadline: this.props.deadline,
    };
  }
}
