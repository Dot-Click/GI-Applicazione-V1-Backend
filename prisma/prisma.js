import { PrismaClient } from "@prisma/client";
import { formatDate } from "../src/lib/utils.js";

const prisma = new PrismaClient({
  // log: ['query'],
});

prisma.$extends({
  name: "format-dates-extension",
  result: {
    $allModels: {
      createdAt: {
        needs: { createdAt: true },
        compute(record) {
          return formatDate(record.createdAt);
        },
      },
      updatedAt: {
        needs: { updatedAt: true },
        compute(record) {
          return formatDate(record.updatedAt);
        },
      },
    },
  },
});

export default prisma;
