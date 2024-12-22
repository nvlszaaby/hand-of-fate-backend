const {
  saveMatch,
  updateUserPoints,
  getLeaderboard,
} = require("../models/matchModel");

const recordMatch = async (req, res) => {
  let { user1Id, user2Id, rounds } = req.body;

  // Validasi jumlah ronde untuk Bo5
  if (rounds.length < 3 || rounds.length > 5) {
    return res.status(400).json({
      message: "Invalid number of rounds. Bo5 requires between 3 to 5 rounds.",
    });
  }

  if (!user1Id || !user2Id || !Array.isArray(rounds)) {
    return res.status(400).json({
      message: "Invalid input data format.",
    });
  }

  if (
    !rounds.every(
      (round) =>
        round.winner === "user1" ||
        round.winner === "user2" ||
        round.winner === "draw"
    )
  ) {
    return res.status(400).json({
      message:
        "Each round must have a valid winner ('user1' or 'user2' or 'draw').",
    });
  }

  try {
    let user1Wins = 0;
    let user2Wins = 0;
    let winner = null;

    for (let i = 0; i < rounds.length; i++) {
      if (rounds[i].winner === "user1") user1Wins++;
      if (rounds[i].winner === "user2") user2Wins++;

      // Periksa jika ada pemenang (mencapai 3 kemenangan)
      if (user1Wins === 3 || user2Wins === 3) {
        winner = user1Wins === 3 ? "user1" : "user2";
        break;
      }
    }

    // Jika tidak ada pemenang meskipun semua ronde dimainkan
    if (!winner) {
      winner =
        user1Wins > user2Wins
          ? "user1"
          : user1Wins < user2Wins
          ? "user2"
          : "draw";
    }

    // Simpan pertandingan ke database
    const match = await saveMatch(
      user1Id,
      user2Id === "computer" ? null : user2Id, // Simpan null jika lawan adalah komputer
      winner
    );

    // Update leaderboard jika lawan bukan komputer
    if (user2Id !== "computer") {
      if (winner === "user1") {
        await updateUserPoints(user1Id, 3);
      } else if (winner === "user2") {
        await updateUserPoints(user2Id, 3);
      } else if (winner === "draw") {
        await updateUserPoints(user1Id, 1);
        await updateUserPoints(user2Id, 1);
      }
    } else {
      // Update poin hanya untuk user1 melawan komputer
      if (winner === "user1") {
        await updateUserPoints(user1Id, 3);
      } else if (winner === "draw") {
        await updateUserPoints(user1Id, 1);
      }
    }

    res.status(201).json({
      message: `Match recorded successfully${
        user2Id === "computer" ? " against computer" : ""
      }`,
      match,
    });
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
