// ==== CONFIGURAÇÃO SUPABASE ====
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==== ELEMENTOS HTML ====
const btnNovoMedico = document.getElementById("btnNovoMedico");
const modalNovoMedico = document.getElementById("modalNovoMedico");
const fecharModalNovo = document.getElementById("fecharModal");
const formNovoMedico = document.getElementById("formNovoMedico");

const modalEditarMedico = document.getElementById("modalEditarMedico");
const fecharModalEditar = document.getElementById("fecharModalEditar");
const formEditarMedico = document.getElementById("formEditarMedico");
const cancelarEditar = document.getElementById("cancelarEditar");

const tabelaMedico = document.getElementById("tabelaMedico").querySelector("tbody");

// ==== FUNÇÃO AUXILIAR PARA LIMPAR FORM ====
function limparFormulario(form) {
  form.reset();
}

// ==== MOSTRAR E FECHAR MODAIS ====
btnNovoMedico.addEventListener("click", () => (modalNovoMedico.style.display = "block"));
fecharModalNovo.addEventListener("click", () => (modalNovoMedico.style.display = "none"));
fecharModalEditar.addEventListener("click", () => (modalEditarMedico.style.display = "none"));
cancelarEditar.addEventListener("click", () => (modalEditarMedico.style.display = "none"));

window.addEventListener("click", (e) => {
  if (e.target === modalNovoMedico) modalNovoMedico.style.display = "none";
  if (e.target === modalEditarMedico) modalEditarMedico.style.display = "none";
});

// ==== CADASTRAR NOVO MÉDICO ====
// ==== CADASTRAR NOVO MÉDICO ====
formNovoMedico.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("novoNome").value.trim();
  const crm = document.getElementById("novoCRM").value.trim();
  const especialidade = document.getElementById("novoEspecialidade").value.trim();
  const telefone = document.getElementById("novoTelefone").value.trim();
  const email = document.getElementById("novoEmail").value.trim();

  // ✅ Captura o ID do usuário logado
  const usuario_id = localStorage.getItem("usuarioId");

  if (!nome || !crm) {
    alert("Preencha os campos obrigatórios: Nome e CRM!");
    return;
  }

  // 🔹 Envia todos os campos, incluindo usuario_id
  const { error } = await supabase
    .from("medicos")
    .insert([{ nome, crm, especialidade, telefone, email, usuario_id }]);

  if (error) {
    console.error("Erro ao salvar médico:", error);
    alert("Erro ao salvar: " + error.message);
    return;
  }

  alert("Médico cadastrado com sucesso!");
  formNovoMedico.reset();
  modalNovoMedico.style.display = "none";
  carregarMedicos();
});


// ==== SALVAR EDIÇÃO DE MÉDICO ====
formEditarMedico.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editarId").value;
  const nome = document.getElementById("editarNome").value.trim();
  const crm = document.getElementById("editarCRM").value.trim();
  const especialidade = document.getElementById("editarEspecialidade").value.trim();
  const telefone = document.getElementById("editarTelefone").value.trim();
  const email = document.getElementById("editarEmail").value.trim();

  // ✅ Pega novamente o usuário logado
  const usuario_id = localStorage.getItem("usuarioId");

  if (!nome || !crm) {
    alert("Nome e CRM são obrigatórios!");
    return;
  }

  // 🔹 Atualiza com usuario_id (mantém vínculo)
  const { error } = await supabase
    .from("medicos")
    .update({ nome, crm, especialidade, telefone, email, usuario_id })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar médico: " + error.message);
    return;
  }

  alert("Médico atualizado com sucesso!");
  modalEditarMedico.style.display = "none";
  carregarMedicos();
});


// ==== LISTAR MÉDICOS ====
async function carregarMedicos() {
  const { data: medicos, error } = await supabase
    .from("medicos")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao carregar médicos:", error);
    alert("Erro ao carregar médicos: " + error.message);
    return;
  }

  tabelaMedico.innerHTML = "";
  medicos.forEach((m) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.id}</td>
      <td>${m.nome}</td>
      <td>${m.crm}</td>
      <td>${m.especialidade || "-"}</td>
      <td>${m.telefone || "-"}</td>
      <td>${m.email || "-"}</td>
      <td>
        <button class="btn-editar" data-id="${m.id}">✏️</button>
        <button class="btn-excluir" data-id="${m.id}">🗑️</button>
      </td>
    `;
    tabelaMedico.appendChild(tr);
  });

  adicionarEventosBotoes();
}

// ==== ADICIONAR EVENTOS AOS BOTÕES ====
function adicionarEventosBotoes() {
  // EDITAR MÉDICO
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");

      const { data, error } = await supabase
        .from("medicos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Erro ao carregar médico: " + error.message);
        return;
      }

      document.getElementById("editarId").value = data.id;
      document.getElementById("editarNome").value = data.nome;
      document.getElementById("editarCRM").value = data.crm;
      document.getElementById("editarEspecialidade").value = data.especialidade || "";
      document.getElementById("editarTelefone").value = data.telefone || "";
      document.getElementById("editarEmail").value = data.email || "";

      modalEditarMedico.style.display = "block";
    });
  });

  // EXCLUIR MÉDICO
  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Deseja realmente excluir este médico?")) return;

      const { error } = await supabase.from("medicos").delete().eq("id", id);
      if (error) {
        alert("Erro ao excluir: " + error.message);
        return;
      }

      alert("Médico excluído com sucesso!");
      carregarMedicos();
    });
  });
}

// ==== SALVAR EDIÇÃO DE MÉDICO ====
formEditarMedico.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editarId").value;
  const nome = document.getElementById("editarNome").value.trim();
  const crm = document.getElementById("editarCRM").value.trim();
  const especialidade = document.getElementById("editarEspecialidade").value.trim();
  const telefone = document.getElementById("editarTelefone").value.trim();
  const email = document.getElementById("editarEmail").value.trim();

  if (!nome || !crm) {
    alert("Nome e CRM são obrigatórios!");
    return;
  }

  const { error } = await supabase
    .from("medicos")
    .update({ nome, crm, especialidade, telefone, email })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar médico: " + error.message);
    return;
  }

  alert("Médico atualizado com sucesso!");
  modalEditarMedico.style.display = "none";
  carregarMedicos();
});

// ==== MOSTRAR USUÁRIO LOGADO ====
document.addEventListener("DOMContentLoaded", () => {
  const currentUserSpan = document.getElementById("currentUser");
  const currentUserRole = document.querySelector(".user-role");

  const nome = localStorage.getItem("usuarioNome");
  const tipo = localStorage.getItem("usuarioTipo");

  if (nome) {
    currentUserSpan.textContent = nome;
    currentUserRole.textContent = tipo || "Usuário";
  } else {
    currentUserSpan.textContent = "Desconhecido";
    currentUserRole.textContent = "";
  }
});

// ==== LOGOUT ====
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ==== INICIALIZAR ====
carregarMedicos();
