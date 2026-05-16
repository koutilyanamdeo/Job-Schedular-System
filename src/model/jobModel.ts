import { prisma } from "../lib/prisma.ts";
import type { Prisma } from "@prisma/client";

export class JobService {
    // Using Prisma.JobCreateInput ensures you follow the schema strictly
    static async createJob(jobData: Prisma.JobUncheckedCreateInput) {
        return prisma.job.create({ 
            data: jobData, 
        });
    }

    static async findAll(userId: string) {
        return prisma.job.findMany({
            where: { userId: userId }, // Only show pending jobs for dashboard
            orderBy: { createdAt: 'desc' } // Usually helpful for dashboard views
        });
    }

    static async findOne(id: string) {
        return prisma.job.findUnique({
            where: { id: Number(id) }
        });
    }

    // Changed 'any' to Prisma.JobUpdateInput for better IDE autocomplete
    static async updateJob(id: string, jobData: Prisma.JobUpdateInput) {
        return prisma.job.update({
            where: { id: Number(id) },
            data: jobData
        });
    }

    static async deleteJob(id: string) {
        return prisma.job.delete({
            where: { id: Number(id) }
        });
    }
}