const {
  saveMatch,
  updateUserPoints,
  getLeaderboard,
} = require("../models/matchModel");

const recordMatch = async (req, res) => {
  let { user1Id, user2Id, rounds } = req.body;

  try {
    let user1Wins = 0;
    let user2Wins = 0;
    let winner = null;

    if (user2Id === "computer") {
      user2Wins = 0; // Komputer tidak menang
      user1Wins = rounds.filter((round) => round.winner === "user1").length;

      if (user1Wins > 1) {
        winner = "user1";
      } else if (user1Wins < 1) {
        winner = "user2"; // Komputer menang
      } else {
        winner = "draw";
      }

      user2Id = null; // Set to null or omit this value to prevent issues with the leaderboard
    } else {
      for (let i = 0; i < rounds.length; i++) {
        if (rounds[i].winner === "user1") user1Wins++;
        if (rounds[i].winner === "user2") user2Wins++;

        if (user1Wins === 2 || user2Wins === 2) {
          winner = user1Wins === 2 ? "user1" : "user2";
          break;
        }
      }

      if (!winner) {
        if (user1Wins > user2Wins) winner = "user1";
        else if (user2Wins > user1Wins) winner = "user2";
        else winner = "draw";
      }
    }

    // If the opponent is the computer, do not save the match to the leaderboard
    if (user2Id !== null) {
      const match = await saveMatch(user1Id, user2Id, winner);

      // Update user points based on winner
      if (winner === "user1") {
        await updateUserPoints(user1Id, 5);
      } else if (winner === "user2" && user2Id !== "computer") {
        await updateUserPoints(user2Id, 5);
      } else if (winner === "draw") {
        await updateUserPoints(user1Id, 1);
        await updateUserPoints(user2Id, 1);
      }

      res.status(201).json({ message: "Match recorded successfully", match });
    } else {
      // Only update points without saving to leaderboard if opponent is 'computer'
      if (winner === "user1") {
        await updateUserPoints(user1Id, 5);
      } else if (winner === "draw") {
        await updateUserPoints(user1Id, 1);
      }

      res
        .status(201)
        .json({ message: "Match recorded successfully against computer" });
    }
  } catch (error) {
    console.error("Error details:", error); // Log error details
    res.status(500).json({ message: "Error recording match", error });
  }
};

const getLeaderboardData = async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard", error });
  }
};

module.exports = { recordMatch, getLeaderboardData };
