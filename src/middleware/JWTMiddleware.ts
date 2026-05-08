import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

interface UserPayload extends JwtPayload {
    id: string;
    name: string;
    email: string;
    password: string;
    phoneNumber: bigint;
}

export interface AuthenticatedRequest extends Request {
    user?: UserPayload;
}

export const JWTMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ success: false, message: "JWT_SECRET not configured" });
    }

    try {
        const decoded = jwt.verify(token, secret) as unknown as UserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
