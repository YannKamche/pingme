import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { Chat } from "../models/Chat";
import { Types } from "mongoose";

// Will help us to fetch the chats, so we can display them on the sidebar between the current user and all the others users
export async function getChats(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId; //current userId

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name email avatar")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    //   Format the data to only show the other participant and not the current
    const formattedChats = chats.map((chat) => {
      const otherParticipant = chat.participants.find(
        (p) => p._id.toString() !== userId,
      );

      return {
        _id: chat._id,
        participant: otherParticipant ?? null,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
      };
    });

    res.json(formattedChats);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function getOrCreateChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const { participantId } = req.params;

    if (!participantId) {
      res.status(400).json({ message: "Participant ID is required " });
      return;
    }

    // Check if participantId is a MongoDB object

    if (
      Array.isArray(participantId) ||
      !Types.ObjectId.isValid(participantId)
    ) {
      return res.status(400).json({ message: "Invalid participant ID" });
    }

    if (userId === participantId) {
      res.status(400).json({ message: "Cannot create chat with yourself" });
      return;
    }

    // check if the chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage");

    if (!chat) {
      const newChat = new Chat({ participants: [userId, participantId] });
      await newChat.save(); //Save to the database

      chat = await newChat.populate("participants", "name email avatar");
    }

    const otherParticipant = chat.participants.find(
      (p) => p._id.toString() !== userId,
    );

    res.json({
      _id: chat._id,
      participant: otherParticipant ?? null,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat,
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
}
