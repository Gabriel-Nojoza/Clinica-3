// ============================================================
// 🔧 CONFIGURAÇÃO DO SUPABASE
// ============================================================
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ============================================================
// 🧠 AUTENTICAÇÃO E INICIALIZAÇÃO
// ============================================================
async function verificarLogin() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
    return;
  }

  // Exibe o nome ou email do usuário logado
  const usuarioNome = localStorage.getItem("usuarioNome");
  const usuarioEmail = localStorage.getItem("usuarioEmail");
  document.getElementById("currentUser").textContent =
    usuarioNome || usuarioEmail || "Usuário Logado";
}

// ============================================================
// 📋 LISTAR USUÁRIOS
// ============================================================
async function carregarUsuarios() {
  const tabela = document.querySelector("#tabelaUsuarios tbody");
  tabela.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar usuários:", error);
    tabela.innerHTML = "<tr><td colspan='5'>Erro ao carregar usuários.</td></tr>";
    return;
  }

  tabela.innerHTML = "";

  data.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td>${new Date(u.criado_em).toLocaleString("pt-BR")}</td>
      <td>
        <button class="btn-editar" data-id="${u.id}">✏️</button>
        <button class="btn-excluir" data-id="${u.id}">🗑️</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

// ============================================================
// ➕ NOVO USUÁRIO
// ============================================================
document.getElementById("btnNovo").addEventListener("click", () => {
  document.getElementById("modalNovoUsuario").style.display = "block";
});

document.getElementById("fecharModal").addEventListener("click", () => {
  document.getElementById("modalNovoUsuario").style.display = "none";
});

document
  .getElementById("formNovoUsuario")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("novoNome").value.trim();
    const email = document.getElementById("novoEmail").value.trim();
    const senha = document.getElementById("novoSenha").value.trim();

    if (!nome || !email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    // Cria o usuário no Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signUp({ email, password: senha });

    if (authError) {
      console.error("Erro no Auth:", authError);
      alert("Erro ao criar usuário no Auth!");
      return;
    }

    // Salva também na tabela 'usuarios'
    const { error: insertError } = await supabase.from("usuarios").insert([
      {
        nome,
        email,
        tipo: "Usuário",
        auth_id: authData.user?.id,
      },
    ]);

    if (insertError) {
      console.error("Erro ao salvar no banco:", insertError);
      alert("Usuário criado no Auth, mas erro ao salvar na tabela!");
      return;
    }

    alert("✅ Usuário cadastrado com sucesso!");
    document.getElementById("modalNovoUsuario").style.display = "none";
    e.target.reset();
    carregarUsuarios();
  });

// ============================================================
// ✏️ EDITAR USUÁRIO
// ============================================================
document
  .getElementById("tabelaUsuarios")
  .addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-editar")) {
      const id = e.target.dataset.id;
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Erro ao buscar usuário para editar!");
        return;
      }

      document.getElementById("editarId").value = data.id;
      document.getElementById("editarNome").value = data.nome;
      document.getElementById("editarUsuario").value = data.nome;
      document.getElementById("editarEmail").value = data.email;
      document.getElementById("editarTipo").value = data.tipo || "Usuário";

      document.getElementById("modalEditarUsuario").style.display = "block";
    }

    if (e.target.classList.contains("btn-excluir")) {
      const id = e.target.dataset.id;
      if (confirm("Tem certeza que deseja excluir este usuário?")) {
        const { error } = await supabase.from("usuarios").delete().eq("id", id);
        if (error) {
          alert("Erro ao excluir usuário!");
        } else {
          alert("🗑️ Usuário excluído com sucesso!");
          carregarUsuarios();
        }
      }
    }
  });

document
  .getElementById("formEditarUsuario")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editarId").value;
    const nome = document.getElementById("editarNome").value.trim();
    const tipo = document.getElementById("editarTipo").value;

    const { error } = await supabase
      .from("usuarios")
      .update({ nome, tipo })
      .eq("id", id);

    if (error) {
      alert("Erro ao salvar alterações!");
      return;
    }

    alert("✅ Usuário atualizado com sucesso!");
    document.getElementById("modalEditarUsuario").style.display = "none";
    carregarUsuarios();
  });

document.getElementById("cancelarEditar").addEventListener("click", () => {
  document.getElementById("modalEditarUsuario").style.display = "none";
});

// ============================================================
// 🔎 BUSCAR USUÁRIOS
// ============================================================
document.getElementById("busca").addEventListener("input", (e) => {
  const termo = e.target.value.toLowerCase();
  const linhas = document.querySelectorAll("#tabelaUsuarios tbody tr");

  linhas.forEach((linha) => {
    const texto = linha.textContent.toLowerCase();
    linha.style.display = texto.includes(termo) ? "" : "none";
  });
});

// ============================================================
// 🚪 LOGOUT
// ============================================================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.clear();
  window.location.href = "login.html";
});

// ============================================================
// 🚀 INICIALIZAÇÃO
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  await verificarLogin();
  await carregarUsuarios();
});
