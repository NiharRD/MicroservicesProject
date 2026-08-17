// src/utils/jwt.ts
import jwt from "jsonwebtoken";

// In a real app, always ensure this is loaded from your .env file
const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret";

export const generateToken = (payload: object): string => {
  // Signs the token with a 1-hour expiration
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, SECRET_KEY);
};
