import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    // During build without a database URL, return a noop proxy
    // Pages importing prisma must use `export const dynamic = "force-dynamic"`
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === "$connect" || prop === "$disconnect" || prop === "$transaction") {
          return () => Promise.resolve();
        }
        // Return nested proxy for model access (prisma.user.findUnique, etc.)
        return new Proxy(() => {}, {
          get() {
            return () => {
              throw new Error(
                "DATABASE_URL is not set. Database access is not available at build time."
              );
            };
          },
          apply() {
            throw new Error(
              "DATABASE_URL is not set. Database access is not available at build time."
            );
          },
        });
      },
    });
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
