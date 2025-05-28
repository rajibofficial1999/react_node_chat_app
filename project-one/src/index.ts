import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./lib/db";
import AuthRoutes from "./routes/auth";
import FriendsRoutes from "./routes/friends";
import MessagesRoutes from "./routes/messages";
import GroupRoutes from "./routes/group";
import ChatListRoutes from "./routes/Chatlist";
import UserRoutes from "./routes/users";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { socketEvents } from "./lib/socket";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();

io.on("connection", async (socket) => {
  await socketEvents(socket, io, onlineUsers);
});

app.use((req, res, next) => {
  req.setTimeout(5 * 60 * 1000); // 5 minutes
  res.setTimeout(5 * 60 * 1000); // 5 minutes
  next();
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

connectDB().catch((err) => {
  console.error(err);
});

app.use("/api/auth", AuthRoutes);
app.use("/api/friends", FriendsRoutes);
app.use("/api/groups", GroupRoutes);
app.use("/api/messages", MessagesRoutes);
app.use("/api/chatlist", ChatListRoutes);
app.use("/api/users", UserRoutes);

const port = process.env.PORT || 3000;

server.listen(process.env.PORT, () => {
  console.log(
    `Server is running on port ${port} \nURL: http://localhost:${port}`
  );
});
