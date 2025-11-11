// js/menu.js
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";

const supabaseMenu = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

async function menuGetSession() {
  const { data, error } = await supabaseMenu.auth.getSession();
  if (error) {
    console.error("Erro ao obter sessão:", error);
    return null;
  }
  return data.session;
}

document.addEventListener("DOMContentLoaded", async () => {
  const session = await menuGetSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // Preenche nome do usuário no sidebar
  const span = document.getElementById("currentUser");
  const nomeLocal = localStorage.getItem("usuarioNome");
  const emailLocal = localStorage.getItem("usuarioEmail");
  const displayName =
    nomeLocal && nomeLocal.trim()
      ? nomeLocal
      : emailLocal || session.user.email || "";
  if (span) span.textContent = displayName;

  // Logout
  const btnLogout = document.getElementById("logoutBtn");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await supabaseMenu.auth.signOut();
      } catch (e) {
        console.error("Erro ao sair:", e);
      } finally {
        localStorage.clear();
        window.location.href = "login.html";
      }
    });
  }
});
