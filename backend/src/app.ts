import express from "express";
import path from "path";
import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Middleware
app.use(express.json()); // parses incoming JSON request bodies and makes them available as req.body in your route handlers

//Middleware that integrates Clerk authentication into your Express application.
// It checks the request's cookies and headers for a session JWT and, if found,
// attaches the Auth object to the request object under the auth key.
app.use(clerkMiddleware());

// Test route to check if the api is up and running
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

//error handlers must come after all the routes and other middlewares so they can catch errors passed
// with next(err) or thrown inside async handlers.
app.use(errorHandler);

// serve frontend in production

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../web/dist/")));

  app.get("/{*any}", (_, res) => {
    res.sendFile(path.join(__dirname, "../../web/dist/index.html"));
  });
}

export default app;
