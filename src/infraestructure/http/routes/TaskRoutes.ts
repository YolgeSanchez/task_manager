import { Router } from 'express'
import { taskController } from '../containers/task.index.js'
import { validateIdParam } from '../schemas/idValidator.js'
import { validateCreateTask, validateProjectIdParam, validateUpdateTask } from '../schemas/taskValidators.js'

const router = Router()

router.get('/tasks', taskController.findAllTasks)
router.get('/projects/:projectId/tasks', validateProjectIdParam, taskController.findAllTasksByProjectId)
router.get('/tasks/:id', validateIdParam, taskController.findTaskById)
router.post('/tasks', validateCreateTask, taskController.createTask)
router.patch('/tasks/:id', validateIdParam, validateUpdateTask, taskController.updateTask)
router.delete('/tasks/:id', validateIdParam, taskController.deleteTask)

export { router as TaskRoutes }
