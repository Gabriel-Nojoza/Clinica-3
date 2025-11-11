// js/pacientes.js
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";

const supabasePacientes = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
);

async function pacientesEnsureAuth() {
  const { data, error } = await supabasePacientes.auth.getSession();
  if (error) {
    console.error("Erro sessão pacientes:", error);
    return null;
  }
  if (!data.session) {
    window.location.href = "login.html";
    return null;
  }
  return data.session;
}

async function carregarPacientes() {
  const tbody = document.querySelector("#tabelaPaciente tbody");
  if (!tbody) return;

  const { data, error } = await supabasePacientes
    .from("pacientes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar pacientes:", error);
    alert("Erro ao carregar pacientes.");
    return;
  }

  tbody.innerHTML = "";

  data.forEach((p) => {
    const dataNasc = p.dataNasc
      ? new Date(p.dataNasc).toLocaleDateString("pt-BR")
      : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome || ""}</td>
      <td>${p.cpf || ""}</td>
      <td>${p.telefone || ""}</td>
      <td>${p.email || ""}</td>
      <td>${dataNasc}</td>
      <td>
        <button class="btn-acao btn-editar" data-id="${p.id}">Editar</button>
        <button class="btn-acao btn-excluir" data-id="${p.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filtrarTabelaPacientes() {
  const input = document.getElementById("busca");
  const filtro = (input.value || "").toLowerCase();
  const linhas = document.querySelectorAll("#tabelaPaciente tbody tr");

  linhas.forEach((tr) => {
    const texto = tr.textContent.toLowerCase();
    tr.style.display = texto.includes(filtro) ? "" : "none";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const session = await pacientesEnsureAuth();
  if (!session) return;

  // Preenche nome do usuário no sidebar
  const spanUser = document.getElementById("currentUser");
  const nomeLocal = localStorage.getItem("usuarioNome");
  const emailLocal = localStorage.getItem("usuarioEmail");
  if (spanUser) {
    spanUser.textContent =
      (nomeLocal && nomeLocal.trim()) || emailLocal || session.user.email;
  }

  const btnLogout = document.getElementById("logoutBtn");
  btnLogout?.addEventListener("click", async () => {
    try {
      await supabasePacientes.auth.signOut();
    } catch (e) {
      console.error("Erro ao sair:", e);
    } finally {
      localStorage.clear();
      window.location.href = "login.html";
    }
  });

  // ---------- Modal Novo Paciente ----------
  const modalNovo = document.getElementById("novoPaciente");
  const btnNovo = document.getElementById("bntPaciente");
  const btnFecharNovo = document.getElementById("fecharModal");
  const btnCancelarNovo = document.getElementById("cancelarNovo");
  const formNovo = document.getElementById("formNovoPaciente");

  btnNovo?.addEventListener("click", () => (modalNovo.style.display = "block"));
  btnFecharNovo?.addEventListener(
    "click",
    () => (modalNovo.style.display = "none")
  );
  btnCancelarNovo?.addEventListener(
    "click",
    () => (modalNovo.style.display = "none")
  );

  formNovo?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("novoNome").value.trim();
    const cpf = document.getElementById("novoCPF").value.trim();
    const dataNasc = document.getElementById("data").value;
    const telefone = document.getElementById("novoTelefone").value.trim();
    const email = document.getElementById("novoEmail").value.trim();
    const endereco = document.getElementById("endereco").value.trim();

    if (!nome || !cpf || !dataNasc) {
      alert("Nome, CPF e Data de Nascimento são obrigatórios!");
      return;
    }

    const { error } = await supabasePacientes.from("pacientes").insert([
      {
        nome,
        cpf,
        dataNasc,
        telefone,
        email,
        endereco,
      },
    ]);

    if (error) {
      console.error("Erro ao cadastrar paciente:", error);
      alert("Erro ao cadastrar paciente. Verifique o console.");
      return;
    }

    alert("✅ Paciente cadastrado com sucesso!");
    modalNovo.style.display = "none";
    formNovo.reset();
    carregarPacientes();
  });

  // ---------- Modal Editar Paciente ----------
  const modalEditar = document.getElementById("modalEditarPaciente");
  const btnFecharEditar = document.getElementById("fecharModalEditar");
  const btnCancelarEditar = document.getElementById("cancelarEditar");
  const formEditar = document.getElementById("formEditarPaciente");

  btnFecharEditar?.addEventListener(
    "click",
    () => (modalEditar.style.display = "none")
  );
  btnCancelarEditar?.addEventListener(
    "click",
    () => (modalEditar.style.display = "none")
  );

  formEditar?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editarId").value;
    const nome = document.getElementById("editarNome").value.trim();
    const cpf = document.getElementById("editarCPF").value.trim();
    const telefone = document.getElementById("editarTelefone").value.trim();
    const email = document.getElementById("editarEmail").value.trim();
    const endereco = document.getElementById("editarEndereco").value.trim();
    const dataNasc = document.getElementById("editarDataNasc").value;

    if (!id) {
      alert("ID do paciente não encontrado.");
      return;
    }

    const { error } = await supabasePacientes
      .from("pacientes")
      .update({ nome, cpf, telefone, email, endereco, dataNasc })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar paciente:", error);
      alert("Erro ao atualizar paciente.");
      return;
    }

    alert("✅ Paciente atualizado com sucesso!");
    modalEditar.style.display = "none";
    carregarPacientes();
  });

  // Tabela - editar/excluir
  const tabela = document.getElementById("tabelaPaciente");
  tabela?.addEventListener("click", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const id = target.getAttribute("data-id");
    if (!id) return;

    if (target.classList.contains("btn-excluir")) {
      if (!confirm("Tem certeza que deseja excluir este paciente?")) return;

      const { error } = await supabasePacientes
        .from("pacientes")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir paciente:", error);
        alert("Erro ao excluir paciente.");
        return;
      }

      alert("Paciente excluído com sucesso.");
      carregarPacientes();
    }

    if (target.classList.contains("btn-editar")) {
      const { data, error } = await supabasePacientes
        .from("pacientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao carregar paciente:", error);
        alert("Erro ao carregar dados do paciente.");
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

  // Busca
  const inputBusca = document.getElementById("busca");
  inputBusca?.addEventListener("input", filtrarTabelaPacientes);

  // Carregar lista inicial
  carregarPacientes();
});
