const connect = require('./db');

const createUsersTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      points INT DEFAULT 0
    );
  `;

  try {
    const connection = await connect();
    await connection.query(createTableQuery);
    await connection.end();
    console.log('Tabela "users" criada com sucesso.');
  } catch (error) {
    console.error('Erro ao criar a tabela "users":', error);
  }
};

module.exports = createUsersTable;
