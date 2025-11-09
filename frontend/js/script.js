// ==========================================
// LOGIN + EXIBIÇÃO DE USUÁRIO LOGADO (SUPABASE AUTH + TABELA USUÁRIOS)
// ==========================================

const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ==========================================
// LOGIN DIRETO COM SUPABASE
// ==========================================
const formLogin = document.querySelector(".form-login");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    // 🔹 Login via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("E-mail ou senha incorretos!");
      console.error("Erro de login:", error);
      return;
    }

    const user = data.user;
    localStorage.setItem("usuarioId", user.id);
    localStorage.setItem("usuarioEmail", user.email);

    // Busca dados adicionais da tabela usuarios
    const { data: usuarioInfo } = await supabase
      .from("usuarios")
      .select("nome, tipo")
      .eq("auth_id", user.id)
      .single();

    if (usuarioInfo) {
      localStorage.setItem("usuarioNome", usuarioInfo.nome || user.email);
      localStorage.setItem("usuarioTipo", usuarioInfo.tipo || "Usuário");
    } else {
      localStorage.setItem("usuarioNome", user.email);
      localStorage.setItem("usuarioTipo", "Usuário");
    }

    alert(`Bem-vindo, ${localStorage.getItem("usuarioNome")}!`);
    window.location.href = "menu.html";
  });
}

// ==========================================
// VERIFICA LOGIN AUTOMÁTICO
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Se o usuário estiver deslogado → redireciona pro login
  if (!user && !window.location.href.includes("login.html")) {
    window.location.href = "login.html";
    return;
  }

  // Se o usuário estiver logado → mostra nome e tipo nas páginas
  if (user) {
    const nomeEl = document.getElementById("currentUser");
    const tipoEl = document.querySelector(".user-role");

    let nome = localStorage.getItem("usuarioNome");
    let tipo = localStorage.getItem("usuarioTipo");

    if (!nome) {
      const { data: usuarioInfo } = await supabase
        .from("usuarios")
        .select("nome, tipo")
        .eq("auth_id", user.id)
        .single();
      nome = usuarioInfo?.nome || user.email;
      tipo = usuarioInfo?.tipo || "Usuário";
    }

    if (nomeEl) nomeEl.textContent = nome;
    if (tipoEl) tipoEl.textContent = tipo;
  }
});

// ==========================================
// LOGOUT PADRÃO
// ==========================================
const btnLogout = document.getElementById("logoutBtn");
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = "login.html";
  });
}
