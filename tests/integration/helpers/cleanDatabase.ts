import { prisma } from '../../../src/infraestructure/libs/prisma.js'

export async function cleanDatabase() {
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
}
