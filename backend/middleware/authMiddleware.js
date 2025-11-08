import jwt from "jsonwebtoken";

const SECRET = "chave_secreta_123"; // deve ser a mesma usada no auth.js

// Middleware para verificar token JWT
export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token ausente." });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      console.error("Erro no token:", err.message);
      return res.status(403).json({ message: "Token inválido ou expirado." });
    }

    req.usuario = decoded; // salva as informações do usuário do token
    next();
  });
}
