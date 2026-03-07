import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { getChats, getOrCreateChat } from "../controllers/chatController";

const router = Router();

router.use(protectRoute);

// For the chats, we are going to have 2 endpoints
router.get("/", protectRoute, getChats);
router.post("/with/:participantId", protectRoute, getOrCreateChat);

export default Router;
