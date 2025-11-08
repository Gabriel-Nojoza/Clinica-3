import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.js";
import usuariosRoutes from "./src/routes/usuarios.js";
import medicosRoutes from "./src/routes/medicos.js";
import pacientesRoutes from "./src/routes/pacientes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/medicos", medicosRoutes);
app.use("/api/pacientes", pacientesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
