import { Router } from "express";
import { JWTMiddleware } from "../../middleware/JWTMiddleware.ts";
import createJob from "../../controller/Job/createJob.ts";
import updateJob from "../../controller/Job/updateJob.ts";
import deleteJob from "../../controller/Job/deleteJob.ts";
import fetchJob from "../../controller/Job/fetchJob.ts";

const router = Router();

router.post("/create", JWTMiddleware, createJob);
router.put("/update/:id", JWTMiddleware, updateJob);
router.delete("/delete/:id", JWTMiddleware, deleteJob);
router.get("/fetch", JWTMiddleware, fetchJob);

export default router;