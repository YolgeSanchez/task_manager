import type { NextFunction, Request, Response } from 'express'
import type { ProjectInput, UpdateProjectInput } from '../../../application/dtos/project.dto.js'
import type { AddProjectMemberUseCase } from '../../../application/use-cases/project/AddProjectMemberUseCase.js'
import type { AddProjectTaskUseCase } from '../../../application/use-cases/project/AddProjectTaskUseCase.js'
import type { CreateProjectUseCase } from '../../../application/use-cases/project/CreateProjectUseCase.js'
import type { DeleteProjectUseCase } from '../../../application/use-cases/project/DeleteProjectUseCase.js'
import type { FindAllUserProjectsUseCase } from '../../../application/use-cases/project/FindAllUserProjects.js'
import type { FindProjectByIdUseCase } from '../../../application/use-cases/project/FindProjectByIdUseCase.js'
import type { RemoveProjectMemberUseCase } from '../../../application/use-cases/project/RemoveProjectMemberUseCase.js'
import type { RemoveProjectTaskUseCase } from '../../../application/use-cases/project/RemoveProjectTaskUseCase.js'
import type { UpdateProjectUseCase } from '../../../application/use-cases/project/UpdateProjectUseCase.js'
import { UnauthorizedError } from '../errors/UnauthorizedError.js'

export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,

    private readonly addProjectTaskUseCase: AddProjectTaskUseCase,
    private readonly removeProjectTaskUseCase: RemoveProjectTaskUseCase,
    private readonly addProjectMemberUseCase: AddProjectMemberUseCase,
    private readonly removeProjectMemberUseCase: RemoveProjectMemberUseCase,

    private readonly findAllUserProjectsUseCase: FindAllUserProjectsUseCase,
    private readonly findProjectByIdUseCase: FindProjectByIdUseCase,
  ) {}

  createProject = async (req: Request<{}, {}, ProjectInput>, res: Response, next: NextFunction) => {
    try {
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const project = await this.createProjectUseCase.execute(req.body, requestedById)
      res.status(201).json(project)
    } catch (err) {
      next(err)
    }
  }

  updateProject = async (
    req: Request<{ id: string }, {}, UpdateProjectInput>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const project = await this.updateProjectUseCase.execute(req.params.id, requestedById, req.body)
      res.status(200).json(project)
    } catch (err) {
      next(err)
    }
  }

  deleteProject = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const message = await this.deleteProjectUseCase.execute(req.params.id, requestedById)
      res.status(200).json({ message })
    } catch (err) {
      next(err)
    }
  }

  addProjectTask = async (
    req: Request<{ id: string; taskId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const project = await this.addProjectTaskUseCase.execute(
        req.params.id,
        req.params.taskId,
        requestedById,
      )
      res.status(200).json(project)
    } catch (err) {
      next(err)
    }
  }

  removeProjectTask = async (
    req: Request<{ id: string; taskId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const project = await this.removeProjectTaskUseCase.execute(
        req.params.id,
        req.params.taskId,
        requestedById,
      )
      res.status(200).json(project)
    } catch (err) {
      next(err)
    }
  }

  addProjectMember = async (
    req: Request<{ id: string; memberId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const project = await this.addProjectMemberUseCase.execute(
        req.params.id,
        req.params.memberId,
        requestedById,
      )
      res.status(200).json(project)
    } catch (err) {
      next(err)
    }
  }

  removeProjectMember = async (
    req: Request<{ id: string; memberId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const project = await this.removeProjectMemberUseCase.execute(
        req.params.id,
        req.params.memberId,
        requestedById,
      )
      res.status(200).json(project)
    } catch (err) {
      next(err)
    }
  }

  findAllUserProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const projects = await this.findAllUserProjectsUseCase.execute(requestedById)
      res.status(200).json(projects)
    } catch (err) {
      next(err)
    }
  }

  findProjectById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { sub: requestedById } = this.getAuthenticatedUser(req)
      const project = await this.findProjectByIdUseCase.execute(id, requestedById)
      res.status(200).json(project)
    } catch (err) {
      next(err)
    }
  }

  private getAuthenticatedUser(req: Request) {
    if (!req.user) throw new UnauthorizedError()
    return req.user
  }
}
