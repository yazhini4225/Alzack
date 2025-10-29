import { PrismaClient } from '@prisma/client'
const prisma = global.prisma || new PrismaClient()
if (!global.prisma) global.prisma = prisma
export default prisma
