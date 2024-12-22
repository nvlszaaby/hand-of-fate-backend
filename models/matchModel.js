const pool = require("../db/connection");

const saveMatch = async (user1Id, user2Id, winner) => {
  const result = await pool.query(
    "INSERT INTO matches (user1_id, user2_id, winner) VALUES ($1, $2, $3) RETURNING *",
    [user1Id, user2Id, winner]
  );
  return result.rows[0];
};

const updateUserPoints = async (userId, points) => {
  await pool.query(
    `
        INSERT INTO leaderboard (user_id, points)
        VALUES ($1, $2)
        ON CONFLICT (user_id)
        DO UPDATE SET points = leaderboard.points + $2
        `,
    [userId, points]
  );
};

const getLeaderboard = async () => {
  const result = await pool.query(
    `
    SELECT u.username, l.points 
    FROM leaderboard l
    JOIN users u ON l.user_id = u.id
    WHERE u.username != 'Computer'
    ORDER BY l.points DESC, u.username ASC
    `
  );
  return result.rows;
};

module.exports = { saveMatch, updateUserPoints, getLeaderboard };
