import type { Request, Response } from "express";
import { JobService } from "../../model/jobModel.ts";

const fetchJob = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    try {
        const jobs = await JobService.findAll(`${userId}`);
        return res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch jobs" });
    }
};

export default fetchJob;
