// ==== CONFIGURAÇÃO SUPABASE ====
const SUPABASE_URL = "https://vdvzipjygqeamnuihsiu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnppcGp5Z3FlYW1udWloc2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjY1MTYsImV4cCI6MjA3ODAwMjUxNn0.8Hhyuwj62L43w0MSv6JMVVxFEBWUCAOlF06h5oXKWAs";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==== ELEMENTOS HTML ====
const btnNovo = document.getElementById("btnNovo");
const modalNovoUsuario = document.getElementById("modalNovoUsuario");
const fecharModal = document.getElementById("fecharModal");
const formNovoUsuario = document.getElementById("formNovoUsuario");

const modalEditarUsuario = document.getElementById("modalEditarUsuario");
const fecharModalEditar = document.getElementById("fecharModalEditar");
const formEditarUsuario = document.getElementById("formEditarUsuario");
const cancelarEditar = document.getElementById("cancelarEditar");

const tabelaUsuarios = document.getElementById("tabelaUsuarios").querySelector("tbody");
const campoBusca = document.getElementById("busca");

// ==== MOSTRAR E ESCONDER MODAL NOVO ====
btnNovo.addEventListener("click", () => {
  modalNovoUsuario.style.display = "block";
});

fecharModal.addEventListener("click", () => {
  modalNovoUsuario.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalNovoUsuario) modalNovoUsuario.style.display = "none";
  if (e.target === modalEditarUsuario) modalEditarUsuario.style.display = "none";
});

// ==== CADASTRAR NOVO USUÁRIO ====
formNovoUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("novoNome").value.trim();
  const email = document.getElementById("novoEmail").value.trim();
  const senha = document.getElementById("novoSenha").value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  const { error } = await supabase.from("usuarios").insert([{ nome, email, senha }]);

  if (error) {
    alert("Erro ao salvar: " + error.message);
    return;
  }

  alert("Usuário cadastrado com sucesso!");
  formNovoUsuario.reset();
  modalNovoUsuario.style.display = "none";
  carregarUsuarios();
});

// ==== CARREGAR LISTA DE USUÁRIOS ====
async function carregarUsuarios() {
  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    alert("Erro ao carregar usuários: " + error.message);
    return;
  }

  tabelaUsuarios.innerHTML = "";
  usuarios.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td>${new Date(u.criado_em || Date.now()).toLocaleDateString()}</td>
      <td>
        <button class="btn-editar" data-id="${u.id}">✏️</button>
        <button class="btn-excluir" data-id="${u.id}">🗑️</button>
      </td>
    `;
    tabelaUsuarios.appendChild(tr);
  });

  adicionarEventosBotoes();
}

// ==== FILTRAR USUÁRIOS ====
campoBusca.addEventListener("input", () => {
  const termo = campoBusca.value.toLowerCase();
  const linhas = tabelaUsuarios.querySelectorAll("tr");
  linhas.forEach((linha) => {
    const nome = linha.children[1].textContent.toLowerCase();
    linha.style.display = nome.includes(termo) ? "" : "none";
  });
});

// ==== ADICIONAR EVENTOS NOS BOTÕES ====
function adicionarEventosBotoes() {
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const { data, error } = await supabase.from("usuarios").select("*").eq("id", id).single();
      if (error) {
        alert("Erro ao carregar usuário: " + error.message);
        return;
      }

      document.getElementById("editarId").value = data.id;
      document.getElementById("editarNome").value = data.nome;
      document.getElementById("editarUsuario").value = data.nome; // opcional
      document.getElementById("editarEmail").value = data.email;
      document.getElementById("editarSenha").value = "";
      document.getElementById("editarTipo").value = data.tipo || "Usuário";

      modalEditarUsuario.style.display = "block";
    });
  });

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Deseja realmente excluir este usuário?")) return;

      const { error } = await supabase.from("usuarios").delete().eq("id", id);
      if (error) {
        alert("Erro ao excluir: " + error.message);
        return;
      }

      alert("Usuário excluído!");
      carregarUsuarios();
    });
  });
}

// ==== SALVAR EDIÇÃO DE USUÁRIO ====
formEditarUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editarId").value;
  const nome = document.getElementById("editarNome").value.trim();
  const email = document.getElementById("editarEmail").value.trim();
  const senha = document.getElementById("editarSenha").value.trim();
  const tipo = document.getElementById("editarTipo").value;

  const dadosAtualizados = { nome, email, tipo };
  if (senha) dadosAtualizados.senha = senha;

  const { error } = await supabase.from("usuarios").update(dadosAtualizados).eq("id", id);
  if (error) {
    alert("Erro ao atualizar: " + error.message);
    return;
  }

  alert("Usuário atualizado!");
  modalEditarUsuario.style.display = "none";
  carregarUsuarios();
});

// ==== CANCELAR EDIÇÃO ====
cancelarEditar.addEventListener("click", () => {
  modalEditarUsuario.style.display = "none";
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

// ==== INICIALIZAR ====
carregarUsuarios();
