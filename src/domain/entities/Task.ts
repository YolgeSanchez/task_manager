import { EarlyDeadlineError } from "../errors/EarlyDeadlineError.js";
import { EmptyNameError } from "../errors/EmptyNameError.js";
import type { ID, TaskStatus } from "../types/types.js";

interface TaskProps {
  name: string;
  description: string;
  status: TaskStatus;
  userId: ID;
  createdAt: Date;
  deadline: Date;
}

export class Task {

  constructor(
    public readonly id: ID,
    private props: TaskProps,
  ) {
    if (props.name.length == 0) throw new EmptyNameError();
    if (props.deadline < props.createdAt) throw new EarlyDeadlineError();
  }

  // [ validation methods ]
  private isValidStatus(status: string): status is TaskStatus {
    return ["completed", "cancelled", "in_process"].includes(status);
  }

  // [ getters and setters ]
  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get status() {
    return this.props.status;
  }

  get userId() {
    return this.props.userId;
  }

  get deadline() {
    return this.props.deadline;
  }

  get createdAt() {
    return this.props.createdAt;
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
    if (deadline < this.props.createdAt) throw new EarlyDeadlineError();
    this.props.deadline = deadline;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.props.name,
      description: this.props.description,
      status: this.props.status,
      userId: this.props.userId,
      createdAt: this.props.createdAt,
      deadline: this.props.deadline,
    };
  }
}
