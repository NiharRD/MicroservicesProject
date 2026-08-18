import bcrypt from "bcryptjs";
import prisma from "../../prisma/client.ts";
import type { Request, Response } from "express";

async function signUpController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const exisitingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!exisitingUser) {
      const newUser = await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
        },
      });
    } else {
      res.status(409).json({ message: " User already exists" });
    }

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
}

export default signUpController;
