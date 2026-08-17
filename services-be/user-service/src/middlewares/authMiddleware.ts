import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.ts";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header exists and starts with 'Bearer '
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token: string = authHeader.split(" ")[1] || "";

    try {
      const decoded = verifyToken(token);
      req.user = decoded; // Attach the decoded payload to the request
      next(); // Pass control to the next middleware/route handler
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
  }
};
