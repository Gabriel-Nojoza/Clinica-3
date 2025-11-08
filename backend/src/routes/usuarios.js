import express from "express";
import { supabase } from "../supabaseClient.js";
import bcrypt from "bcryptjs";
import { verifyToken } from "./_middlewares.js";

const router = express.Router();

// only admin can list users
router.get("/", verifyToken, async (req, res) => {
  try {
    if (!req.user || req.user.tipo !== "admin") return res.status(403).json({ message: "Forbidden" });
    const { data, error } = await supabase.from("usuarios").select("id, nome, email, tipo, criado_em").order("criado_em", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// create user (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    if (!req.user || req.user.tipo !== "admin") return res.status(403).json({ message: "Forbidden" });
    const { nome, email, senha, tipo } = req.body;
    if (!nome || !email || !senha || !tipo) return res.status(400).json({ message: "Missing fields" });

    const { data: existing } = await supabase.from("usuarios").select("id").eq("email", email).limit(1);
    if (existing && existing.length) return res.status(400).json({ message: "Email already registered" });

    const senhaHash = await bcrypt.hash(senha, 10);
    const { data, error } = await supabase.from("usuarios").insert([{ nome, email, senha: senhaHash, tipo }]).select().single();
    if (error) throw error;
    res.status(201).json({ user: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// delete user (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (!req.user || req.user.tipo !== "admin") return res.status(403).json({ message: "Forbidden" });
    const { id } = req.params;
    const { error } = await supabase.from("usuarios").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
