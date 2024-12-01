import { PrismaClient } from "@prisma/client";
import { pagination } from "prisma-extension-pagination";

const extendedPrisma = new PrismaClient().$extends(
  pagination({
    pages: {
      limit: 10,
      includePageCount: true,
    },
  }),
);

const globalForPrisma = global as unknown as { prisma: typeof extendedPrisma };

export const prisma = globalForPrisma.prisma || extendedPrisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
