import express from "express";
import db from "../db.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Todas as rotas exigem autenticação JWT
router.use(verificarToken);

// ==============================================
//  GET — LISTAR TODOS OS PACIENTES
// ==============================================
router.get("/", (req, res) => {
  const sql = `
    SELECT id, nome, cpf, data_nascimento, telefone, email, endereco, criado_em
    FROM pacientes
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erro ao listar pacientes:", err);
      return res.status(500).json({ message: "Erro ao listar pacientes" });
    }
    res.json(results);
  });
});

// ==============================================
//  POST — CADASTRAR NOVO PACIENTE
// ==============================================
router.post("/", (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, endereco } = req.body;

  if (!nome || !cpf) {
    return res.status(400).json({ message: "Nome e CPF são obrigatórios." });
  }

  // Valida formato do CPF (simples)
  const cpfRegex = /^\d{11}$/;
  if (!cpfRegex.test(cpf.replace(/\D/g, ""))) {
    return res.status(400).json({ message: "CPF inválido." });
  }

  const sql = `
    INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, endereco)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [nome, cpf, data_nascimento, telefone, email, endereco], (err, result) => {
    if (err) {
      console.error("❌ Erro ao cadastrar paciente:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "CPF já cadastrado!" });
      }
      return res.status(500).json({ message: "Erro ao cadastrar paciente." });
    }

    console.log("✅ Paciente inserido:", { id: result.insertId, nome, cpf });
    res.status(201).json({
      message: "Paciente cadastrado com sucesso!",
      paciente: { id: result.insertId, nome, cpf },
    });
  });
});

// ==============================================
//  PUT — EDITAR PACIENTE
// ==============================================
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nome, cpf, data_nascimento, telefone, email, endereco } = req.body;

  if (!nome || !cpf) {
    return res.status(400).json({ message: "Nome e CPF são obrigatórios." });
  }

  const sql = `
    UPDATE pacientes
    SET nome = ?, cpf = ?, data_nascimento = ?, telefone = ?, email = ?, endereco = ?
    WHERE id = ?
  `;

  db.query(sql, [nome, cpf, data_nascimento, telefone, email, endereco, id], (err, result) => {
    if (err) {
      console.error("❌ Erro ao atualizar paciente:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "CPF já cadastrado em outro paciente!" });
      }
      return res.status(500).json({ message: "Erro ao atualizar paciente." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Paciente não encontrado." });
    }

    res.json({ message: "✅ Paciente atualizado com sucesso!" });
  });
});

// ==============================================
//  DELETE — EXCLUIR PACIENTE
// ==============================================
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM pacientes WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Erro ao excluir paciente:", err);
      return res.status(500).json({ message: "Erro ao excluir paciente." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Paciente não encontrado." });
    }

    res.json({ message: "🗑️ Paciente excluído com sucesso!" });
  });
});

export default router;
