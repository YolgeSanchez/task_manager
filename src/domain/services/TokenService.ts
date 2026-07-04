import type { Token } from '../types/types.js'

export interface TokenPayload {
  sub: string
  username: string
  iat?: number
  exp?: number
}

export interface TokenService {
  generateToken(payload: TokenPayload, expiresIn?: number): Promise<Token>
  /** [ verifyToken ]: Verifies the validity of a token and returns the decoded payload if valid, or null if invalid. */
  verifyToken(token: Token): Promise<TokenPayload | null>
  /** [ decodeToken ]: Decodes the token without verifying its signature, returning the payload if the token is well-formed, or null if not. */
  decodeToken(token: Token): Promise<TokenPayload | null>
}
