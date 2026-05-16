import type { Request, Response } from "express";
import { JobService } from "../../model/jobModel.ts";

const updateJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, subject, body, frequencyType, nextRunTime } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: "Job ID is required" });
    }
    
    try {
        const existingJob = await JobService.findOne(`${id}`);
        if (!existingJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        
        const updatedData: any = {};

        if (name) updatedData.name = name;
        if (email) updatedData.email = email;
        if (subject) updatedData.subject = subject;
        if (body) updatedData.body = body;
        if (frequencyType) updatedData.frequencyType = frequencyType;
        if (nextRunTime) updatedData.nextRunTime = new Date(nextRunTime);
        
        const updatedJob = await JobService.updateJob(`${id}`, updatedData);
        return res.status(200).json({ success: true, data: updatedJob });
    }
    catch (error) {
        console.error("Error updating job:", error);
        return res.status(500).json({ success: false, message: "Failed to update job" });
    }
};

export default updateJob;
