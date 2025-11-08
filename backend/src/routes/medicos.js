import express from "express";
import { supabase } from "../supabaseClient.js";
import { verifyToken } from "./_middlewares.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// List medicos (authenticated users)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("medicos").select("*").order("criado_em", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Create medico. If usuario_id provided, link. Otherwise create usuario with tipo 'medico'
router.post("/", verifyToken, async (req, res) => {
  try {
    const { nome, crm, especialidade, telefone, email, endereco, usuario_id } = req.body;
    let linkedUserId = usuario_id;

    if (!linkedUserId) {
      // create a user entry for this medico
      const defaultSenha = Math.random().toString(36).slice(-8);
      const senhaHash = await bcrypt.hash(defaultSenha, 10);
      const { data: newUser, error: errUser } = await supabase.from("usuarios").insert([{ nome, email: email || null, senha: senhaHash, tipo: "medico" }]).select().single();
      if (errUser) throw errUser;
      linkedUserId = newUser.id;
    }

    const { data, error } = await supabase.from("medicos").insert([{ usuario_id: linkedUserId, nome, crm, especialidade, telefone, email, endereco }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Update medico
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, crm, especialidade, telefone, email, endereco } = req.body;
    const { data, error } = await supabase.from("medicos").update({ nome, crm, especialidade, telefone, email, endereco }).eq("id", id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Delete medico (also cascades if fk set)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("medicos").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "Medico deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
