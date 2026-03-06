import { Router } from "express";
import { authCallback, getMe } from "../controllers/authController";
import { protectRoute } from "../middleware/auth";

const router = Router();

// To be able to fetch the profile, user should be authenticated.

// /api/auth/me. This is fotr the
router.get("/me", protectRoute, getMe);
router.post("/callback", authCallback);

export default Router;
