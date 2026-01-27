import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
 
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  
  if (!token) {
    return res.status(401).json({ message: "Access Denied: No security token provided." });
  }

  try {
    
    const decoded = jwt.verify(token, 'secret_key_123');
    
    req.user = decoded; 
    
    next(); 
  } catch (err) {
    res.status(403).json({ message: "Invalid or Expired Token." });
  }
};