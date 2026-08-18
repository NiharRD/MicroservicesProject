import type { Request, Response } from "express";

async function addressController(req: Request, res: Response) {
  res.status(200).json({ msg: "jwt verified hehe" });
}

export default addressController;
