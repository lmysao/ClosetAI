import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Em produção, usa Supabase; em dev, usa SQLite local
const databaseUrl = process.env.NODE_ENV === 'production' 
  ? process.env.SUPABASE_DATABASE_URL 
  : process.env.DATABASE_URL;

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
