const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cors = require("cors");
const connect = require('./database/db');
const { hashPassword, verifyPassword } = require('./encrypt_passwords');
const createUsersTable = require('./database/initDb');
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());

createUsersTable();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendWelcomeEmail = async (email, nome) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Bem-vindo ao Sudoku',
    text: `Olá ${nome},\n\nBem-vindo ao Sudoku! Estamos felizes em tê-lo conosco.\n\nAtenciosamente,\nBES`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de boas-vindas enviado para ' + email);
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas: ', error);
  }
};

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      mensagem: "Email e senha são obrigatórios",
      autenticado: false
    });
  }

  try {
    const connection = await connect();
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({
        mensagem: "Usuário não encontrado",
        autenticado: false
      });
    }

    const user = rows[0];

    const match = await verifyPassword(senha, user.password);
    if (!match) {
      return res.status(401).json({
        mensagem: "Senha incorreta",
        autenticado: false
      });
    }

    const usuario = user.username;
    const privateKey = fs.readFileSync("./keys/private.key", "utf8");
    const token = jwt.sign({ usuario, email: user.email }, privateKey, {
      algorithm: "RS256",
      expiresIn: "300s"
    });

    res.status(200).json({
      autenticado: true,
      token: token
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      mensagem: "Erro interno",
      autenticado: false
    });
  }
});

app.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      mensagem: "Nome, email e senha são obrigatórios",
      registrado: false
    });
  }

  try {
    const hashedPassword = await hashPassword(senha);
    const connection = await connect();

    const [existingEmails] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmails.length > 0) {
      await connection.end();
      return res.status(400).json({
        mensagem: "Email já existe",
        registrado: false
      });
    }

    const [result] = await connection.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [nome, email, hashedPassword]);
    await connection.end();

    await sendWelcomeEmail(email, nome);

    res.status(201).json({
      mensagem: "Usuário registrado com sucesso",
      registrado: true,
      id: result.insertId,
      nome,
      email
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      mensagem: "Erro interno ao registrar usuário",
      registrado: false
    });
  }
});

app.get("/user-info", verifyJWT, async (req, res) => {
  const { email } = req.query;

  try {
    const connection = await connect();
    const [rows] = await connection.query('SELECT username, points FROM users WHERE email = ?', [email]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado"
      });
    }

    res.status(200).json({
      user: rows[0]
    });

  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error);
    res.status(500).json({
      mensagem: "Erro interno"
    });
  }
});

app.post("/update-points", verifyJWT, async (req, res) => {
  const { email, difficulty } = req.body;
  let points;

  switch (difficulty) {
    case 'easy':
      points = 10;
      break;
    case 'medium':
      points = 50;
      break;
    case 'hard':
      points = 100;
      break;
    default:
      points = 0;
  }

  try {
    const connection = await connect();
    await connection.query('UPDATE users SET points = points + ? WHERE email = ?', [points, email]);
    await connection.end();

    res.status(200).json({
      mensagem: "Pontuação atualizada com sucesso"
    });

  } catch (error) {
    console.error('Erro ao atualizar pontos do usuário:', error);
    res.status(500).json({
      mensagem: "Erro interno"
    });
  }
});

function verifyJWT(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({
      autenticado: false,
      mensagem: "Cabeçalho não informado"
    });
  }

  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      autenticado: false,
      mensagem: "Token não reconhecido / mal formatado"
    });
  }

  const publicKey = fs.readFileSync("./keys/public.key", "utf8");

  jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        autenticado: false,
        mensagem: "Token inválido"
      });
    }

    req.email = decoded.email;
    return next();
  });
}

app.listen(port, () => {
  console.log("Server running on: http://localhost:" + port);
});
