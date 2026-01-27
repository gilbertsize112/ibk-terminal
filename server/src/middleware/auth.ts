import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// This interface helps TypeScript understand what's inside the token
interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Get the token from the request header
    const token = req.header('Authorization')?.split(' ')[1];

    // 2. If no token, deny access
    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        // 3. Verify the token using your Secret Key
        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        
        // 4. Attach the user data to the request so other routes can use it
        req.user = verified;
        
        // 5. Move to the next function (the actual route)
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};