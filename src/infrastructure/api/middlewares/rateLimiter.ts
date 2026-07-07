import rateLimit from 'express-rate-limit'

export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, try later in 5 minutes',
})

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, try later in 15 minutes',
})
