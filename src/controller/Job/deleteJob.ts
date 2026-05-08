import type { Request , Response } from "express";
import { JobService } from "../../model/jobModel.ts";

const deleteJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ success: false, message: "Job ID is required" });
    }
    try {
        const existingJob = await JobService.findOne(`${id}`);
        if (!existingJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        
        const response = await JobService.deleteJob(`${id}`);
        return res.status(200).json({ success: true, message: "Job deleted successfully" , res:response});
    }
    catch (error) {
        console.error("Error deleting job:", error);
        return res.status(500).json({ success: false, message: "Failed to delete job" });
    }
};

export default deleteJob;