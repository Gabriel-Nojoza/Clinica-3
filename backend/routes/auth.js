import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";


const router = express.Router();
const SECRET = "chave_secreta_123";

// Registro de novo usuário
router.post("/register", (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ message: "Preencha todos os campos!" });

  const hash = bcrypt.hashSync(senha, 10);
  const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
  db.query(sql, [nome, email, hash], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ message: "E-mail já cadastrado!" });
      return res.status(500).json({ message: "Erro ao cadastrar usuário" });
    }
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ message: "Preencha e-mail e senha" });

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Erro interno" });
    if (results.length === 0)
      return res.status(401).json({ message: "Usuário não encontrado" });

    const usuario = results[0];
    const senhaOk = bcrypt.compareSync(senha, usuario.senha);
    if (!senhaOk) return res.status(401).json({ message: "Senha incorreta" });

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET, { expiresIn: "2h" });

    res.json({ message: "Login bem-sucedido", usuario, token });
  });
});

export default router;
