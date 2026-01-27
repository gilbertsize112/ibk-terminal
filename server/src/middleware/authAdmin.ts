import { Request, Response, NextFunction } from 'express';

export const authAdmin = (req: any, res: Response, next: NextFunction) => {
  
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: "Forbidden: You do not have administrative privileges." 
    });
  }
};