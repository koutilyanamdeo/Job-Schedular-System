import * as parser from "cron-parser";
import { prisma } from "../lib/prisma.ts";
import { sendEmail } from "../lib/mailer.ts"; // Your email sending logic
import { CronExpressionParser } from "cron-parser";
export const runPendingJobs = async () => {
    console.log("Checking for pending jobs...");
    
    const jobs = await prisma.job.findMany({
        where: {
            status: "PENDING",
            nextRunTime: { lte: new Date() }
        }
    });

    for (const job of jobs) {
        try {
            // 1. Move to processing to avoid double-sending
            await prisma.job.update({
                where: { id: job.id },
                data: { status: "PROCESSING" }
            });

            // 2. Send the Email
            const { email, subject, body } = job.payload as any;
            await sendEmail(email, subject, body);

            // 3. Handle status/next run
            if (job.frequencyType.toLowerCase() === 'once' as any) {
                await prisma.job.update({
                    where: { id: job.id },
                    data: { status: "COMPLETED" }
                });
            } else {
                const interval = CronExpressionParser.parse(job.cronExpression!);
                await prisma.job.update({
                    where: { id: job.id },
                    data: { 
                        nextRunTime: interval.next().toDate(),
                        status: "PENDING" 
                    }
                });
            }
        } catch (error) {
            console.error(`Job ${job.id} failed:`, error);
            await prisma.job.update({
                where: { id: job.id },
                data: { status: "FAILED" }
            });
        }
    }
};