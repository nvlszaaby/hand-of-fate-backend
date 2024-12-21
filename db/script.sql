-- Tabel Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Matches
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL REFERENCES users(id),
    user2_id INT, -- NULL jika melawan komputer
    winner VARCHAR(50), -- 'user1', 'user2', atau 'draw'
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Leaderboard
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INT DEFAULT 0,
    UNIQUE(user_id)
);
