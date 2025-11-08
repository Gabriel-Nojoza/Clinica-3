async function cadastro(event) {
  event.preventDefault(); // impede o recarregamento da página

  // Captura os valores dos campos do formulário
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const tipoSelect = document.getElementById("tipo"); // campo opcional, se existir
  const tipo = tipoSelect ? tipoSelect.value : "admin"; // padrão admin caso não tenha o select

  // Validação básica
  if (!nome || !email || !senha) {
    alert("Preencha todos os campos!");
    return false;
  }

  // Monta o corpo da requisição
  const dados = { nome, email, senha, tipo };

  try {
    // Envia a requisição pro backend
    const resposta = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    // Trata o retorno
    if (resposta.ok) {
      alert("Usuário cadastrado com sucesso!");
      // Redireciona para a tela de login
      window.location.href = "login.html";
    } else {
      const erro = await resposta.json();
      alert(`Erro ao cadastrar: ${erro.message || "Verifique os dados e tente novamente."}`);
    }
  } catch (erro) {
    console.error("Erro na requisição:", erro);
    alert("Falha ao conectar com o servidor. Verifique se o backend está rodando.");
  }

  return false;
}
