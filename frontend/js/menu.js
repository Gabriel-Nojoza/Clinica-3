// ==========================================
// MENU.JS — Proteção, Logout e Navegação (Supabase)
// ==========================================

// ==== CONFIGURAÇÃO SUPABASE ====
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ==========================================
// 🔒 VERIFICA LOGIN PELO SUPABASE
// ==========================================
async function verificarLogin() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.warn("⚠️ Usuário não autenticado. Redirecionando...");
    window.location.href = "login.html";
    return false;
  }

  // Atualiza nome do usuário na sidebar
  const nomeEl = document.getElementById("currentUser");
  const tipoEl = document.querySelector(".user-role");
  if (nomeEl) nomeEl.textContent = user.email || "Usuário";
  if (tipoEl) tipoEl.textContent = "Autenticado";

  console.log("✅ Usuário autenticado:", user.email);
  return true;
}

// ==========================================
// 🚪 LOGOUT COM SUPABASE
// ==========================================
function inicializarLogout() {
  const btnLogout = document.getElementById("logoutBtn");
  if (!btnLogout) return;

  btnLogout.addEventListener("click", async () => {
    const confirmar = confirm("Deseja realmente sair do sistema?");
    if (!confirmar) return;

    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// ==========================================
// 📂 NAVEGAÇÃO E DESTAQUE DO ITEM ATIVO
// ==========================================
function inicializarNavegacao() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const destino = item.getAttribute("href");
      if (!destino) return;
      navItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      window.location.href = destino;
    });
  });

  // Marcar item atual automaticamente
  const atual = window.location.pathname.split("/").pop();
  navItems.forEach((link) => {
    if (link.getAttribute("href") === atual) {
      link.classList.add("active");
    }
  });
}

// ==========================================
// 🚀 INICIALIZAÇÃO PRINCIPAL
// ==========================================
window.addEventListener("DOMContentLoaded", async () => {
  console.log("📂 menu.js carregado...");

  // Aguarda verificação Supabase
  const autenticado = await verificarLogin();

  if (autenticado) {
    inicializarLogout();
    inicializarNavegacao();
  }
});
