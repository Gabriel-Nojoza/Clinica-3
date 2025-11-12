// ============================================================
// 🧠 Reutiliza o Supabase global (criado em script.js)
// ============================================================
const supabaseMedicos = supabase;

// ============================================================
// 🔐 Verifica login e exibe usuário logado
// ============================================================
async function verificarLogin() {
  const { data, error } = await supabaseMedicos.auth.getSession();
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
// 📋 Carregar médicos
// ============================================================
async function carregarMedicos() {
  const tbody = document.querySelector("#tabelaMedico tbody");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='7'>Carregando médicos...</td></tr>";

  const { data, error } = await supabaseMedicos
    .from("medicos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar médicos:", error);
    tbody.innerHTML =
      "<tr><td colspan='7'>❌ Erro ao carregar médicos.</td></tr>";
    return;
  }

  tbody.innerHTML = "";

  data.forEach((m) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.id}</td>
      <td>${m.nome || "-"}</td>
      <td>${m.crm || "-"}</td>
      <td>${m.especialidade || "-"}</td>
      <td>${m.telefone || "-"}</td>
      <td>${m.email || "-"}</td>
      <td>
        <button class="btn-editar" data-id="${m.id}">✏️</button>
        <button class="btn-excluir" data-id="${m.id}">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// ➕ Modal Novo Médico
// ============================================================
function configurarModalNovoMedico() {
  const btnNovo = document.getElementById("btnNovoMedico");
  const modal = document.getElementById("modalNovoMedico");
  const fechar = document.getElementById("fecharModal");
  const cancelar = document.getElementById("cancelarNovo");
  const form = document.getElementById("formNovoMedico");

  if (!btnNovo || !modal || !form) return;

  // Abrir modal
  btnNovo.addEventListener("click", () => (modal.style.display = "block"));

  // Fechar modal
  [fechar, cancelar].forEach((el) =>
    el?.addEventListener("click", () => (modal.style.display = "none"))
  );

  // Fechar clicando fora
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Submeter novo médico
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("novoNome").value.trim();
    const crm = document.getElementById("novoCRM").value.trim();
    const especialidade = document
      .getElementById("novoEspecialidade")
      .value.trim();
    const telefone = document.getElementById("novoTelefone").value.trim();
    const email = document.getElementById("novoEmail").value.trim();

    if (!nome || !crm) {
      alert("⚠️ Nome e CRM são obrigatórios!");
      return;
    }

    const { error } = await supabaseMedicos.from("medicos").insert([
      {
        nome,
        crm,
        especialidade,
        telefone,
        email,
      },
    ]);

    if (error) {
      console.error("Erro ao cadastrar médico:", error);
      alert("Erro ao cadastrar médico!");
      return;
    }

    alert("✅ Médico cadastrado com sucesso!");
    modal.style.display = "none";
    form.reset();
    carregarMedicos();
  });
}

// ============================================================
// ✏️ Editar médico existente
// ============================================================
function configurarEdicaoMedico() {
  const tabela = document.getElementById("tabelaMedico");
  const modalEditar = document.getElementById("modalEditarMedico");
  const formEditar = document.getElementById("formEditarMedico");
  const fecharEditar = document.getElementById("fecharModalEditar");
  const cancelarEditar = document.getElementById("cancelarEditar");

  if (!tabela || !modalEditar || !formEditar) return;

  // Abrir modal com dados
  tabela.addEventListener("click", async (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (!id) return;

    // Excluir
    if (target.classList.contains("btn-excluir")) {
      if (confirm("Tem certeza que deseja excluir este médico?")) {
        const { error } = await supabaseMedicos
          .from("medicos")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Erro ao excluir médico:", error);
          alert("Erro ao excluir médico!");
          return;
        }

        alert("🗑️ Médico excluído com sucesso!");
        carregarMedicos();
      }
    }

    // Editar
    if (target.classList.contains("btn-editar")) {
      const { data, error } = await supabaseMedicos
        .from("medicos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Erro ao carregar dados do médico!");
        return;
      }

      document.getElementById("editarId").value = data.id;
      document.getElementById("editarNome").value = data.nome || "";
      document.getElementById("editarCRM").value = data.crm || "";
      document.getElementById("editarEspecialidade").value =
        data.especialidade || "";
      document.getElementById("editarTelefone").value = data.telefone || "";
      document.getElementById("editarEmail").value = data.email || "";

      modalEditar.style.display = "block";
    }
  });

  // Fechar modal
  [fecharEditar, cancelarEditar].forEach((el) =>
    el?.addEventListener("click", () => (modalEditar.style.display = "none"))
  );

  // Salvar edição
  formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editarId").value;
    const nome = document.getElementById("editarNome").value.trim();
    const crm = document.getElementById("editarCRM").value.trim();
    const especialidade = document
      .getElementById("editarEspecialidade")
      .value.trim();
    const telefone = document.getElementById("editarTelefone").value.trim();
    const email = document.getElementById("editarEmail").value.trim();

    if (!id) {
      alert("ID do médico não encontrado!");
      return;
    }

    const { error } = await supabaseMedicos
      .from("medicos")
      .update({ nome, crm, especialidade, telefone, email })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar médico:", error);
      alert("Erro ao atualizar médico!");
      return;
    }

    alert("✅ Médico atualizado com sucesso!");
    modalEditar.style.display = "none";
    carregarMedicos();
  });
}

// ============================================================
// 🔍 Busca dinâmica
// ============================================================
function configurarBusca() {
  const input = document.getElementById("busca");
  if (!input) return;

  input.addEventListener("input", () => {
    const termo = input.value.toLowerCase();
    const linhas = document.querySelectorAll("#tabelaMedico tbody tr");
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
    await supabaseMedicos.auth.signOut();
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// ============================================================
// 🚀 Inicialização da Página
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  await verificarLogin();
  await carregarMedicos();
  configurarModalNovoMedico();
  configurarEdicaoMedico();
  configurarBusca();
  configurarLogout();
});
