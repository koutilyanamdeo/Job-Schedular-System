import type { Request, Response } from "express";
import "dotenv/config";
import "express-session";

declare module "express-session" {
    interface SessionData {
        userId: string;
        email: string;
        name: string;
        phoneNumber: string;
    }
}

const logout = async (req: Request, res: Response) => {
    try {
            res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/" // Ensure this matches where the cookie was set
        });

        return res.status(200).json({ 
            success: true, 
            message: "User logged out successfully" 
        });
        
    }
    catch (error) {
    console.error("Error during user logout:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
}
}
export default logout;
