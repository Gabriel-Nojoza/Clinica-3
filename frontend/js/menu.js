// ==========================================
// MENU.JS — Proteção, Logout e Navegação
// ==========================================

// 🔒 Verifica se o usuário está logado
function verificarLogin() {
  const token = localStorage.getItem("token");
  const nome = localStorage.getItem("usuarioNome");
  const tipo = localStorage.getItem("usuarioTipo");

  if (!token) {
    console.warn("⚠️ Nenhum token encontrado. Redirecionando para login...");
    window.location.href = "login.html";
    return false;
  }

  // Atualiza informações do usuário no sidebar
  const nomeEl = document.getElementById("currentUser");
  const tipoEl = document.querySelector(".user-role");
  if (nomeEl) nomeEl.textContent = nome || "Usuário";
  if (tipoEl) tipoEl.textContent = tipo || "Usuário";

  console.log("✅ Usuário logado:", nome);
  return true;
}

// ==========================================
// 🚪 LOGOUT (sair do sistema)
// ==========================================
function inicializarLogout() {
  const btnLogout = document.getElementById("logoutBtn");
  if (!btnLogout) return;

  btnLogout.addEventListener("click", () => {
    const confirmar = confirm("Deseja realmente sair do sistema?");
    if (confirmar) {
      localStorage.clear();
      window.location.href = "login.html";
    }
  });
}

// ==========================================
// 📂 NAVEGAÇÃO E DESTAQUE DO ITEM ATIVO
// ==========================================
function inicializarNavegacao() {
  const navItems = document.querySelectorAll(".nav-item");

  // Clique em item do menu
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      const destino = item.getAttribute("href");
      if (!destino || destino === "#") return;

      // Remove active de todos
      navItems.forEach(el => el.classList.remove("active"));

      // Marca o item clicado
      item.classList.add("active");

      // Redireciona
      window.location.href = destino;
    });
  });

  // 🔹 Marcar automaticamente o item da página atual
  const atual = window.location.pathname.split("/").pop();
  navItems.forEach(link => {
    const href = link.getAttribute("href");
    if (href && atual === href) {
      navItems.forEach(el => el.classList.remove("active"));
      link.classList.add("active");
    }
  });
}

// ==========================================
// 🚀 Inicialização principal
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  console.log("📂 menu.js carregado...");
  if (verificarLogin()) {
    inicializarLogout();
    inicializarNavegacao();
  }
});
