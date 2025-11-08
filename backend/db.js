import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL;

const db = mysql.createConnection(connectionString);

db.connect(err => {
  if (err) {
    console.error("❌ Erro ao conectar no MySQL:", err);
  } else {
    console.log("✅ Conectado ao MySQL com sucesso!");
  }
});

export default db;
