import cookieParser from 'cookie-parser'
import express, { type Application } from 'express'
import { joseTokenService } from './infraestructure/http/containers/auth.index.js'
import { authMiddleware } from './infraestructure/http/middlewares/AuthMiddleware.js'
import { errorHandler } from './infraestructure/http/middlewares/errorHandler.js'
import { AuthRoutes } from './infraestructure/http/routes/AuthRoutes.js'
import { TaskRoutes } from './infraestructure/http/routes/TaskRoutes.js'
import { UserRoutes } from './infraestructure/http/routes/UserRoutes.js'

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

// [ auth ]
app.use('/api', AuthRoutes)
app.use(authMiddleware(joseTokenService))

// [ app routes ]
app.use('/api', UserRoutes)
app.use('/api', TaskRoutes)

// [ error handler ]
app.use(errorHandler)

// [ export ]
export default app
