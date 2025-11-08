import express from "express";
import db from "../db.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// 🔹 GET — Listar todos os médicos
// ==========================================
router.get("/", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM medicos ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error("❌ Erro ao buscar médicos:", error);
    res.status(500).json({ message: "Erro ao buscar médicos." });
  }
});

// ==========================================
// 🔹 POST — Cadastrar novo médico
// ==========================================
router.post("/", verificarToken, async (req, res) => {
  try {
    const { nome, crm, especialidade, telefone, email } = req.body;

    if (!nome || !crm || !especialidade) {
      return res.status(400).json({ message: "Campos obrigatórios faltando." });
    }

    const sql = `
      INSERT INTO medicos (nome, crm, especialidade, telefone, email)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.promise().query(sql, [nome, crm, especialidade, telefone, email]);

    res.status(201).json({ message: "Médico cadastrado com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao cadastrar médico:", error);
    res.status(500).json({ message: "Erro ao cadastrar médico." });
  }
});

// ==========================================
// 🔹 PUT — Atualizar médico
// ==========================================
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, crm, especialidade, telefone, email } = req.body;

    const [result] = await db
      .promise()
      .query(
        `UPDATE medicos SET nome=?, crm=?, especialidade=?, telefone=?, email=? WHERE id=?`,
        [nome, crm, especialidade, telefone, email, id]
      );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Médico não encontrado." });

    res.json({ message: "Médico atualizado com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao atualizar médico:", error);
    res.status(500).json({ message: "Erro ao atualizar médico." });
  }
});

// ==========================================
// 🔹 DELETE — Excluir médico
// ==========================================
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.promise().query("DELETE FROM medicos WHERE id = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Médico não encontrado." });

    res.json({ message: "Médico excluído com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao excluir médico:", error);
    res.status(500).json({ message: "Erro ao excluir médico." });
  }
});

export default router;
