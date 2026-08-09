import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires an explicit driver adapter — there's no built-in
// connection engine anymore. This adapter wraps the `pg` driver.
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });

// Next.js hot-reloads server code in dev, which would otherwise create
// a new PrismaClient (and new DB connection pool) on every file save.
// Stashing it on `globalThis` keeps one instance across reloads.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}