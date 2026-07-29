import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: process.env.DATABASE_URL
    ? undefined // Use direct connection adapter automatically 
    : undefined,
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
