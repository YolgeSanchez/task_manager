import { PrismaTaskRepository } from '../../repositories/PrismaTaskRepository.js'
import { PrismaUserRepository } from '../../repositories/PrismaUserRepository.js'

export const prismaTaskRepository = new PrismaTaskRepository()
export const prismaUserRepository = new PrismaUserRepository()
