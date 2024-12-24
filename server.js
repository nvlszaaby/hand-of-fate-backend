require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const matchRoutes = require("./routes/match");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/matches", matchRoutes);

const server = http.createServer(app);

// require("./socket")(server);

server.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
