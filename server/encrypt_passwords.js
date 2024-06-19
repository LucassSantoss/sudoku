const bcrypt = require('bcrypt');
const saltRounds = 10;

// Função para hashear uma senha
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

// Função para verificar uma senha
async function verifyPassword(password, hashedPassword) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}

module.exports = {
  hashPassword,
  verifyPassword,
};