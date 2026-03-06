import type { Request, Response, NextFunction } from "express";

import { getAuth } from "@clerk/express";
import { User } from "../models/User";
import { requireAuth } from "@clerk/express";

export type AuthRequest = Request & {
  userId?: string;
};

export const protectRoute = [
  requireAuth(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId: clerkId } = getAuth(req); //userId is what Claude stores

      // if the userId is invalid, return unauthorized
      if (!clerkId)
        return res
          .status(401)
          .json({ message: "Unauthorized - invalid token" });

      //   This part checks if the user is in the database
      // if the userId is valid, find the user
      const user = await User.findOne({ clerkId });

      // User not found
      if (!user) return res.status(404).json({ message: "User not found" });

      req.userId = user._id.toString(); //Conver the user id and pass it under the request

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
