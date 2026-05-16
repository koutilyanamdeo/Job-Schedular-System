import type{ Request, Response } from "express";
import { UserService } from "../../model/userModel.ts";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import "dotenv/config";

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await UserService.findOne(email);

    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ success: false, message: "JWT_SECRET not configured" });
    }

    const token = jwt.sign(
        { id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber
        },
        secret,
        { expiresIn: "5h" }
    );

    return res.status(200).json({ success: true, message: "Login successful", token , email: user.email, name: user.name, phoneNumber: user.phoneNumber});
}

export default login;
