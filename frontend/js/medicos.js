// js/medicos.js
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";

const supabaseMedicos = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
);

async function medicosEnsureAuth() {
  const { data, error } = await supabaseMedicos.auth.getSession();
  if (error) {
    console.error("Erro sessão médicos:", error);
    return null;
  }
  if (!data.session) {
    window.location.href = "login.html";
    return null;
  }
  return data.session;
}

async function getUsuarioIdAtual() {
  // tenta pegar do localStorage
  const cached = localStorage.getItem("usuarioId");
  if (cached) return cached;

  const { data: sessionData } = await supabaseMedicos.auth.getSession();
  const session = sessionData?.session;
  if (!session) return null;

  const { data, error } = await supabaseMedicos
    .from("usuarios")
    .select("id")
    .eq("auth_id", session.user.id)
    .single();

  if (error) {
    console.error("Erro buscando usuarioId:", error);
    return null;
  }

  localStorage.setItem("usuarioId", data.id);
  return data.id;
}

async function carregarMedicos() {
  const tbody = document.querySelector("#tabelaMedico tbody");
  if (!tbody) return;

  const { data, error } = await supabaseMedicos
    .from("medicos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar médicos:", error);
    alert("Erro ao carregar médicos.");
    return;
  }

  tbody.innerHTML = "";

  data.forEach((medico) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${medico.id}</td>
      <td>${medico.nome || ""}</td>
      <td>${medico.crm || ""}</td>
      <td>${medico.especialidade || ""}</td>
      <td>${medico.telefone || ""}</td>
      <td>${medico.email || ""}</td>
      <td>
        <button class="btn-acao btn-editar" data-id="${medico.id}">Editar</button>
        <button class="btn-acao btn-excluir" data-id="${medico.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filtrarTabelaMedicos() {
  const input = document.getElementById("busca");
  const filtro = (input.value || "").toLowerCase();
  const linhas = document.querySelectorAll("#tabelaMedico tbody tr");

  linhas.forEach((tr) => {
    const texto = tr.textContent.toLowerCase();
    tr.style.display = texto.includes(filtro) ? "" : "none";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const session = await medicosEnsureAuth();
  if (!session) return;

  // Preenche nome do usuário no sidebar, se existir
  const spanUser = document.getElementById("currentUser");
  const nomeLocal = localStorage.getItem("usuarioNome");
  const emailLocal = localStorage.getItem("usuarioEmail");
  if (spanUser) {
    spanUser.textContent =
      (nomeLocal && nomeLocal.trim()) || emailLocal || session.user.email;
  }

  // Configura logout (sidebar)
  const btnLogout = document.getElementById("logoutBtn");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await supabaseMedicos.auth.signOut();
      } catch (e) {
        console.error("Erro ao sair:", e);
      } finally {
        localStorage.clear();
        window.location.href = "login.html";
      }
    });
  }

  // ---------- Modal Novo Médico ----------
  const modalNovo = document.getElementById("modalNovoMedico");
  const btnNovo = document.getElementById("btnNovoMedico");
  const btnFecharNovo = document.getElementById("fecharModal");
  const btnCancelarNovo = document.getElementById("cancelarNovo");
  const formNovo = document.getElementById("formNovoMedico");

  btnNovo?.addEventListener("click", () => {
    modalNovo.style.display = "block";
  });
  btnFecharNovo?.addEventListener("click", () => {
    modalNovo.style.display = "none";
  });
  btnCancelarNovo?.addEventListener("click", () => {
    modalNovo.style.display = "none";
  });

  formNovo?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("novoNome").value.trim();
    const crm = document.getElementById("novoCRM").value.trim();
    const especialidade = document
      .getElementById("novoEspecialidade")
      .value.trim();
    const telefone = document.getElementById("novoTelefone").value.trim();
    const email = document.getElementById("novoEmail").value.trim();

    if (!nome || !crm) {
      alert("Nome e CRM são obrigatórios!");
      return;
    }

    const usuarioId = await getUsuarioIdAtual();
    if (!usuarioId) {
      alert("Não foi possível identificar o usuário logado.");
      return;
    }

    const { error } = await supabaseMedicos.from("medicos").insert([
      {
        usuario_id: usuarioId,
        nome,
        crm,
        especialidade,
        telefone,
        email,
      },
    ]);

    if (error) {
      console.error("Erro ao cadastrar médico:", error);
      alert("Erro ao cadastrar médico. Verifique o console.");
      return;
    }

    alert("✅ Médico cadastrado com sucesso!");
    modalNovo.style.display = "none";
    formNovo.reset();
    carregarMedicos();
  });

  // ---------- Modal Editar Médico ----------
  const modalEditar = document.getElementById("modalEditarMedico");
  const btnFecharEditar = document.getElementById("fecharModalEditar");
  const btnCancelarEditar = document.getElementById("cancelarEditar");
  const formEditar = document.getElementById("formEditarMedico");

  btnFecharEditar?.addEventListener("click", () => {
    modalEditar.style.display = "none";
  });
  btnCancelarEditar?.addEventListener("click", () => {
    modalEditar.style.display = "none";
  });

  formEditar?.addEventListener("submit", async (e) => {
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
      alert("ID do médico não encontrado.");
      return;
    }

    const { error } = await supabaseMedicos
      .from("medicos")
      .update({ nome, crm, especialidade, telefone, email })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar médico:", error);
      alert("Erro ao atualizar médico.");
      return;
    }

    alert("✅ Médico atualizado com sucesso!");
    modalEditar.style.display = "none";
    carregarMedicos();
  });

  // Delegação de eventos da tabela (Editar / Excluir)
  const tabela = document.getElementById("tabelaMedico");
  tabela?.addEventListener("click", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const id = target.getAttribute("data-id");
    if (!id) return;

    if (target.classList.contains("btn-excluir")) {
      if (!confirm("Tem certeza que deseja excluir este médico?")) return;

      const { error } = await supabaseMedicos
        .from("medicos")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir médico:", error);
        alert("Erro ao excluir médico.");
        return;
      }

      alert("Médico excluído com sucesso.");
      carregarMedicos();
    }

    if (target.classList.contains("btn-editar")) {
      // carrega dados do médico e abre modal
      const { data, error } = await supabaseMedicos
        .from("medicos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao carregar médico:", error);
        alert("Erro ao carregar dados do médico.");
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

  // Busca
  const inputBusca = document.getElementById("busca");
  inputBusca?.addEventListener("input", filtrarTabelaMedicos);

  // Carrega lista inicial
  carregarMedicos();
});
