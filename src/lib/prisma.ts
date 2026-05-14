import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
// import { PrismaClient } from '../../generated/prisma/client.ts';
import pkg from "@prisma/client";
const { PrismaClient } = pkg as { PrismaClient: any };

const adapter = new PrismaMariaDb({

 host: process.env.DATABASE_HOST || "127.0.0.1",
  port: Number(process.env.DATABASE_PORT) || 3306, // Add this line!
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "",
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };