// Função de login
document.querySelector(".form-login").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Pega os valores digitados
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Verifica se todos os campos estão preenchidos
  if (!email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    // Faz a requisição de login para o backend
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    // Converte a resposta em JSON
    const data = await res.json().catch(() => ({}));

    // ✅ Verifica se o login foi bem-sucedido
    if (res.ok && data.user) {
      const usuario = data.user;
      delete usuario.senha; // nunca armazenar a senha

      // 🔹 Salva tudo no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuarioId", usuario.id);
      localStorage.setItem("usuarioNome", usuario.nome);
      localStorage.setItem("usuarioEmail", usuario.email);
      localStorage.setItem("usuarioTipo", usuario.tipo || "Usuário");

      console.log("✅ Usuário logado:", usuario);
      console.log("✅ Token salvo:", data.token);

      // Mostra mensagem personalizada
      alert(`Bem-vindo, ${usuario.nome}!`);

      // Redireciona para o menu principal
      window.location.href = "menu.html";
    } else {
      alert(data.message || "E-mail ou senha incorretos!");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
  }
});
