import { Socket, Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "@clerk/express";
import { Message } from "../models/Message";
import { Chat } from "../models/Chat";
import { User } from "../models/User";

// store online users in memory: userId -> socketId
export const onlineUsers: Map<string, string> = new Map();

export const initializeSocket = (httpServer: HttpServer) => {
  const allowedOrigins = [
    "http://localhost:8081", // Expo mobile
    "http://localhost:5173", // Vite web dev
    process.env.FRONTEND_URL, // production
  ].filter(Boolean) as string[];
  const io = new SocketServer(httpServer, { cors: { origin: allowedOrigins } });

  // Verify socket connection - if the user is authenticated, we will store the user id in the socket
  //  Think of the socket like the user that will be connected

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // this is what user will send from the client

    // if there is no token
    if (!token) return next(new Error("Authentication error"));

    // We are trying to authenticate the socket connection. It is pretty similar like the authentication check in the auth.ts
    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      const clerkId = session.sub; //finds the clerkId

      const user = await User.findOne({ clerkId }); // Find the user in the database

      if (!user) return next(new Error("User not found")); // Return "User not found" if the user is not in the database

      socket.data.userId = user._id.toString();

      next();
    } catch (error: any) {
      next(new Error(error));
    }
  });

  // When you want to listen for events, use socket.on().
  // This "connection" event name is special and should be written like this
  // It's the event that is triggered when a new client connects to the server
  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    // send list of all currently online users to the newly connected client
    socket.emit("online-users", {
      userIds: Array.from(onlineUsers.keys()),
    }); //Take the key, convert as array and send to the userIds

    // store user in the onlineUsers map
    onlineUsers.set(userId, socket.id);

    // notify others that this current user is online
    socket.broadcast.emit("user-online", { userId });

    // join the current user to a private room
    socket.join(`user:${userId}`); //It is going to run for every single user

    // Listen for join chats
    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);

      // Authorize before joining the chat

      socket.on("join-chat", async (chatId: string) => {
        try {
          const allowed = await Chat.exists({
            _id: chatId,
            participants: userId,
          });
          if (!allowed) {
            socket.emit("socket-error", { message: "Unauthorized " });
            return;
          }
          socket.join(`chat:${chatId}`);
        } catch {
          socket.emit("socket-error", { message: "Failed to join chat" });
        }
      });
    });

    // Listen for leave chats
    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    // Handle sending messages
    socket.on(
      "send-message",
      async (data: { chatId: string; text: string }) => {
        try {
          // destructure the chatId as well as the text
          const { chatId, text } = data;

          // Check if the chat exists
          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId, //check if the user is part of the participants
          });

          // If chat doesn't exist, throw a socket error
          if (!chat) {
            socket.emit("socket-error", { message: "Chat not found" });
            return;
          }

          // Chat exists, create the message
          const message = await Message.create({
            chat: chatId,
            sender: userId,
            text,
          });

          // Update the last message, the time and save to the database
          chat.lastMessage = message._id;
          chat.lastMessageAt = new Date();
          await chat.save();

          // populate the sender
          await message.populate("sender", "name avatar");

          // emit to chat room (for users inside the chat)
          io.to(`chat:${chatId}`).emit("new-message", message);

          // also emit to participants' personal rooms (for chat list view)
          for (const participantId of chat.participants) {
            io.to(`user:${participantId}`).emit("new-message", message);
          }
        } catch (error) {
          socket.emit("socket-error", { message: "Failed to send message" });
        }
      },
    );

    // TODO: LATER
    socket.on("typing", async (data) => {});

    // Disconnect the user when the browser is closed and remove the active online green batch
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);

      // notify others that the users just disconnected
      socket.broadcast.emit("user-offline", { userId });
    });
  });

  return io;
};
