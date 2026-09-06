import type { Request, Response } from "express";

export async function checkOutController(req: Request, res: Response) {
  try {
    res.status(200).json({ message: "Checkout successful" });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
