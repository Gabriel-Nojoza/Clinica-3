import express from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔒 Todas as rotas abaixo exigem JWT válido
router.use(verificarToken);

// ==============================
//  LISTAR USUÁRIOS (sem senha)
// ==============================
router.get("/", (req, res) => {
  const sql = "SELECT id, nome, email, criado_em FROM usuarios ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erro ao listar usuários:", err);
      return res.status(500).json({ message: "Erro ao listar usuários" });
    }
    res.json(results);
  });
});

// ==============================
//  CRIAR NOVO USUÁRIO (com hash)
// ==============================
router.post("/", (req, res) => {
  const { nome, email, senha } = req.body;

  console.log("📥 Body recebido:", req.body);

  // Validações básicas
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: "Preencha nome, e-mail e senha." });
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({ message: "E-mail inválido." });
  }
  if (String(senha).length < 4) {
    return res.status(400).json({ message: "A senha deve ter pelo menos 4 caracteres." });
  }

  // Gera hash da senha
  const hash = bcrypt.hashSync(senha, 10);

  const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
  db.query(sql, [nome, email, hash], (err, result) => {
    if (err) {
      console.error("❌ Erro ao cadastrar usuário:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "E-mail já cadastrado!" });
      }
      return res.status(500).json({ message: "Erro ao cadastrar usuário." });
    }

    console.log("✅ Usuário inserido:", { id: result.insertId, nome, email });
    // Nunca devolva a senha
    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      id: result.insertId,
      nome,
      email,
    });
  });
});

// ==============================
//  ATUALIZAR NOME/EMAIL
// ==============================
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ message: "Informe nome e e-mail." });
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({ message: "E-mail inválido." });
  }

  const sql = "UPDATE usuarios SET nome = ?, email = ? WHERE id = ?";
  db.query(sql, [nome, email, id], (err, result) => {
    if (err) {
      console.error("❌ Erro ao atualizar:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "E-mail já cadastrado!" });
      }
      return res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
    res.json({ message: "Usuário atualizado com sucesso!" });
  });
});

// ==============================
//  EXCLUIR
// ==============================
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM usuarios WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Erro ao excluir:", err);
      return res.status(500).json({ message: "Erro ao excluir usuário" });
    }
    res.json({ message: "Usuário excluído com sucesso!" });
  });
});

export default router;
