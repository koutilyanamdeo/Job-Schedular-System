import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
// import { PrismaClient } from '../../generated/prisma/client.ts';
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

const adapter = new PrismaMariaDb(
  databaseUrl || {
    host: process.env.DATABASE_HOST || process.env.MYSQLHOST || "127.0.0.1",
    port: Number(process.env.DATABASE_PORT || process.env.MYSQLPORT) || 3306,
    user: process.env.DATABASE_USER || process.env.MYSQLUSER || "root",
    password: process.env.DATABASE_PASSWORD || process.env.MYSQLPASSWORD || "",
    database: process.env.DATABASE_NAME || process.env.MYSQLDATABASE || "",
    connectionLimit: 5,
  }
);
const prisma = new PrismaClient({ adapter });

export { prisma };
