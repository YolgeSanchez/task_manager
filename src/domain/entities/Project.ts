import { DeleteProjectOwnerError } from '../errors/DeleteProjectOwnerError.js'
import { EmptyNameError } from '../errors/EmptyNameError.js'
import { InvalidNameError } from '../errors/InvalidNameError.js'
import { MemberAlreadyInProjectError } from '../errors/MemberAlreadyInProjectError.js'
import { MemberNotInProjectError } from '../errors/MemberNotInProjectError.js'
import { ProjectDeletedError } from '../errors/ProjectDeletedError.js'
import { TaskAlreadyInProjectError } from '../errors/TaskAlreadyInProjectError.js'
import { TaskNotInProjectError } from '../errors/TaskNotInProjectError.js'
import type { ID } from '../types/types.js'

interface ProjectProps {
  name: string
  ownerId: ID
  tasksIds: ID[]
  membersIds: ID[]
  createdAt: Date
}

export class Project {
  private deletedAt?: Date

  constructor(
    public readonly id: ID,
    private props: ProjectProps,
  ) {
    this.validateName(props.name)
  }

  // [ validations ]
  private validateName(name: string): boolean {
    if (name.length == 0) throw new EmptyNameError()
    if (name.length < 3) throw new InvalidNameError()
    return true
  }

  // [ logic methods ]
  deleteProject() {
    if (this.deletedAt) throw new ProjectDeletedError()
    this.deletedAt = new Date()
  }

  addMember(memberId: ID) {
    if (this.props.membersIds.includes(memberId)) throw new MemberAlreadyInProjectError()
    this.props.membersIds.push(memberId)
  }

  removeMember(memberId: ID) {
    if (memberId == this.props.ownerId) throw new DeleteProjectOwnerError()
    for (let idx = 0; idx < this.props.membersIds.length; idx++) {
      if (memberId == this.props.membersIds[idx]) {
        this.props.membersIds.splice(idx, 1)
        return
      }
    }

    throw new MemberNotInProjectError()
  }

  addTask(taskId: ID) {
    if (this.props.tasksIds.includes(taskId)) throw new TaskAlreadyInProjectError()
    this.props.tasksIds.push(taskId)
  }

  removeTask(taskId: ID) {
    for (let idx = 0; idx < this.props.tasksIds.length; idx++) {
      if (taskId == this.props.tasksIds[idx]) {
        this.props.tasksIds.splice(idx, 1)
        return
      }
    }

    throw new TaskNotInProjectError()
  }

  // [ getters and setters ]
  get name() {
    return this.props.name
  }

  get tasksIds() {
    return this.props.tasksIds
  }

  get ownerId() {
    return this.props.ownerId
  }

  get membersIds() {
    return this.props.membersIds
  }

  get createdAt() {
    return this.props.createdAt
  }

  set name(name: string) {
    this.validateName(name)
    this.props.name = name
  }

  toJSON() {
    return {
      id: this.id,
      name: this.props.name,
      ownerId: this.props.ownerId,
      tasksIds: this.props.tasksIds,
      membersIds: this.props.membersIds,
      createdAt: this.props.createdAt,
    }
  }
}
