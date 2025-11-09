// ==== CONFIGURAÇÃO SUPABASE ====
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==== LOGIN DIRETO COM SUPABASE ====
document.querySelector(".form-login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  // 🔹 Faz login diretamente no Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    alert("E-mail ou senha incorretos!");
    console.error("Erro de login:", error);
    return;
  }

  // ✅ Login bem-sucedido
  const user = data.user;
  alert(`Bem-vindo, ${user.email}!`);

  // 🔹 Guarda informações básicas no localStorage
  localStorage.setItem("usuarioEmail", user.email);
  localStorage.setItem("usuarioId", user.id);

  // 🔹 Redireciona para o menu principal
  window.location.href = "menu.html";
});

// ==== VERIFICA LOGIN AUTOMÁTICO ====
document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    // já logado → vai direto pro painel
    window.location.href = "menu.html";
  }
});
