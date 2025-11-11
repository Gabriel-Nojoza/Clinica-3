// ============================================================
// 🧠 Reutiliza o Supabase global (criado em script.js)
// ============================================================
const supabasePacientes = supabase;

// ============================================================
// 🔐 Verifica login e mostra nome do usuário logado
// ============================================================
async function verificarLogin() {
  const { data, error } = await supabasePacientes.auth.getSession();
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
// 📋 Carregar pacientes da tabela
// ============================================================
async function carregarPacientes() {
  const tbody = document.querySelector("#tabelaPaciente tbody");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='7'>Carregando pacientes...</td></tr>";

  const { data, error } = await supabasePacientes
    .from("pacientes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar pacientes:", error);
    tbody.innerHTML =
      "<tr><td colspan='7'>❌ Erro ao carregar pacientes.</td></tr>";
    return;
  }

  tbody.innerHTML = "";

  data.forEach((p) => {
    const dataNasc = p.dataNasc
      ? new Date(p.dataNasc).toLocaleDateString("pt-BR")
      : "-";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome || "-"}</td>
      <td>${p.cpf || "-"}</td>
      <td>${p.telefone || "-"}</td>
      <td>${p.email || "-"}</td>
      <td>${dataNasc}</td>
      <td>
        <button class="btn-editar" data-id="${p.id}">✏️</button>
        <button class="btn-excluir" data-id="${p.id}">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// ➕ Modal de novo paciente
// ============================================================
function configurarModalNovoPaciente() {
  const btnNovo = document.getElementById("bntPaciente");
  const modal = document.getElementById("novoPaciente");
  const fechar = document.getElementById("fecharModal");
  const cancelar = document.getElementById("cancelarNovo");
  const form = document.getElementById("formNovoPaciente");

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

  // Submeter novo paciente
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("novoNome").value.trim();
    const cpf = document.getElementById("novoCPF").value.trim();
    const dataNasc = document.getElementById("data").value;
    const telefone = document.getElementById("novoTelefone").value.trim();
    const email = document.getElementById("novoEmail").value.trim();
    const endereco = document.getElementById("endereco").value.trim();

    if (!nome || !cpf || !dataNasc) {
      alert("⚠️ Nome, CPF e Data de Nascimento são obrigatórios!");
      return;
    }

    const { error } = await supabasePacientes.from("pacientes").insert([
      {
        nome,
        cpf,
        telefone,
        email,
        endereco,
        dataNasc,
      },
    ]);

    if (error) {
      console.error("Erro ao cadastrar paciente:", error);
      alert("Erro ao cadastrar paciente!");
      return;
    }

    alert("✅ Paciente cadastrado com sucesso!");
    modal.style.display = "none";
    form.reset();
    carregarPacientes();
  });
}

// ============================================================
// ✏️ Editar paciente existente
// ============================================================
function configurarEdicaoPaciente() {
  const tabela = document.getElementById("tabelaPaciente");
  const modalEditar = document.getElementById("modalEditarPaciente");
  const formEditar = document.getElementById("formEditarPaciente");
  const fecharEditar = document.getElementById("fecharModalEditar");
  const cancelarEditar = document.getElementById("cancelarEditar");

  if (!tabela || !modalEditar || !formEditar) return;

  // Abrir modal de edição
  tabela.addEventListener("click", async (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (!id) return;

    // Excluir paciente
    if (target.classList.contains("btn-excluir")) {
      if (confirm("Tem certeza que deseja excluir este paciente?")) {
        const { error } = await supabasePacientes
          .from("pacientes")
          .delete()
          .eq("id", id);

        if (error) {
          alert("Erro ao excluir paciente!");
          return;
        }

        alert("🗑️ Paciente excluído com sucesso!");
        carregarPacientes();
      }
    }

    // Editar paciente
    if (target.classList.contains("btn-editar")) {
      const { data, error } = await supabasePacientes
        .from("pacientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Erro ao carregar dados do paciente!");
        return;
      }

      document.getElementById("editarId").value = data.id;
      document.getElementById("editarNome").value = data.nome || "";
      document.getElementById("editarCPF").value = data.cpf || "";
      document.getElementById("editarTelefone").value = data.telefone || "";
      document.getElementById("editarEmail").value = data.email || "";
      document.getElementById("editarEndereco").value = data.endereco || "";
      document.getElementById("editarDataNasc").value =
        data.dataNasc?.slice(0, 10) || "";

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
    const cpf = document.getElementById("editarCPF").value.trim();
    const telefone = document.getElementById("editarTelefone").value.trim();
    const email = document.getElementById("editarEmail").value.trim();
    const endereco = document.getElementById("editarEndereco").value.trim();
    const dataNasc = document.getElementById("editarDataNasc").value;

    if (!id) {
      alert("ID do paciente não encontrado!");
      return;
    }

    const { error } = await supabasePacientes
      .from("pacientes")
      .update({ nome, cpf, telefone, email, endereco, dataNasc })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar paciente:", error);
      alert("Erro ao atualizar paciente!");
      return;
    }

    alert("✅ Paciente atualizado com sucesso!");
    modalEditar.style.display = "none";
    carregarPacientes();
  });
}

// ============================================================
// 🔎 Buscar paciente
// ============================================================
function configurarBusca() {
  const busca = document.getElementById("busca");
  if (!busca) return;

  busca.addEventListener("input", () => {
    const termo = busca.value.toLowerCase();
    const linhas = document.querySelectorAll("#tabelaPaciente tbody tr");
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
    await supabasePacientes.auth.signOut();
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// ============================================================
// 🚀 Inicialização
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  await verificarLogin();
  await carregarPacientes();
  configurarModalNovoPaciente();
  configurarEdicaoPaciente();
  configurarBusca();
  configurarLogout();
});
