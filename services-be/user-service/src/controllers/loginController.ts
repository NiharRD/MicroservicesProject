import bcrypt from "bcryptjs";
import prisma from "../../prisma/client.ts";
import { generateToken } from "../utils/jwt.ts";
import type { Request, Response } from "express";
async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      res
        .status(401)
        .json({ message: "User with this email does not exists " });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.email,
      role: user.role,
      iss: "user-service-issuer",
    });
    res.json({ token });
  } catch (error) {}
}

export default loginController;
