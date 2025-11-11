// js/usuario.js
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";

const supabaseUsuarios = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
);

async function usuariosEnsureAuth() {
  const { data, error } = await supabaseUsuarios.auth.getSession();
  if (error) {
    console.error("Erro sessão usuarios:", error);
    return null;
  }
  if (!data.session) {
    window.location.href = "login.html";
    return null;
  }
  return data.session;
}

async function carregarUsuarios() {
  const tbody = document.querySelector("#tabelaUsuarios tbody");
  if (!tbody) return;

  const { data, error } = await supabaseUsuarios
    .from("usuarios")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar usuários:", error);
    alert("Erro ao carregar usuários.");
    return;
  }

  tbody.innerHTML = "";

  data.forEach((u) => {
    const criadoEm = u.criado_em
      ? new Date(u.criado_em).toLocaleString("pt-BR")
      : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.nome || ""}</td>
      <td>${u.email || ""}</td>
      <td>${criadoEm}</td>
      <td>
        <button class="btn-acao btn-editar" data-id="${u.id}">Editar</button>
        <button class="btn-acao btn-excluir" data-id="${u.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filtrarTabelaUsuarios() {
  const input = document.getElementById("busca");
  const filtro = (input.value || "").toLowerCase();
  const linhas = document.querySelectorAll("#tabelaUsuarios tbody tr");

  linhas.forEach((tr) => {
    const texto = tr.textContent.toLowerCase();
    tr.style.display = texto.includes(filtro) ? "" : "none";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const session = await usuariosEnsureAuth();
  if (!session) return;

  // Preencher nome do usuário logado
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
      await supabaseUsuarios.auth.signOut();
    } catch (e) {
      console.error("Erro ao sair:", e);
    } finally {
      localStorage.clear();
      window.location.href = "login.html";
    }
  });

  // ---------- Modal Novo Usuário ----------
  const modalNovo = document.getElementById("modalNovoUsuario");
  const btnNovo = document.getElementById("btnNovo");
  const btnFecharNovo = document.getElementById("fecharModal");
  const formNovo = document.getElementById("formNovoUsuario");

  btnNovo?.addEventListener("click", () => (modalNovo.style.display = "block"));
  btnFecharNovo?.addEventListener(
    "click",
    () => (modalNovo.style.display = "none")
  );

  formNovo?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("novoNome").value.trim();
    const email = document.getElementById("novoEmail").value.trim();
    const senha = document.getElementById("novoSenha").value.trim();

    if (!nome || !email || !senha) {
      alert("Preencha nome, e-mail e senha.");
      return;
    }

    try {
      // Cria o usuário no Auth também
      const { data, error } = await supabaseUsuarios.auth.signUp({
        email,
        password: senha,
      });

      if (error) {
        console.error("Erro ao criar usuário no Auth:", error);
        alert("Erro ao criar usuário no Auth: " + error.message);
        return;
      }

      const user = data.user;
      if (!user) {
        alert("Erro ao obter usuário criado no Auth.");
        return;
      }

      const { error: dbError } = await supabaseUsuarios.from("usuarios").insert([
        {
          auth_id: user.id,
          nome,
          email,
          tipo: "Usuario",
          senha,
        },
      ]);

      if (dbError) {
        console.error("Erro ao salvar na tabela usuarios:", dbError);
        alert(
          "Usuário criado no Auth, mas houve erro ao salvar na tabela: " +
          (dbError.message || "")
        );
        return;
      }

      alert("✅ Usuário criado com sucesso!");
      modalNovo.style.display = "none";
      formNovo.reset();
      carregarUsuarios();
    } catch (err) {
      console.error("Erro inesperado ao criar usuário:", err);
      alert("Erro inesperado ao criar usuário.");
    }
  });

  // ---------- Modal Editar Usuário ----------
  const modalEditar = document.getElementById("modalEditarUsuario");
  const btnFecharEditar = document.getElementById("fecharModalEditar");
  const btnCancelarEditar = document.getElementById("cancelarEditar");
  const formEditar = document.getElementById("formEditarUsuario");

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
    const tipo = document.getElementById("editarTipo").value;

    if (!id) {
      alert("ID do usuário não encontrado.");
      return;
    }

    const { error } = await supabaseUsuarios
      .from("usuarios")
      .update({ nome, tipo })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar usuário:", error);
      alert("Erro ao atualizar usuário.");
      return;
    }

    alert("✅ Usuário atualizado com sucesso!");
    modalEditar.style.display = "none";
    carregarUsuarios();
  });

  // Tabela - editar/excluir
  const tabela = document.getElementById("tabelaUsuarios");
  tabela?.addEventListener("click", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const id = target.getAttribute("data-id");
    if (!id) return;

    if (target.classList.contains("btn-excluir")) {
      if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

      const { error } = await supabaseUsuarios
        .from("usuarios")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir usuário:", error);
        alert("Erro ao excluir usuário.");
        return;
      }

      alert("Usuário excluído com sucesso.");
      carregarUsuarios();
    }

    if (target.classList.contains("btn-editar")) {
      const { data, error } = await supabaseUsuarios
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao carregar usuário:", error);
        alert("Erro ao carregar dados do usuário.");
        return;
      }

      document.getElementById("editarId").value = data.id;
      document.getElementById("editarNome").value = data.nome || "";
      // esses campos não existem na tabela; usamos só tipo
      document.getElementById("editarUsuario").value = data.nome || "";
      document.getElementById("editarEmail").value = data.email || "";
      document.getElementById("editarSenha").value = "";
      document.getElementById("editarTipo").value = data.tipo || "Usuario";

      modalEditar.style.display = "block";
    }
  });

  // Busca
  const inputBusca = document.getElementById("busca");
  inputBusca?.addEventListener("input", filtrarTabelaUsuarios);

  // Carrega lista inicial
  carregarUsuarios();
});
