import { EmptyEmailError } from '../errors/EmptyEmailError.js'
import { EmptyLastNameError } from '../errors/EmptyLastNameError.js'
import { EmptyNameError } from '../errors/EmptyNameError.js'
import { EmptyPasswordError } from '../errors/EmptyPasswordError.js'
import { EmptyUsernameError } from '../errors/EmptyUsernameError.js'
import { InvalidEmailError } from '../errors/InvalidEmailError.js'
import { InvalidLastNameError } from '../errors/InvalidLastNameError.js'
import { InvalidNameError } from '../errors/InvalidNameError.js'
import { InvalidPasswordError } from '../errors/InvalidPasswordError.js'
import { InvalidUsernameError } from '../errors/InvalidUsernameError.js'
import { UserDeletedError } from '../errors/UserDeletedError.js'
import type { ID } from '../types/types.js'

interface UserProps {
  username: string
  name: string
  lastName: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export class User {
  private deletedAt?: Date

  constructor(
    public readonly id: ID,
    private props: UserProps,
  ) {
    this.validateUsername(props.username)
    this.validateName(props.name)
    this.validateLastName(props.lastName)
    this.validateEmail(props.email)
    this.validatePassword(props.password)
  }

  // [ validation methods ]
  private validateUsername(username: string): boolean {
    if (username.length == 0) throw new EmptyUsernameError()
    if (!/^[a-zA-Z0-9_]{3,}$/.test(username)) throw new InvalidUsernameError()
    return true
  }

  private validateName(name: string): boolean {
    if (name.length == 0) throw new EmptyNameError()
    if (name.length < 3) throw new InvalidNameError()
    return true
  }

  private validateLastName(lastName: string): boolean {
    if (lastName.length == 0) throw new EmptyLastNameError()
    if (lastName.length < 3) throw new InvalidLastNameError()
    return true
  }

  private validateEmail(email: string): boolean {
    if (email.length == 0) throw new EmptyEmailError()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InvalidEmailError()
    return true
  }

  private validatePassword(password: string): boolean {
    if (password.length == 0) throw new EmptyPasswordError()
    if (password.length < 8) throw new InvalidPasswordError()
    return true
  }

  // [ bussiness logic methods ]
  deleteUser() {
    if (this.deletedAt) throw new UserDeletedError()
    this.deletedAt = new Date()
  }

  // [ getters and setters ]
  get username() {
    return this.props.username
  }

  get name() {
    return this.props.name
  }

  get lastName() {
    return this.props.lastName
  }

  get fullName() {
    return `${this.props.name} ${this.props.lastName}`
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set username(username: string) {
    this.validateUsername(username)
    this.props.username = username
    this.props.updatedAt = new Date()
  }

  set name(name: string) {
    this.validateName(name)
    this.props.name = name
    this.props.updatedAt = new Date()
  }

  set lastName(lastName: string) {
    this.validateLastName(lastName)
    this.props.lastName = lastName
    this.props.updatedAt = new Date()
  }

  set email(email: string) {
    this.validateEmail(email)
    this.props.email = email
    this.props.updatedAt = new Date()
  }

  set password(password: string) {
    this.validatePassword(password)
    this.props.password = password
    this.props.updatedAt = new Date()
  }

  toJSON() {
    return {
      id: this.id,
      username: this.props.username,
      fullName: this.fullName,
      name: this.props.name,
      lastName: this.props.lastName,
      email: this.props.email,
      password: this.props.password,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.deletedAt,
    }
  }
}
