// 1. Seleção dos elementos do HTML
const campoBusca = document.getElementById("campoBusca");
const btnBusca = document.getElementById("btnBusca");
const btnMesAnterior = document.getElementById("btnMesAnterior");
const btnMesProximo = document.getElementById("btnMesProximo");
const mesAnoTitulo = document.getElementById("mesAnoTitulo");
const gridDias = document.getElementById("gridDias");
const campoDataTarefa = document.getElementById("campoDataTarefa");
const elementoDataHora = document.getElementById("dataHora");
const botoesFiltro = document.querySelectorAll(".btn-filtro");
const contadorTarefas = document.getElementById("contadorTarefas");
const campoTarefa = document.getElementById("campoTarefa");
const btnAdicionar = document.getElementById("btnAdicionar");
const listaTarefas = document.getElementById("listaTarefas");

// Variável para controlar qual mês está sendo exibido no mini-calendário
let dataAtualCalendario = new Date();

// Limpa a lista ao iniciar
listaTarefas.innerHTML = "";

// Função para salvar no LocalStorage
function salvarTarefas() {
  const tarefas = [];
  const itens = listaTarefas.querySelectorAll("li");

  itens.forEach(function (item) {
    const textoSpan = item.querySelector("span");
    const spanCompleto = textoSpan.textContent;

    // Remove a data formatada e o emoji para salvar apenas o texto puro da tarefa
    const textoPuro = spanCompleto.split(" 📅")[0].trim();

    const concluida = item.classList.contains("concluida");
    const data = item.dataset.data || "";
    tarefas.push({ texto: textoPuro, concluida: concluida, data: data });
  });

  localStorage.setItem("tarefasMinhaLista", JSON.stringify(tarefas));
}

// Função para atualizar o contador de tarefas pendentes
function atualizarContador() {
  const tarefasPendentes = listaTarefas.querySelectorAll("li:not(.concluida)");
  const quantidade = tarefasPendentes.length;

  if (quantidade === 0) {
    contadorTarefas.textContent = "Nenhuma tarefa pendente 👌";
  } else if (quantidade === 1) {
    contadorTarefas.textContent = "1 tarefa pendente";
  } else {
    contadorTarefas.textContent = `${quantidade} tarefas pendentes`;
  }
}

// Função para atualizar a barra de progresso de produtividade
function atualizarProgresso() {
  const totalTarefas = listaTarefas.querySelectorAll("li").length;
  const tarefasConcluidas =
    listaTarefas.querySelectorAll("li.concluida").length;

  const textoProgresso = document.getElementById("textoProgresso");
  const contadorConcluidas = document.getElementById("contadorConcluidas");
  const barraPreenchida = document.getElementById("barraPreenchida");

  if (!textoProgresso) return;

  if (totalTarefas === 0) {
    textoProgresso.textContent = "0% concluído";
    contadorConcluidas.textContent = "0 de 0";
    barraPreenchida.style.width = "0%";
    return;
  }

  const porcentagem = Math.round((tarefasConcluidas / totalTarefas) * 100);

  textoProgresso.textContent = `${porcentagem}% concluído`;
  contadorConcluidas.textContent = `${tarefasConcluidas} de ${totalTarefas}`;
  barraPreenchida.style.width = `${porcentagem}%`;
}

// Função para renderizar o Mini Calendário com suporte à navegação de meses
function renderizarCalendario() {
  gridDias.innerHTML = "";

  const ano = dataAtualCalendario.getFullYear();
  const mes = dataAtualCalendario.getMonth();

  // Nome do mês e ano atualizado conforme a navegação
  const nomeMes = dataAtualCalendario.toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  mesAnoTitulo.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDiaMes = new Date(ano, mes + 1, 0).getDate();

  for (let i = 0; i < primeiroDiaSemana; i++) {
    const vazios = document.createElement("span");
    gridDias.appendChild(vazios);
  }

  const datasComTarefas = [];
  const itens = listaTarefas.querySelectorAll("li:not(.concluida)");

  itens.forEach(function (item) {
    if (item.dataset.data) {
      datasComTarefas.push(item.dataset.data);
    }
  });

  const hojeReal = new Date();

  for (let dia = 1; dia <= totalDiaMes; dia++) {
    const spanDia = document.createElement("span");
    spanDia.textContent = dia;

    const mesFormatado = String(mes + 1).padStart(2, "0");
    const diaFormatado = String(dia).padStart(2, "0");
    const dataString = `${ano}-${mesFormatado}-${diaFormatado}`;

    // Destaca o dia de hoje apenas se estivermos visualizando o mês e ano reais
    if (
      dia === hojeReal.getDate() &&
      mes === hojeReal.getMonth() &&
      ano === hojeReal.getFullYear()
    ) {
      spanDia.style.border = "1px solid white";
    }

    if (datasComTarefas.includes(dataString)) {
      spanDia.classList.add("tem-tarefa");
    }

    spanDia.addEventListener("click", function () {
      const todosOsDias = gridDias.querySelectorAll("span");
      todosOsDias.forEach((s) => s.classList.remove("dia-selecionado"));
      spanDia.classList.add("dia-selecionado");

      const itens = listaTarefas.querySelectorAll("li");
      itens.forEach(function (item) {
        if (item.dataset.data === dataString) {
          item.style.display = "flex";

          item.classList.add("tarefa-destacada");
          setTimeout(() => {
            item.classList.remove("tarefa-destacada");
          }, 2000);
        } else {
          item.style.display = "none";
        }
      });
    });

    gridDias.appendChild(spanDia);
  }
}

// Função para filtrar as tarefas
function filtrarTarefas(tipo) {
  const items = listaTarefas.querySelectorAll("li");

  items.forEach(function (item) {
    const concluida = item.classList.contains("concluida");

    if (tipo === "todas") {
      item.style.display = "flex";
    } else if (tipo === "pendentes") {
      if (concluida) {
        item.style.display = "none";
      } else {
        item.style.display = "flex";
      }
    } else if (tipo === "concluidas") {
      if (concluida) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    }
  });
}

// 2. Função para criar e adicionar uma tarefa
function adicionarTarefa(
  textoParam = null,
  dataParam = null,
  concluidaParam = false,
) {
  const textoTarefa =
    textoParam !== null ? textoParam : campoTarefa.value.trim();
  const dataTarefa = dataParam !== null ? dataParam : campoDataTarefa.value;

  if (textoTarefa === "") {
    alert("Por Favor, digite uma tarefa!");
    return;
  }

  const novoItem = document.createElement("li");
  if (dataTarefa) {
    novoItem.dataset.data = dataTarefa;
  }

  const textoSpan = document.createElement("span");

  // Correção da data de hoje para comparação exata (YYYY-MM-DD)
  const hojeObj = new Date();
  const anoH = hojeObj.getFullYear();
  const mesH = String(hojeObj.getMonth() + 1).padStart(2, "0");
  const diaH = String(hojeObj.getDate()).padStart(2, "0");
  const dataHojeString = `${anoH}-${mesH}-${diaH}`;

  if (dataTarefa) {
    const partes = dataTarefa.split("-");
    const dataFormadataBr = `${partes[2]}/${partes[1]}`;

    if (dataTarefa === dataHojeString) {
      novoItem.classList.add("tarefa-hoje");
      textoSpan.textContent = `${textoTarefa} 📅 (${dataFormadataBr}) 🔥 Vence Hoje!`;
    } else {
      textoSpan.textContent = `${textoTarefa} 📅 (${dataFormadataBr})`;
    }
  } else {
    textoSpan.textContent = textoTarefa;
  }

  if (concluidaParam) {
    novoItem.classList.add("concluida");
  }

  const btnRemover = document.createElement("button");
  btnRemover.textContent = "X";
  btnRemover.className = "btn-remover";

  // EVENTO: Marcar / desmarcar como concluída
  textoSpan.addEventListener("click", function () {
    novoItem.classList.toggle("concluida");
    salvarTarefas();
    atualizarContador();
    atualizarProgresso();
    renderizarCalendario();
  });

  // EVENTO: Remover tarefa
  btnRemover.addEventListener("click", function (event) {
    event.stopPropagation();
    novoItem.remove();
    salvarTarefas();
    atualizarContador();
    atualizarProgresso();
    renderizarCalendario();
  });

  novoItem.appendChild(textoSpan);
  novoItem.appendChild(btnRemover);
  listaTarefas.appendChild(novoItem);

  // Salva, atualiza contador, progresso e redesenha o calendário
  salvarTarefas();
  atualizarContador();
  atualizarProgresso();
  renderizarCalendario();

  if (textoParam === null) {
    campoTarefa.value = "";
    campoDataTarefa.value = "";
    campoTarefa.focus();
  }
}

// Função para carregar as tarefas salvas ao abrir a página
function carregarTarefas() {
  listaTarefas.innerHTML = "";
  const tarefasSalvas = localStorage.getItem("tarefasMinhaLista");

  if (tarefasSalvas) {
    const listaDeTarefas = JSON.parse(tarefasSalvas);

    listaDeTarefas.forEach(function (tarefa) {
      adicionarTarefa(tarefa.texto, tarefa.data, tarefa.concluida);
    });
  }

  atualizarContador();
  atualizarProgresso();
  renderizarCalendario();
}

// Execução ao abrir a página
carregarTarefas();
renderizarCalendario();

// Escutadores de eventos principais
btnAdicionar.addEventListener("click", function () {
  adicionarTarefa();
});

campoTarefa.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    adicionarTarefa();
  }
});

// Eventos de clique para navegar entre os meses no calendário
btnMesAnterior.addEventListener("click", function () {
  dataAtualCalendario.setMonth(dataAtualCalendario.getMonth() - 1);
  renderizarCalendario();
});

btnMesProximo.addEventListener("click", function () {
  dataAtualCalendario.setMonth(dataAtualCalendario.getMonth() + 1);
  renderizarCalendario();
});

// Escutadores para os botões de filtro
botoesFiltro.forEach(function (botao) {
  botao.addEventListener("click", function (e) {
    botoesFiltro.forEach(function (btn) {
      btn.classList.remove("ativo");
    });

    e.target.classList.add("ativo");
    const tipoFiltro = e.target.getAttribute("data-filtro");
    filtrarTarefas(tipoFiltro);
  });
});

// Relógio e Data no topo
function atualizarDataHora() {
  const agora = new Date();
  const opcoes = { weekday: "long", day: "numeric", month: "long" };
  const dataFormadata = agora.toLocaleDateString("pt-BR", opcoes);
  const horaFormadata = agora.toLocaleTimeString("pt-BR");

  elementoDataHora.textContent = `${dataFormadata} — ${horaFormadata}`;
}

atualizarDataHora();
setInterval(atualizarDataHora, 1000);

// Seleção do botão de tema flutuante
const btnTema = document.getElementById("btnTema");

// Função para alternar entre Modo Escuro e Modo Claro
function alternarTema() {
  document.body.classList.toggle("modo-claro");

  const ehModoClaro = document.body.classList.contains("modo-claro");
  btnTema.textContent = ehModoClaro ? "☀️" : "🌙";

  // Salva a preferência no LocalStorage
  localStorage.setItem("temaPreferido", ehModoClaro ? "claro" : "escuro");
}

// Carrega o tema salvo ao abrir a página
function carregarTemaSalvo() {
  const temaSalvo = localStorage.getItem("temaPreferido");
  if (temaSalvo === "claro") {
    document.body.classList.add("modo-claro");
    if (btnTema) btnTema.textContent = "☀️";
  }
}

// Evento de clique no botão do tema
if (btnTema) {
  btnTema.addEventListener("click", alternarTema);
}

// Executa ao carregar a página
carregarTemaSalvo();

// Função para executar a busca
function executarBusca() {
  if (!campoBusca) return;
  const termoBusca = campoBusca.value.toLowerCase().trim();
  const itens = listaTarefas.querySelectorAll("li");

  itens.forEach(function (item) {
    const textoSpan = item.querySelector("span");
    const textoTarefa = textoSpan.textContent.toLowerCase();

    if (textoTarefa.includes(termoBusca)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

// Evento de clique no botão Buscar
if (btnBusca) {
  btnBusca.addEventListener("click", executarBusca);
}

// Permitir buscar apertando Enter no campo de busca
if (campoBusca) {
  campoBusca.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      executarBusca();
    }
  });
}