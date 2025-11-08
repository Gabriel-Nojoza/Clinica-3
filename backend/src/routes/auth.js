import express from "express";
import { supabase } from "../supabaseClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register a new user (admin can create users)
// body: { nome, email, senha, tipo }
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;
    if (!nome || !email || !senha || !tipo) return res.status(400).json({ message: "Missing fields" });

    // check email exists
    const { data: existing } = await supabase.from("usuarios").select("id").eq("email", email).limit(1);
    if (existing && existing.length) return res.status(400).json({ message: "Email already registered" });

    const senhaHash = await bcrypt.hash(senha, 10);
    const { data, error } = await supabase.from("usuarios").insert([
      { nome, email, senha: senhaHash, tipo }
    ]).select().single();

    if (error) throw error;
    res.status(201).json({ user: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Login — only allow admin or recepcionista to obtain tokens
// body: { email, senha }
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: "Missing fields" });

    const { data: users, error } = await supabase.from("usuarios").select("*").eq("email", email).limit(1);
    if (error) throw error;
    if (!users || users.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = users[0];
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    if (!["admin", "recepcionista"].includes(user.tipo)) {
      return res.status(403).json({ message: "User not allowed to login here" });
    }

    const token = jwt.sign({ id: user.id, tipo: user.tipo, nome: user.nome }, process.env.JWT_SECRET || "secret", { expiresIn: "8h" });
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
