import { Router } from 'express'
import { projectController } from '../containers/project.index.js'
import { validateIdParam, validateMemberIdParam, validateTaskIdParam } from '../schemas/paramsValidators.js'
import { validateCreateProject, validateUpdateProject } from '../schemas/projectValidator.js'

const router = Router()

router.post('/projects', validateCreateProject, projectController.createProject)
router.patch('/projects/:id', validateIdParam, validateUpdateProject, projectController.updateProject)
router.delete('/projects/:id', validateIdParam, projectController.deleteProject)

router.get('/projects', projectController.findAllUserProjects)
router.get('/projects/:id', validateIdParam, projectController.findProjectById)

router.post(
  '/projects/:id/tasks/:taskId',
  validateIdParam,
  validateTaskIdParam,
  projectController.addProjectTask,
)
router.delete(
  '/projects/:id/tasks/:taskId',
  validateIdParam,
  validateTaskIdParam,
  projectController.removeProjectTask,
)

router.post(
  '/projects/:id/members/:memberId',
  validateIdParam,
  validateMemberIdParam,
  projectController.addProjectMember,
)
router.delete(
  '/projects/:id/members/:memberId',
  validateIdParam,
  validateMemberIdParam,
  projectController.removeProjectMember,
)

export { router as projectRoutes }
