import { Router } from 'express'
import { taskController } from '../containers/task.index.js'
import { validateIdParam } from '../middlewares/idValidator.js'
import { validateCreateTask, validateUpdateTask } from '../middlewares/taskValidators.js'

const router = Router()

router.get('/tasks', taskController.findAllTasks)
router.get('/tasks/:id', validateIdParam, taskController.findTaskById)
router.post('/tasks', validateCreateTask, taskController.createTask)
router.patch('/tasks/:id', validateIdParam, validateUpdateTask, taskController.updateTask)
router.delete('/tasks/:id', validateIdParam, taskController.deleteTask)

export { router as TaskRoutes }
