import express from "express"

import authRoutes from "./routes/authRoutes"
import chatRoutes from "./routes/chatRoutes"
import messageRoutes from "./routes/messageRoutes"
import userRoutes from "./routes/userRoutes"

const app = express();

// Middleware
app.use(express.json()); // parses incoming JSON request bodies and makes them available as req.body in your route handlers

// Test route to check if the api is up and running
app.get("/health", (req,res) => {
    res.json({status:"ok", message:"Server is running"})
})

//Routes
app.use("/api/auth", authRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/users", userRoutes)


export default app;
