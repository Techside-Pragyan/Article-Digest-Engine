import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'futuristic_quantum_secret_key_990';

export interface AuthRequest extends Request {
  userId?: string;
}

// JWT authentication verification middleware
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = '';

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('JWT Token Verification Error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

// Global error handler middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Express Error Handler caught:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

// Rate limiter middleware (lightweight, client-IP based)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 60; // 60 requests per minute

  const clientData = ipRequestCounts.get(ip);

  if (!clientData) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (now > clientData.resetTime) {
    // Reset window
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  clientData.count++;
  if (clientData.count > maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please slow down and try again in a minute.'
    });
  }

  next();
};
