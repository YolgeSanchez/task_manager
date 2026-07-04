import { Router } from 'express'
import { authController } from '../containers/auth.index.js'
import { validateCreateUser } from '../middlewares/userValidators.js'

const router = Router()
router.post('/auth', validateCreateUser, authController.signUp)

export { router as AuthRoutes }
