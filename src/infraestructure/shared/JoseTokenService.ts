import { decodeJwt, importPKCS8, importSPKI, jwtVerify, SignJWT, type JWTPayload } from 'jose'
import type { TokenPayload, TokenService } from '../../domain/services/TokenService.js'
import type { Token } from '../../domain/types/types.js'

export class JoseTokenService implements TokenService {
  private readonly privateKey: string
  private readonly publicKey: string

  constructor() {
    this.privateKey = process.env.PRIVATE_KEY!.replaceAll('\\n', '\n')
    this.publicKey = process.env.PUBLIC_KEY!.replaceAll('\\n', '\n')
  }

  async generateToken(payload: TokenPayload, expiresIn: number = 3600): Promise<Token> {
    const privateKey = await importPKCS8(this.privateKey, 'RS256')

    const josePayload: JWTPayload = {
      sub: payload.sub,
      username: payload.username,
    }

    return new SignJWT(josePayload)
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
      .sign(privateKey)
  }

  async verifyToken(token: Token): Promise<TokenPayload | null> {
    try {
      const publicKey = await importSPKI(this.publicKey, 'RS256')
      const { payload } = await jwtVerify(token, publicKey)
      return payload as unknown as TokenPayload
    } catch {
      return null
    }
  }

  async decodeToken(token: Token): Promise<TokenPayload | null> {
    try {
      const payload = decodeJwt(token)
      return payload as unknown as TokenPayload
    } catch {
      return null
    }
  }
}
