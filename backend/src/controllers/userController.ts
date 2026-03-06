import type { AuthRequest } from "../middleware/auth";
import type { Response, NextFunction } from "express";
import { User } from "../models/User";

export async function getUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;

    // Fetch all the users but no the current user
    const users = await User.find({ _id: { $ne: userId } })
      .select("name email avatar")
      .limit(50);

    res.json(users);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
