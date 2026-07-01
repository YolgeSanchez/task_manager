import express, { type Application } from 'express'
import { TaskRoutes } from './infraestructure/http/routes/TaskRoutes.js'
import { errorHandler } from './infraestructure/http/middlewares/errorHandler.js'

// [ app ]
const app: Application = express()

// [ middlewares ]
app.use(express.json())

// [ routes ]
app.get('/health', (_, res) => {
  console.log('>>> Running healthy...')
  res.send('Healthy')
})

app.use('/api', TaskRoutes)

// [ error handler ]
app.use(errorHandler)

// [ export ]
export default app
