import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { type AuthRequest } from "../types/express/index.js";
export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Extract the token from the Authorization header (Format: "Bearer <token>")
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  const tokenParts = authHeader.split(" ");
  const token = tokenParts[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. Malformed token." });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET!;

    // Verify the token
    const decoded = jwt.verify(token, secret);

    // Attach the decoded user payload to the request object
    req.user = decoded;

    // Move to the next middleware or route handler
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};
