import { Router } from 'express'
import { authController } from '../containers/auth.index.js'
import { validateSignInUser, validateSignUpUser } from '../schemas/authValidators.js'

const router = Router()
router.post('/auth', validateSignUpUser, authController.signUp)
router.post('/auth/signin', validateSignInUser, authController.signIn)

export { router as AuthRoutes }
