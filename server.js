require("dotenv").config();

const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const matchRoutes = require("./routes/match");

// Create express app & use cors
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/matches", matchRoutes);

// Create http server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, { cors: { origin: "*" } });

const rooms = {}; // { roomId: { players: [socketId1, socketId2], gameState: {...} } }
const leaderboard = []; // Store leaderboard in memory

// Function to update leaderboard
const updateLeaderboard = (gameState) => {
  const player1 = gameState.player1;
  const player2 = gameState.player2;

  // Add players to leaderboard if they won
  if (gameState.winner === "player1") {
    player1.score += 5; // Player 1 wins
  } else if (gameState.winner === "player2") {
    player2.score += 5; // Player 2 wins
  } else if (gameState.winner === "draw") {
    player1.score += 1; // Draw
    player2.score += 1;
  }

  // Update leaderboard (sort by score descending)
  leaderboard.push(player1, player2);
  leaderboard.sort((a, b) => b.score - a.score);

  // Limit leaderboard to top 10
  leaderboard.length = Math.min(leaderboard.length, 10);
};

// Handle socket events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", (roomId, userId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], gameState: {} };
    }

    const room = rooms[roomId];
    if (room.players.length >= 2) {
      socket.emit("roomFull");
      return;
    }

    room.players.push(socket.id);
    socket.join(roomId);
    io.to(roomId).emit("playerJoined", room.players.length);

    // Start game if both players are ready
    if (room.players.length === 2) {
      room.gameState = {
        round: 1,
        player1: { id: room.players[0], score: 0 },
        player2: { id: room.players[1], score: 0 },
      };
      io.to(roomId).emit("gameStart", room.gameState);
    }
  });

  socket.on("playTurn", (roomId, userChoice) => {
    const room = rooms[roomId];
    if (!room) return;

    const gameState = room.gameState;
    if (!gameState.roundChoices) {
      gameState.roundChoices = {};
    }

    // Save player choice
    gameState.roundChoices[socket.id] = userChoice;

    // Wait for both players to make a choice
    if (Object.keys(gameState.roundChoices).length === 2) {
      const [player1Choice, player2Choice] = Object.values(
        gameState.roundChoices
      );
      let result;

      if (player1Choice === player2Choice) {
        result = "draw";
      } else if (
        (player1Choice === "rock" && player2Choice === "scissors") ||
        (player1Choice === "scissors" && player2Choice === "paper") ||
        (player1Choice === "paper" && player2Choice === "rock")
      ) {
        result = "player1";
        gameState.player1.score += 1;
      } else {
        result = "player2";
        gameState.player2.score += 1;
      }

      io.to(roomId).emit("roundResult", {
        round: gameState.round,
        choices: gameState.roundChoices,
        result,
      });

      gameState.roundChoices = {}; // Reset choices for next round

      // Check for winner or move to next round
      if (
        gameState.player1.score === 2 ||
        gameState.player2.score === 2 ||
        gameState.round === 3
      ) {
        const winner =
          gameState.player1.score > gameState.player2.score
            ? "player1"
            : gameState.player1.score < gameState.player2.score
            ? "player2"
            : "draw";

        // Update leaderboard with final result
        updateLeaderboard(gameState);

        io.to(roomId).emit("gameEnd", { winner, gameState });
        delete rooms[roomId]; // Clear room data
      } else {
        gameState.round += 1;
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Find and remove the player from their room
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.indexOf(socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomId).emit("playerLeft");
        delete rooms[roomId]; // Clear room if empty
        break;
      }
    }
  });
});

// API to fetch leaderboard
app.get("/leaderboard", (req, res) => {
  res.json(leaderboard);
});

server.listen(4000, () => {
  console.log(`Server running on Port 4000`);
});
