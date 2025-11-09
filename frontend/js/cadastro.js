// ==== CONFIGURAÇÃO SUPABASE ====
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==== CADASTRAR NOVO USUÁRIO ====
document.querySelector(".form-register").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const msg = document.getElementById("msg");

  msg.textContent = "Criando conta...";
  msg.style.color = "#555";

  if (!email || !senha) {
    msg.textContent = "Preencha todos os campos!";
    msg.style.color = "red";
    return;
  }

  // 🔹 Cria usuário no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
  });

  if (error) {
    msg.textContent = "Erro: " + error.message;
    msg.style.color = "red";
    console.error(error);
    return;
  }

  msg.textContent = "Conta criada com sucesso! Redirecionando...";
  msg.style.color = "green";

  // 🔹 Redireciona pro login após 2 segundos
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
});
