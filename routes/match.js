const express = require("express");
const {
  recordMatch,
  getLeaderboardData,
} = require("../controllers/matchController");
const verifyJWT = require("../middleware/verifyJWT");
const router = express.Router();

router.post("/record", verifyJWT, recordMatch); // Mencatat pertandingan
router.get("/leaderboard", verifyJWT, getLeaderboardData); // Mendapatkan data leaderboard

module.exports = router;
