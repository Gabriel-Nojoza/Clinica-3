// Configuração do Supabase
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Espera o carregamento completo da página
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-cadastro");

  if (!form) {
    console.error("❌ Formulário de cadastro não encontrado!");
    return;
  }

  // ==========================================
  // SUBMISSÃO DO FORMULÁRIO
  // ==========================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Captura os valores dos campos
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const tipo = document.getElementById("tipo")?.value || "Usuário";

    if (!email || !senha) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      // 🔹 1️⃣ Cria o usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (error) {
        console.error("Erro Supabase Auth:", error);
        alert("Erro ao registrar usuário: " + error.message);
        return;
      }

      const user = data.user;

      // 🔹 2️⃣ Salva também na tabela `usuarios`
      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          auth_id: user.id,
          nome,
          email,
          tipo,
        },
      ]);

      if (dbError) {
        console.error("Erro ao salvar no banco:", dbError);
        alert("Usuário criado no Auth, mas erro ao salvar na tabela.");
      } else {
        alert("✅ Usuário cadastrado com sucesso!");
        form.reset();
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Ocorreu um erro ao tentar cadastrar.");
    }
  });
});