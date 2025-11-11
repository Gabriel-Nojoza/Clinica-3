// ============================================================
// 🧠 Reutiliza o cliente Supabase global criado em script.js
// ============================================================
const supabaseUsuarios = supabase;

// ============================================================
// 🔐 Verificar login do usuário
// ============================================================
async function verificarLogin() {
  const { data, error } = await supabaseUsuarios.auth.getSession();
  if (error || !data.session) {
    window.location.href = "login.html";
    return;
  }

  const nome = localStorage.getItem("usuarioNome");
  const email = localStorage.getItem("usuarioEmail");
  const span = document.getElementById("currentUser");

  if (span) span.textContent = nome || email || data.session.user.email;
}

// ============================================================
// 📋 Carregar todos os usuários da tabela 'usuarios'
// ============================================================
async function carregarUsuarios() {
  const tbody = document.querySelector("#tabelaUsuarios tbody");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='5'>Carregando usuários...</td></tr>";

  const { data, error } = await supabaseUsuarios
    .from("usuarios")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar usuários:", error);
    tbody.innerHTML =
      "<tr><td colspan='5'>❌ Erro ao carregar usuários.</td></tr>";
    return;
  }

  tbody.innerHTML = "";

  data.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.nome || "-"}</td>
      <td>${u.email || "-"}</td>
      <td>${u.criado_em ? new Date(u.criado_em).toLocaleString("pt-BR") : "-"}</td>
      <td>
        <button class="btn-editar" data-id="${u.id}">✏️</button>
        <button class="btn-excluir" data-id="${u.id}">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// ➕ Novo usuário (Auth + tabela 'usuarios')
// ============================================================
function configurarNovoUsuario() {
  const btnNovo = document.getElementById("btnNovo");
  const modal = document.getElementById("modalNovoUsuario");
  const fechar = document.getElementById("fecharModal");
  const form = document.getElementById("formNovoUsuario");

  if (!btnNovo || !modal || !form) return;

  // Abrir modal
  btnNovo.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Fechar modal
  fechar.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Fechar clicando fora
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Enviar formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("novoNome").value.trim();
    const email = document.getElementById("novoEmail").value.trim();
    const senha = document.getElementById("novoSenha").value.trim();

    if (!nome || !email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      // Cria usuário no Auth
      const { data: authData, error: authError } =
        await supabaseUsuarios.auth.signUp({
          email,
          password: senha,
        });

      if (authError) {
        console.error("Erro no Auth:", authError);
        alert("Erro ao criar usuário no Supabase Auth.");
        return;
      }

      // Cadastra também na tabela 'usuarios'
      const { error: dbError } = await supabaseUsuarios.from("usuarios").insert([
        {
          auth_id: authData.user.id,
          nome,
          email,
          tipo: "Usuário",
        },
      ]);

      if (dbError) {
        console.error("Erro ao salvar no banco:", dbError);
        alert("Usuário criado no Auth, mas erro ao salvar na tabela!");
        return;
      }

      alert("✅ Usuário cadastrado com sucesso!");
      modal.style.display = "none";
      form.reset();
      carregarUsuarios();
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Erro inesperado ao cadastrar usuário.");
    }
  });
}

// ============================================================
// ✏️ Editar usuário existente
// ============================================================
function configurarEdicaoUsuario() {
  const tabela = document.getElementById("tabelaUsuarios");
  const modalEditar = document.getElementById("modalEditarUsuario");
  const formEditar = document.getElementById("formEditarUsuario");
  const fecharEditar = document.getElementById("fecharModalEditar");
  const cancelarEditar = document.getElementById("cancelarEditar");

  if (!tabela || !modalEditar || !formEditar) return;

  // Abrir modal com dados
  tabela.addEventListener("click", async (e) => {
    const btn = e.target;
    const id = btn.dataset.id;

    if (btn.classList.contains("btn-editar")) {
      const { data, error } = await supabaseUsuarios
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Erro ao carregar usuário para edição!");
        return;
      }

      document.getElementById("editarId").value = data.id;
      document.getElementById("editarNome").value = data.nome || "";
      document.getElementById("editarUsuario").value = data.nome || "";
      document.getElementById("editarEmail").value = data.email || "";
      document.getElementById("editarTipo").value = data.tipo || "Usuário";

      modalEditar.style.display = "block";
    }

    // Excluir
    if (btn.classList.contains("btn-excluir")) {
      if (confirm("Tem certeza que deseja excluir este usuário?")) {
        const { error } = await supabaseUsuarios
          .from("usuarios")
          .delete()
          .eq("id", id);

        if (error) {
          alert("Erro ao excluir usuário!");
        } else {
          alert("🗑️ Usuário excluído com sucesso!");
          carregarUsuarios();
        }
      }
    }
  });

  // Fechar modal
  if (fecharEditar)
    fecharEditar.addEventListener("click", () => {
      modalEditar.style.display = "none";
    });

  if (cancelarEditar)
    cancelarEditar.addEventListener("click", () => {
      modalEditar.style.display = "none";
    });

  // Salvar edição
  formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editarId").value;
    const nome = document.getElementById("editarNome").value.trim();
    const tipo = document.getElementById("editarTipo").value;

    if (!id || !nome) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const { error } = await supabaseUsuarios
      .from("usuarios")
      .update({ nome, tipo })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar usuário!");
      return;
    }

    alert("✅ Usuário atualizado com sucesso!");
    modalEditar.style.display = "none";
    carregarUsuarios();
  });
}

// ============================================================
// 🔍 Busca de usuários
// ============================================================
function configurarBusca() {
  const busca = document.getElementById("busca");
  if (!busca) return;

  busca.addEventListener("input", () => {
    const termo = busca.value.toLowerCase();
    const linhas = document.querySelectorAll("#tabelaUsuarios tbody tr");
    linhas.forEach((tr) => {
      const texto = tr.textContent.toLowerCase();
      tr.style.display = texto.includes(termo) ? "" : "none";
    });
  });
}

// ============================================================
// 🚪 Logout
// ============================================================
function configurarLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    await supabaseUsuarios.auth.signOut();
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// ============================================================
// 🚀 Inicialização
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  await verificarLogin();
  await carregarUsuarios();
  configurarNovoUsuario();
  configurarEdicaoUsuario();
  configurarBusca();
  configurarLogout();
});
