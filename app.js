// Passo 9: trocar pela URL do Render depois do deploy (sem barra no final)
   const API_BASE = "https://crud-livros-api.onrender.com";
const API_URL = `${API_BASE}/livros`;

const formulario = document.querySelector("#form-livro");
const campoId = document.querySelector("#livro-id");
const campoTitulo = document.querySelector("#titulo");
const campoAutor = document.querySelector("#autor");
const campoGenero = document.querySelector("#genero");
const campoAno = document.querySelector("#ano");
const campoLido = document.querySelector("#lido");
const tituloFormulario = document.querySelector("#titulo-formulario");
const botaoSalvar = document.querySelector("#botao-salvar");
const botaoCancelar = document.querySelector("#botao-cancelar");
const listaLivros = document.querySelector("#lista-livros");
const mensagem = document.querySelector("#mensagem");
const formularioBusca = document.querySelector("#form-busca");
const campoBuscaId = document.querySelector("#busca-id");

async function fazerRequisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.mensagem || "Não foi possível concluir a operação");
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
}

function criarCartaoLivro(livro) {
  const cartao = document.createElement("article");
  cartao.className = "livro";

  const titulo = document.createElement("h3");
  titulo.textContent = livro.titulo;

  const autor = document.createElement("p");
  autor.textContent = `Autor: ${livro.autor}`;

  const genero = document.createElement("p");
  genero.textContent = `Gênero: ${livro.genero || "Não informado"}`;

  const ano = document.createElement("p");
  ano.textContent = `Ano: ${livro.anoPublicacao ?? "Não informado"}`;

  const lido = document.createElement("p");
  lido.textContent = `Status: ${livro.lido ? "Já lido" : "Ainda não lido"}`;

  const id = document.createElement("p");
  id.textContent = `ID: ${livro._id}`;

  const acoes = document.createElement("div");
  acoes.className = "acoes-livro";

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.textContent = "Editar";
  botaoEditar.addEventListener("click", () => carregarLivroParaEdicao(livro._id));

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "perigo";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", () => excluirLivro(livro._id));

  acoes.append(botaoEditar, botaoExcluir);
  cartao.append(titulo, autor, genero, ano, lido, id, acoes);

  return cartao;
}

function exibirLivros(livros) {
  listaLivros.innerHTML = "";

  if (livros.length === 0) {
    mostrarMensagem("Nenhum livro cadastrado");
    return;
  }

  livros.forEach((livro) => {
    listaLivros.appendChild(criarCartaoLivro(livro));
  });

  mostrarMensagem(`${livros.length} livro(s) encontrado(s)`);
}

async function listarLivros() {
  try {
    mostrarMensagem("Carregando livros...");
    const livros = await fazerRequisicao(API_URL);
    exibirLivros(livros);
  } catch (erro) {
    listaLivros.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
}

async function buscarLivroPorId(id) {
  const livro = await fazerRequisicao(`${API_URL}/${id}`);
  exibirLivros([livro]);
  return livro;
}

async function salvarLivro(evento) {
  evento.preventDefault();

  const livro = {
    titulo: campoTitulo.value.trim(),
    autor: campoAutor.value.trim(),
    genero: campoGenero.value.trim(),
    lido: campoLido.checked
  };

  if (campoAno.value !== "") {
    livro.anoPublicacao = Number(campoAno.value);
  }

  const id = campoId.value;
  const estaEditando = Boolean(id);
  const url = estaEditando ? `${API_URL}/${id}` : API_URL;
  const metodo = estaEditando ? "PUT" : "POST";

  try {
    await fazerRequisicao(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(livro)
    });

    limparFormulario();
    mostrarMensagem(estaEditando ? "Livro atualizado" : "Livro cadastrado");
    await listarLivros();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function carregarLivroParaEdicao(id) {
  try {
    const livro = await fazerRequisicao(`${API_URL}/${id}`);

    campoId.value = livro._id;
    campoTitulo.value = livro.titulo;
    campoAutor.value = livro.autor;
    campoGenero.value = livro.genero ?? "";
    campoAno.value = livro.anoPublicacao ?? "";
    campoLido.checked = Boolean(livro.lido);
    tituloFormulario.textContent = "Editar livro";
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.classList.remove("oculto");
    campoTitulo.focus();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function excluirLivro(id) {
  const confirmou = window.confirm("Deseja excluir este livro?");

  if (!confirmou) {
    return;
  }

  try {
    await fazerRequisicao(`${API_URL}/${id}`, { method: "DELETE" });
    limparFormulario();
    mostrarMensagem("Livro excluído");
    await listarLivros();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

function limparFormulario() {
  formulario.reset();
  campoId.value = "";
  tituloFormulario.textContent = "Novo livro";
  botaoSalvar.textContent = "Cadastrar";
  botaoCancelar.classList.add("oculto");
}

formulario.addEventListener("submit", salvarLivro);
botaoCancelar.addEventListener("click", limparFormulario);
document.querySelector("#botao-atualizar").addEventListener("click", listarLivros);
document.querySelector("#botao-limpar-busca").addEventListener("click", () => {
  campoBuscaId.value = "";
  listarLivros();
});

formularioBusca.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const id = campoBuscaId.value.trim();

  if (!id) {
    mostrarMensagem("Informe um ID para realizar a busca", true);
    return;
  }

  try {
    await buscarLivroPorId(id);
  } catch (erro) {
    listaLivros.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

listarLivros();
