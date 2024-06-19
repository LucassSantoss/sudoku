const mysql = require('mysql2/promise');
const dotenv = require("dotenv");

dotenv.config();

async function connect() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  return connection;
}

module.exports = connect;
