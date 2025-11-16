// backend/index.js
// ==================================================
// Главная точка входа в серверное приложение

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const passport = require("./controllers/googleController");

const connectDb = require("./config/db");
const initSocket = require("./config/socket");

// Роуты
const authRoute = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");
const userRoute = require("./routes/userRoute");
const chatRoute = require("./routes/chatRoute");
const notificationRoute = require("./routes/notificationRoute");
const searchRoute = require("./routes/searchRoute");

const app = express();

// ====================== MIDDLEWARES =============================

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(passport.initialize());

// ===================== DATABASE CONNECT =========================
connectDb();

// ===================== HTTP + SOCKET SERVER ======================
const server = http.createServer(app);
initSocket(server);

// ======================== ROUTES =================================

app.use("/auth", authRoute);
app.use("/posts", postRoute); // /posts/...
app.use("/users", userRoute); // /users/...
app.use("/chat", chatRoute); // /chat/...
app.use("/notifications", notificationRoute); // /notifications/...
app.use("/search", searchRoute); // /search/users, /search/posts

// ========================== START ================================

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
