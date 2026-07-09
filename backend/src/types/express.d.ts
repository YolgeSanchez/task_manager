import type { TokenPayload } from '../domain/services/TokenService.ts'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}
