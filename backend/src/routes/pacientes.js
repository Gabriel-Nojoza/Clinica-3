import express from "express";
import { supabase } from "../supabaseClient.js";
import { verifyToken } from "./_middlewares.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// List pacientes
router.get("/", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("pacientes").select("*").order("criado_em", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Create paciente. Creates usuario if usuario_id not provided
router.post("/", verifyToken, async (req, res) => {
  try {
    const { nome, cpf, data_nascimento, telefone, email, endereco, usuario_id } = req.body;
    let linkedUserId = usuario_id;

    if (!linkedUserId) {
      const defaultSenha = Math.random().toString(36).slice(-8);
      const senhaHash = await bcrypt.hash(defaultSenha, 10);
      const { data: newUser, error: errUser } = await supabase.from("usuarios").insert([{ nome, email: email || null, senha: senhaHash, tipo: "paciente" }]).select().single();
      if (errUser) throw errUser;
      linkedUserId = newUser.id;
    }

    const { data, error } = await supabase.from("pacientes").insert([{ usuario_id: linkedUserId, nome, cpf, data_nascimento, telefone, email, endereco }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Update paciente
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, endereco } = req.body;
    const { data, error } = await supabase.from("pacientes").update({ nome, cpf, data_nascimento, telefone, email, endereco }).eq("id", id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Delete paciente
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("pacientes").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "Paciente deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
