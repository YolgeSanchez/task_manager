import { execSync } from 'child_process'
import { prisma } from '../../src/infrastructure/persistence/prisma.js'

export async function setup() {
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_TEST_URL,
    },
  })
}

export async function teardown() {
  await prisma.$disconnect()
}
