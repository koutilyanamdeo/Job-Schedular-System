import type { Request, Response } from "express";
import { UserService } from "../../model/userModel.ts";
import bcrypt from 'bcryptjs';
import "dotenv/config";


const updateUser = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { name, email, password, phoneNumber } = req.body;
    
    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ success: false, message: "Invalid or missing user ID" });
    }
    if (!name && !email && !password && !phoneNumber) {
        return res.status(400).json({ success: false, message: "Changing fields are required" });
    }
    
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ success: false, message: "Name, email, and password must be strings" });
    }
    
    try {
        const existingUser = await UserService.findOne(email);
        if (existingUser && existingUser.id !== userId) {
            return res.status(409).json({ success: false, message: "Email already in use" });
        }
        
        const hashedPassword = !password ? existingUser?.password : await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS || "10"));
        let data =  {
                name,
                email,
                password:hashedPassword,           
                phoneNumber,
        }
        let response = await UserService.updateUser(userId, data);
        res.status(200).json({ success: true, message: "User update successful", res :response });
    } catch (error) {
        console.error("Error during user update:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default updateUser;