// ==== CONFIGURAÇÃO SUPABASE ====
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==== ELEMENTOS HTML ====
const novoPacienteBtn = document.getElementById("bntPaciente");
const modalNovoPaciente = document.getElementById("novoPaciente");
const fecharModal = document.getElementById("fecharModal");
const formNovoPaciente = document.querySelector("#novoPaciente form");

const modalEditarPaciente = document.getElementById("modalEditarPaciente");
const fecharModalEditar = document.getElementById("fecharModalEditar");
const formEditarPaciente = document.getElementById("formEditarPaciente");
const cancelarEditar = document.getElementById("cancelarEditar");

const tabelaPaciente = document.getElementById("tabelaPaciente").querySelector("tbody");

// ==== FUNÇÃO AUXILIAR PARA CONVERTER DATA ====
function formatarData(valor) {
  if (!valor) return null;
  if (valor.includes("/")) {
    const [dia, mes, ano] = valor.split("/");
    return `${ano}-${mes}-${dia}`;
  }
  return valor; // já está em formato ISO
}

// ==== MOSTRAR / FECHAR MODAL NOVO PACIENTE ====
novoPacienteBtn.addEventListener("click", () => (modalNovoPaciente.style.display = "block"));
fecharModal.addEventListener("click", () => (modalNovoPaciente.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modalNovoPaciente) modalNovoPaciente.style.display = "none";
  if (e.target === modalEditarPaciente) modalEditarPaciente.style.display = "none";
});

// ==== CADASTRAR NOVO PACIENTE ====
formNovoPaciente.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("novoNome").value.trim();
  const cpf = document.getElementById("novoCPF").value.trim();
  const dataNasc = formatarData(document.getElementById("data").value.trim());
  const telefone = document.getElementById("novoTelefone").value.trim();
  const email = document.getElementById("novoEmail").value.trim();
  const endereco = document.getElementById("endereco").value.trim();

  if (!nome || !cpf) {
    alert("Preencha os campos obrigatórios: Nome e CPF!");
    return;
  }

  const { error } = await supabase
    .from("pacientes")
    .insert([{ nome, cpf, dataNasc, telefone, email, endereco }]);

  if (error) {
    console.error("Erro detalhado:", error);
    alert("Erro ao salvar: " + error.message);
    return;
  }

  alert("Paciente cadastrado com sucesso!");
  formNovoPaciente.reset();
  modalNovoPaciente.style.display = "none";
  carregarPacientes();
});

// ==== LISTAR PACIENTES ====
async function carregarPacientes() {
  const { data: pacientes, error } = await supabase
    .from("pacientes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    alert("Erro ao carregar pacientes: " + error.message);
    return;
  }

  tabelaPaciente.innerHTML = "";
  pacientes.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>${p.cpf}</td>
      <td>${p.telefone || "-"}</td>
      <td>${p.email || "-"}</td>
      <td>${p.dataNasc || "-"}</td>
      <td>
        <button class="btn-editar" data-id="${p.id}">✏️</button>
        <button class="btn-excluir" data-id="${p.id}">🗑️</button>
      </td>
    `;
    tabelaPaciente.appendChild(tr);
  });

  adicionarEventosBotoes();
}

// ==== ADICIONAR EVENTOS AOS BOTÕES ====
function adicionarEventosBotoes() {
  // EDITAR
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Erro ao carregar paciente: " + error.message);
        return;
      }

      document.getElementById("editarId").value = data.id;
      document.getElementById("editarNome").value = data.nome;
      document.getElementById("editarCPF").value = data.cpf;
      document.getElementById("editarTelefone").value = data.telefone || "";
      document.getElementById("editarEmail").value = data.email || "";
      document.getElementById("editarEndereco").value = data.endereco || "";
      document.getElementById("editarDataNasc").value = data.dataNasc || "";

      modalEditarPaciente.style.display = "block";
    });
  });

  // EXCLUIR
  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Deseja realmente excluir este paciente?")) return;

      const { error } = await supabase.from("pacientes").delete().eq("id", id);
      if (error) {
        alert("Erro ao excluir: " + error.message);
        return;
      }

      alert("Paciente excluído com sucesso!");
      carregarPacientes();
    });
  });
}

// ==== SALVAR EDIÇÃO ====
formEditarPaciente.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editarId").value;
  const nome = document.getElementById("editarNome").value.trim();
  const cpf = document.getElementById("editarCPF").value.trim();
  const telefone = document.getElementById("editarTelefone").value.trim();
  const email = document.getElementById("editarEmail").value.trim();
  const endereco = document.getElementById("editarEndereco").value.trim();
  const dataNasc = formatarData(document.getElementById("editarDataNasc").value.trim());

  if (!nome || !cpf) {
    alert("Nome e CPF são obrigatórios!");
    return;
  }

  const { error } = await supabase
    .from("pacientes")
    .update({ nome, cpf, telefone, email, endereco, dataNasc })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar paciente: " + error.message);
    return;
  }

  alert("Paciente atualizado com sucesso!");
  modalEditarPaciente.style.display = "none";
  carregarPacientes();
});

// ==== CANCELAR EDIÇÃO ====
cancelarEditar.addEventListener("click", () => {
  modalEditarPaciente.style.display = "none";
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
carregarPacientes();
