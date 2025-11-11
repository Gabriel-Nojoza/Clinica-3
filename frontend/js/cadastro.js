// js/cadastro.js
// ==============================================
// 🔧 Configuração do Supabase
// ==============================================
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";

const supabaseCadastro = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
);

// ==============================================
// 🚀 Lógica de cadastro
// ==============================================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-cadastro");
  if (!form) {
    console.error("Formulário de cadastro não encontrado.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const tipoSelect = document.getElementById("tipo");
    const tipo =
      (tipoSelect && tipoSelect.value) ||
      "Usuario"; // valor padrão, se não tiver select

    if (!nome || !email || !senha) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      // 1️⃣ Cria usuário no Auth
      const { data, error } = await supabaseCadastro.auth.signUp({
        email,
        password: senha,
      });

      if (error) {
        console.error("Erro Supabase Auth:", error);
        alert("Erro ao registrar usuário: " + error.message);
        return;
      }

      const user = data.user;
      if (!user) {
        alert("Erro: usuário não foi criado corretamente.");
        return;
      }

      // 2️⃣ Insere na tabela `usuarios`
      const { error: dbError } = await supabaseCadastro.from("usuarios").insert([
        {
          auth_id: user.id,
          nome,
          email,
          tipo,
          senha, // OBS: está em texto simples; ideal seria hash num backend
        },
      ]);

      if (dbError) {
        console.error("Erro ao salvar na tabela usuarios:", dbError);
        alert(
          "Usuário criado no Auth, mas houve erro ao salvar na tabela: " +
            (dbError.message || "verifique as colunas da tabela.")
        );
        return;
      }

      alert("✅ Usuário cadastrado com sucesso!");
      form.reset();
      window.location.href = "login.html";
    } catch (err) {
      console.error("Erro inesperado no cadastro:", err);
      alert("Ocorreu um erro ao tentar cadastrar. Verifique o console.");
    }
  });
});
