import { Router } from 'express'
import { userController } from '../containers/user.index.js'
import { validateIdParam } from '../schemas/paramsValidators.js'
import { validateUpdateUser } from '../schemas/userValidators.js'

const router = Router()

router.get('/users', userController.findAllUsers)
router.get('/users/:id', validateIdParam, userController.findUserById)
router.patch('/users/:id', validateIdParam, validateUpdateUser, userController.updateUser)
router.delete('/users/:id', validateIdParam, userController.deleteUser)

export { router as UserRoutes }
