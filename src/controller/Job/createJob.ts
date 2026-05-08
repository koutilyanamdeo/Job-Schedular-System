import type { Request, Response } from "express";
import * as parser from "cron-parser";
import { JobService } from "../../model/jobModel.ts";
import { sendJobEvent } from "../../lib/kafka.ts";


const getDynamicCron = (date: Date, frequency: string): string => {
    const mins = date.getMinutes();
    const hours = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    switch (frequency.toLowerCase()) {
        case 'daily':   return `${mins} ${hours} * * *`;
        case 'weekly':  return `${mins} ${hours} * * ${dayOfWeek}`;
        case 'monthly': return `${mins} ${hours} ${day} * *`;
        case 'yearly':  return `${mins} ${hours} ${day} ${month} *`;
        default: return "";
    }
};

const createJob = async (req: Request, res: Response) => {
    try {
        const { type, frequencyType, payload, nextRunTime } = req.body;
        const userId = (req as any).user.id;
         
        const scheduledTime = nextRunTime ? new Date(nextRunTime) : new Date();
        let cronString = frequencyType !== 'once' ? getDynamicCron(scheduledTime, frequencyType) : null;

        const newJob = await JobService.createJob({
            type,
            frequencyType,
            cronExpression: cronString,
            payload, // { email, subject, body }
            status: "PENDING",
            nextRunTime: scheduledTime,
            userId: userId
        });

        // Publish to Kafka for async processing
        await sendJobEvent(newJob.id, newJob);

        return res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export default createJob;