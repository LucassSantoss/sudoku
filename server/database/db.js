const mysql = require('mysql2/promise');

async function connect() {
  const connection = await mysql.createConnection({
    host: "localhost",
    port: 3306,
    database: "sudoku",
    user: "root",
    password: "2005"
  });
  return connection;
}

module.exports = connect;
