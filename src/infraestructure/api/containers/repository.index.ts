import { PrismaProjectRepository } from '../../persistence/repositories/PrismaProjectRepository.js'
import { PrismaTaskRepository } from '../../persistence/repositories/PrismaTaskRepository.js'
import { PrismaUserRepository } from '../../persistence/repositories/PrismaUserRepository.js'

export const prismaTaskRepository = new PrismaTaskRepository()
export const prismaUserRepository = new PrismaUserRepository()
export const prismaProjectRepository = new PrismaProjectRepository()
