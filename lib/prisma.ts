import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

function createPrismaClient() {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: true },
  });
  const adapter = new PrismaPg(pool);
  return { client: new PrismaClient({ adapter }), pool };
}

let _prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const { client } = createPrismaClient();
  _prisma = client;
} else {
  if (!globalForPrisma.prisma) {
    const { client, pool } = createPrismaClient();
    globalForPrisma.prisma = client;
    globalForPrisma.pool = pool;
  }
  _prisma = globalForPrisma.prisma;
}

export const prisma = _prisma;
