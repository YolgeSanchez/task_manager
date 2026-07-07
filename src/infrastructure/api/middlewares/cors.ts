import cors from 'cors'
import { NotAllowedByCorsError } from '../errors/NotAllowedByCorsError.js'

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // permite requests sin origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new NotAllowedByCorsError())
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
})
