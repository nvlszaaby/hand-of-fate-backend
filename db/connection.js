const { Pool } = require("pg");

const pool = new Pool({
  // local
  // user: "postgres",
  // host: "localhost",
  // database: "hof_db2",
  // password: "datalovers",
  // port: 5432,

  // deployed
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
},
});

module.exports = pool;
