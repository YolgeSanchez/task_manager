import cookieParser from 'cookie-parser'
import express, { type Application } from 'express'
import { joseTokenService } from './infrastructure/api/containers/auth.index.js'
import { authMiddleware } from './infrastructure/api/middlewares/authMiddleware.js'
import { errorHandler } from './infrastructure/api/middlewares/errorHandler.js'
import { apiRateLimiter, authRateLimiter } from './infrastructure/api/middlewares/rateLimiter.js'
import { AuthRoutes } from './infrastructure/api/routes/AuthRoutes.js'
import { projectRoutes } from './infrastructure/api/routes/ProjectRoutes.js'
import { TaskRoutes } from './infrastructure/api/routes/TaskRoutes.js'
import { UserRoutes } from './infrastructure/api/routes/UserRoutes.js'

// [ app ]
const app: Application = express()

// [ middlewares ]
app.use(express.json())
app.use(cookieParser())

// [ routes ]
app.get('/health', (_, res) => {
  console.log('>>> Running healthy...')
  res.send('Healthy')
})

// [ rate limiters ]
app.use('/api/auth', authRateLimiter)
app.use('/api', apiRateLimiter)

// [ auth ]
app.use('/api', AuthRoutes)
app.use(authMiddleware(joseTokenService))

// [ app routes ]
app.use('/api', UserRoutes)
app.use('/api', TaskRoutes)
app.use('/api', projectRoutes)

// [ error handler ]
app.use(errorHandler)

// [ export ]
export default app
