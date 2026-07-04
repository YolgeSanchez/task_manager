import { exportPKCS8, exportSPKI, generateKeyPair } from 'jose'

const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true })

const privatePem = await exportPKCS8(privateKey)
const publicPem = await exportSPKI(publicKey)

console.log('Copy this to your .env:')
console.log(`PRIVATE_KEY="${privatePem.replaceAll('\n', '\\n')}"`)
console.log(`PUBLIC_KEY="${publicPem.replaceAll('\n', '\\n')}"`)
