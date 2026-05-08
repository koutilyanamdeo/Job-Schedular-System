import type {Request, Response} from "express";
import { UserService } from "../../model/userModel.ts";
import { isValidEmail } from "../../../constant.ts";
import bcrypt from 'bcryptjs';
import "dotenv/config";
 const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");

const registration = async (req: Request, res: Response) => {
    const { name, email, password, phoneNumber } = req.body;
    
    if (!name || !email || !password || !phoneNumber) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (typeof phoneNumber !== "string") {
        return res.status(400).json({ success: false, message: "Phone number must be a string" });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }
   if(!isValidEmail(email)){
    return res.status(400).json({ success: false, message: "Invalid email format" });
   }
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ success: false, message: "Name, email, and password must be strings" });
    }   
    

    try {
        const existingUser = await UserService.findOne(email);
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email already in use" });
        }

       
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        let data =  {
                name,
                email,
                password:hashedPassword,           
                phoneNumber,
            
        }
        let response = await UserService.registerUser(data);
        res.status(200).json({ success: true, message: "User registration successful", res :response });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

};

export default registration;