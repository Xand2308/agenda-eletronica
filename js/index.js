// 1. Seleção dos elementos do HTML
const btnExportar = document.getElementById("btnExportar");
const inputImportar = document.getElementById("inputImportar");
const campoCategoria = document.getElementById("campoCategoria");
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
const campoPrioridade = document.getElementById("campoPrioridade");
const btnAdicionar = document.getElementById("btnAdicionar");
const listaTarefas = document.getElementById("listaTarefas");
if (btnExportar) {
  btnExportar.addEventListener("click", () => {
    // Usando a chave correta encontrada no seu localStorage: "tarefasMinhaLista"
    const tarefasSalvas = localStorage.getItem("tarefasMinhaLista");
    if (!tarefasSalvas || JSON.parse(tarefasSalvas).length === 0) {
      alert("Não há tarefas para exportar!");
      return;
    }

    const blob = new Blob([tarefasSalvas], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agenda-eletronica-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// 2. IMPORTAR DADOS (Carregar JSON)
if (inputImportar) {
  inputImportar.addEventListener("change", (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = () => {
      let dadosImportados;

      try {
        const conteudo = String(reader.result || "").replace(/^\uFEFF/, "");
        dadosImportados = JSON.parse(conteudo);
      } catch (error) {
        console.error("Falha ao interpretar o arquivo de backup:", error);
        alert("Erro ao ler o arquivo JSON.");
        inputImportar.value = "";
        return;
      }

      if (
        !Array.isArray(dadosImportados) ||
        dadosImportados.some(
          (tarefa) =>
            !tarefa ||
            typeof tarefa !== "object" ||
            typeof tarefa.texto !== "string",
        )
      ) {
        alert("O arquivo selecionado não é um backup válido.");
        inputImportar.value = "";
        return;
      }

      try {
        localStorage.setItem(
          "tarefasMinhaLista",
          JSON.stringify(dadosImportados),
        );
        carregarTarefas();
        alert("Dados importados com sucesso!");
      } catch (error) {
        console.error("Falha ao importar o backup:", error);
        alert("Não foi possível importar os dados para a agenda.");
      } finally {
        inputImportar.value = "";
      }
    };

    reader.onerror = () => {
      console.error("Falha ao ler o arquivo de backup:", reader.error);
      alert("Não foi possível ler o arquivo selecionado.");
      inputImportar.value = "";
    };

    reader.readAsText(arquivo);
  });
}
// Variável para controlar qual mês está sendo exibido no mini-calendário
let dataAtualCalendario = new Date();

// Limpa a lista ao iniciar
listaTarefas.innerHTML = "";

// Função para salvar no LocalStorage
function salvarTarefas() {
  const tarefas = [];
  const itens = listaTarefas.querySelectorAll("li");

  itens.forEach(function (item) {
    const textoNome = item.querySelector(".texto-tarefa");
    const textoSpan = item.querySelector("span");

    const spanCompleto = textoNome
      ? textoNome.textContent
      : textoSpan
        ? textoSpan.textContent
        : "";

    const categoria = item.dataset.categoria || "pessoal";
    const textoPuro = limparTextoTarefa(spanCompleto, categoria);
    const concluida = item.classList.contains("concluida");
    const data = item.dataset.data || "";
    const prioridade = item.dataset.prioridade || "media";

    tarefas.push({
      texto: textoPuro,
      concluida: concluida,
      data: data,
      categoria: categoria,
      prioridade: prioridade,
    });
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

    // Destaca o dia de hoje apenas no mês e ano reais
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
      item.style.display = concluida ? "none" : "flex";
    } else if (tipo === "concluidas") {
      item.style.display = concluida ? "flex" : "none";
    }
  });
}

const NOMES_CATEGORIAS = {
  pessoal: "Pessoal",
  trabalho: "Trabalho",
  estudos: "Estudos",
  urgente: "Urgente",
};

const PESOS_PRIORIDADE = {
  alta: 3,
  media: 2,
  baixa: 1,
};

function ordenarListaDOM() {
  const itens = Array.from(listaTarefas.querySelectorAll("li"));
  itens.sort((a, b) => {
    const pesoA =
      PESOS_PRIORIDADE[a.dataset.prioridade] || PESOS_PRIORIDADE.media;
    const pesoB =
      PESOS_PRIORIDADE[b.dataset.prioridade] || PESOS_PRIORIDADE.media;
    return pesoB - pesoA;
  });
  itens.forEach((item) => listaTarefas.appendChild(item));
}

function limparTextoTarefa(texto, categoria) {
  let limpo = (texto || "").split(" 📅")[0].trim();
  const nome = NOMES_CATEGORIAS[categoria];

  if (nome) {
    const sufixo = new RegExp("\\s*" + nome + "\\s*$", "i");

    while (sufixo.test(limpo)) {
      limpo = limpo.replace(sufixo, "").trim();
    }
  }

  return limpo;
}

// 2. Função para criar e adicionar uma tarefa
function adicionarTarefa(
  textoParam = null,
  dataParam = null,
  concluidaParam = false,
  categoriaParam = null,
  skipSave = false,
  prioridadeParam = null,
) {
  const textoDigitado =
    textoParam !== null ? textoParam : campoTarefa.value.trim();

  const dataTarefa = dataParam !== null ? dataParam : campoDataTarefa.value;

  const categoriaTarefa =
    categoriaParam !== null ? categoriaParam : campoCategoria.value;

  const prioridadeTarefa =
    prioridadeParam !== null ? prioridadeParam : campoPrioridade.value;

  const textoTarefa = limparTextoTarefa(textoDigitado, categoriaTarefa);

  if (textoTarefa === "") {
    alert("Por Favor, digite uma tarefa!");
    return;
  }

  const novoItem = document.createElement("li");

  if (dataTarefa) {
    novoItem.dataset.data = dataTarefa;
  }

  novoItem.dataset.categoria = categoriaTarefa;
  novoItem.dataset.prioridade = prioridadeTarefa;

  const textoSpan = document.createElement("span");
  const textoNome = document.createElement("span");
  textoNome.className = "texto-tarefa";

  const spanTag = document.createElement("span");
  spanTag.className = `tag-categoria tag-${categoriaTarefa}`;
  spanTag.textContent = NOMES_CATEGORIAS[categoriaTarefa] || "Pessoal";

  const spanPrioridade = document.createElement("span");
  spanPrioridade.className = `tag-prioridade prioridade-${prioridadeTarefa}`;
  spanPrioridade.textContent =
    prioridadeTarefa.charAt(0).toUpperCase() + prioridadeTarefa.slice(1);

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
      textoNome.textContent = `${textoTarefa} 📅 (${dataFormadataBr}) 🔥 Vence Hoje!`;
    } else {
      textoNome.textContent = `${textoTarefa} 📅 (${dataFormadataBr})`;
    }
  } else {
    textoNome.textContent = textoTarefa;
  }

  textoSpan.appendChild(textoNome);
  textoSpan.appendChild(spanTag);
  textoSpan.appendChild(spanPrioridade);

  if (concluidaParam) {
    novoItem.classList.add("concluida");
  }

  const btnRemover = document.createElement("button");
  btnRemover.textContent = "X";
  btnRemover.className = "btn-remover";

  // EVENTO: Marcar / desmarcar como concluída
  textoSpan.addEventListener("click", function () {
    novoItem.classList.toggle("concluida");

    if (novoItem.classList.contains("concluida")) {
      tocarSomConclusao();
      dispararConfetes();
    }

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
  ordenarListaDOM();

  if (!skipSave) {
    salvarTarefas();
  }

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
      adicionarTarefa(
        tarefa.texto,
        tarefa.data,
        tarefa.concluida,
        tarefa.categoria,
        true,
        tarefa.prioridade || "media",
      );
    });

    salvarTarefas();
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
  const opcoes = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };

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

function tocarSomConclusao() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  const audioCtx = new AudioContextClass();
  const oscilador = audioCtx.createOscillator();
  const ganho = audioCtx.createGain();

  oscilador.type = "sine";

  // Frequência inicial (Nota Dó - 523.25Hz) e rampa até a nota Lá (880Hz)
  oscilador.frequency.setValueAtTime(523.25, audioCtx.currentTime);
  oscilador.frequency.exponentialRampToValueAtTime(
    880,
    audioCtx.currentTime + 0.15,
  );

  // Controle de volume (começa em 0.1 e faz fade out até 0.01)
  ganho.gain.setValueAtTime(0.1, audioCtx.currentTime);
  ganho.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  // Conecta o oscilador ao ganho e o ganho aos alto-falantes
  oscilador.connect(ganho);
  ganho.connect(audioCtx.destination);

  // Inicia e para o som
  oscilador.start();
  oscilador.stop(audioCtx.currentTime + 0.15);
}

function dispararConfetes() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
  }
}
