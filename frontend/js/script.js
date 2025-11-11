// js/script.js
// ==============================================
// 🔧 Configuração do Supabase
// ==============================================
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ==============================================
// 🔹 Helpers
// ==============================================
function isLoginPage() {
  return window.location.pathname.endsWith("login.html");
}

async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Erro ao obter sessão:", error);
    return null;
  }
  return data.session;
}

async function ensureAuthenticated() {
  const session = await getSession();
  if (!session) {
    // sem sessão: volta pro login
    window.location.href = "login.html";
    return null;
  }
  return session;
}

function preencherUsuarioHeader(session) {
  const span = document.getElementById("currentUser");
  const nomeLocal = localStorage.getItem("usuarioNome");
  const emailLocal = localStorage.getItem("usuarioEmail");
  const valor =
    nomeLocal && nomeLocal.trim()
      ? nomeLocal
      : emailLocal || (session && session.user && session.user.email) || "";

  if (span) span.textContent = valor;
}

function configurarLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Erro ao deslogar:", e);
    } finally {
      localStorage.clear();
      window.location.href = "login.html";
    }
  });
}

// ==============================================
// 🚀 Inicialização
// ==============================================
document.addEventListener("DOMContentLoaded", async () => {
  if (isLoginPage()) {
    // ==========================
    // PÁGINA DE LOGIN
    // ==========================
    const form = document.querySelector(".form-login");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value.trim();

      if (!email || !senha) {
        alert("Preencha e-mail e senha!");
        return;
      }

      try
      {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (error) {
          console.error("Erro de login:", error);
          alert("E-mail ou senha incorretos.");
          return;
        }

        const user = data.user;
        if (!user) {
          alert("Erro ao obter usuário autenticado.");
          return;
        }

        // Guarda infos básicas no localStorage
        localStorage.setItem("authUserId", user.id);
        localStorage.setItem("usuarioEmail", user.email || email);

        // Busca o registro correspondente na tabela `usuarios`
        const { data: usuarioRow, error: usuarioError } = await supabase
          .from("usuarios")
          .select("*")
          .eq("auth_id", user.id)
          .single();

        if (usuarioError) {
          console.warn(
            "Login funcionou, mas não foi possível carregar dados da tabela usuarios:",
            usuarioError
          );
        } else if (usuarioRow) {
          localStorage.setItem("usuarioId", usuarioRow.id);
          localStorage.setItem("usuarioNome", usuarioRow.nome || "");
          localStorage.setItem("usuarioTipo", usuarioRow.tipo || "");
        }

        alert("✅ Login realizado com sucesso!");
        window.location.href = "menu.html";
      } catch (err) {
        console.error("Erro inesperado no login:", err);
        alert("Erro inesperado ao fazer login. Verifique o console.");
      }
    });
  } else {
    // ==========================
    // PÁGINAS INTERNAS (protegidas)
    // ==========================
    const session = await ensureAuthenticated();
    if (!session) return;

    preencherUsuarioHeader(session);
    configurarLogout();
  }
});
