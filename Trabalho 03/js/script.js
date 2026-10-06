const THEMES = [
  {
    name: "Loja",
    tableName: "produtos",
    column1: "nome",
    column2: "preco",
    dataType: "DECIMAL(10,2)",
    rows: [
      ["Camiseta", "49.90"],
      ["Tênis", "199.90"],
      ["Boné", "29.90"]
    ]
  },
  {
    name: "Escola",
    tableName: "alunos",
    column1: "nome",
    column2: "email",
    dataType: "VARCHAR(100)",
    rows: [
      ["Ana", "ana@escola.com"],
      ["Bruno", "bruno@escola.com"],
      ["Carla", "carla@escola.com"]
    ]
  },
  {
    name: "Games",
    tableName: "jogadores",
    column1: "nickname",
    column2: "nivel",
    dataType: "INT",
    rows: [
      ["Shadow", "12"],
      ["Pixel", "27"],
      ["Nova", "5"]
    ]
  },
  {
    name: "Hospital",
    tableName: "pacientes",
    column1: "nome",
    column2: "telefone",
    dataType: "VARCHAR(15)",
    rows: [
      ["Marta", "11 90000-0001"],
      ["João", "11 90000-0002"],
      ["Lia", "11 90000-0003"]
    ]
  }
];

const MISSIONS = [
  {
    title: "Criar a tabela",
    getDescription: (theme) => `Crie a tabela ${theme.tableName} com um id e o campo ${theme.column1}.`,
    template: (theme) => `[[CREATE]] [[TABLE]] ${theme.tableName} (\n  id INT [[PRIMARY KEY]],\n  ${theme.column1} VARCHAR(100) NOT [[NULL]]\n);`,
    hints: [
      "Qual comando cria estruturas novas?",
      "O que estamos criando? Em inglês, a palavra para tabela.",
      "A chave que identifica cada registro de forma única (duas palavras).",
      "NOT ___: o campo é obrigatório, não pode ficar vazio. Palavra em inglês para vazio."
    ],
    explanation: "CREATE cria uma estrutura nova."
  },
  {
    title: "Adicionar uma coluna",
    getDescription: (theme) => `A tabela já existe. Adicione a coluna ${theme.column2}.`,
    template: (theme) => `[[ALTER]] TABLE ${theme.tableName}\n  [[ADD]] ${theme.column2} ${theme.dataType};`,
    hints: [
      "Qual comando modifica uma estrutura que já existe?",
      "Acrescenta uma coluna nova. Em inglês, adicionar."
    ],
    explanation: "ALTER modifica a estrutura, e ADD acrescenta a coluna."
  },
  {
    title: "Esvaziar a tabela",
    getDescription: () => "Apague todos os registros, mas mantenha a tabela para novos cadastros.",
    template: (theme) => `[[TRUNCATE]] TABLE ${theme.tableName};`,
    hints: ["Esvazia a tabela, mas a estrutura continua. Começa com T."],
    explanation: "TRUNCATE limpa os registros e mantém a estrutura."
  },
  {
    title: "Excluir uma coluna",
    getDescription: (theme) => `A coluna ${theme.column2} não é mais necessária. Remova só ela.`,
    template: (theme) => `ALTER TABLE ${theme.tableName}\n  [[DROP]] [[COLUMN]] ${theme.column2};`,
    hints: [
      "Qual comando remove estruturas?",
      "O que estamos removendo? Em inglês, a palavra para coluna."
    ],
    explanation: "ALTER com DROP COLUMN remove só a coluna."
  },
  {
    title: "Excluir a tabela",
    getDescription: () => "O projeto terminou. Remova a tabela inteira.",
    template: (theme) => `[[DROP]] TABLE ${theme.tableName};`,
    hints: ["Qual comando remove a estrutura inteira, sem volta?"],
    explanation: "DROP remove a tabela inteira, estrutura e dados."
  }
];

// Cores da roleta: [cor da fatia, cor do texto]
const WHEEL_COLORS = [
  ["#1B1B1B", "#8DD3F0"],
  ["#8DD3F0", "#050505"],
  ["#2C2C2C", "#F07167"],
  ["#F07167", "#050505"]
];

let currentTheme = null;
let currentStep = 0;
let isSpinning = false;
let currentRotation = 0;

let dbState = {
  exists: false,
  hasColumn2: false,
  rows: []
};

// Verifica se o usuário pediu para reduzir animações no sistema
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Funções auxiliares
const $ = (id) => document.getElementById(id);
const normalizeString = (str) => str.trim().toUpperCase().replace(/\s+/g, " ");

function renderDatabaseView() {
  const container = $("dbv");
  if (!container) return;

  if (!dbState.exists) {
    const text = currentStep >= 5
      ? `A tabela ${currentTheme.tableName} foi removida.`
      : "Nenhuma tabela criada ainda.";
    container.innerHTML = `<p class="n">${text}</p>`;
    return;
  }

  let tableHtml = `
    <table>
      <caption class="mono" style="text-align:left; padding-bottom:4px">${currentTheme.tableName}</caption>
      <tr>
        <th>id</th>
        <th>${currentTheme.column1}</th>
        ${dbState.hasColumn2 ? `<th>${currentTheme.column2}</th>` : ""}
      </tr>
  `;

  dbState.rows.forEach((row, index) => {
    tableHtml += `
      <tr>
        <td>${index + 1}</td>
        <td>${row[0]}</td>
        ${dbState.hasColumn2 ? `<td>${row[1]}</td>` : ""}
      </tr>
    `;
  });

  tableHtml += `</table><p class="n">${dbState.rows.length} registros</p>`;
  container.innerHTML = tableHtml;
}

function buildMissionsUI() {
  const box = $("missions");
  if (!box) return;
  box.innerHTML = "";

  MISSIONS.forEach((mission, index) => {
    const section = document.createElement("section");
    section.className = `m ${index === 0 ? "on" : ""}`;
    section.id = `m${index}`;

    const parts = mission.template(currentTheme).split(/\[\[(.+?)\]\]/);
    let codeHtml = "";

    parts.forEach((part, partIndex) => {
      // Índices ímpares são as lacunas interativas ([[termo]])
      if (partIndex % 2 !== 0) {
        codeHtml += `<input data-answer="${part}" size="${part.length + 2}" aria-label="lacuna" autocomplete="off" spellcheck="false" ${index ? "disabled" : ""}>`;
      } else {
        codeHtml += part.replace(/</g, "&lt;");
      }
    });

    section.innerHTML = `
      <h3>Missão ${index + 1}: ${mission.title}</h3>
      <p>${mission.getDescription(currentTheme)}</p>
      <pre class="code">${codeHtml}</pre>
      <div class="row">
        <button data-check="${index}" ${index ? "disabled" : ""}>Verificar</button>
        <button class="ghost" data-hint="${index}" ${index ? "disabled" : ""}>Dica</button>
      </div>
      <div class="fb" aria-live="polite"></div>
    `;

    box.appendChild(section);
  });
}

function drawWheel() {
  const wheelElement = $("wheel");
  if (!wheelElement) return;

  let svgContent = "";
  THEMES.forEach((theme, i) => {
    const startAngle = (i * Math.PI) / 2;
    const endAngle = ((i + 1) * Math.PI) / 2;

    const x1 = 150 + 140 * Math.sin(startAngle);
    const y1 = 150 - 140 * Math.cos(startAngle);
    const x2 = 150 + 140 * Math.sin(endAngle);
    const y2 = 150 - 140 * Math.cos(endAngle);

    svgContent += `
      <path d="M150 150L${x1} ${y1}A140 140 0 0 1 ${x2} ${y2}Z" fill="${WHEEL_COLORS[i][0]}" stroke="#050505" stroke-width="3"/>
      <text transform="rotate(${i * 90 + 45} 150 150)" x="150" y="68" text-anchor="middle" font-size="24" font-weight="800" fill="${WHEEL_COLORS[i][1]}">
        ${theme.name}
      </text>
    `;
  });

  svgContent += `<circle cx="150" cy="150" r="14" fill="#050505" stroke="#8DD3F0" stroke-width="4"/>`;
  wheelElement.innerHTML = svgContent;
}

function startGame() {
  currentStep = 0;
  dbState = { exists: false, hasColumn2: false, rows: [] };

  buildMissionsUI();
  renderDatabaseView();

  $("end").hidden = true;
  $("game").style.display = "block";

  setTimeout(() => {
    $("game").scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, 60);
}

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;

  const drawButton = $("btnDraw");
  const slotText = $("slot");

  drawButton.disabled = true;
  slotText.textContent = "Girando...";

  const themeIndex = Math.floor(Math.random() * THEMES.length);
  const jitter = Math.random() * 50 - 25;

  currentRotation = (Math.floor(currentRotation / 360) + 4) * 360 + (360 - (themeIndex * 90 + 45) + jitter);

  const wheel = $("wheel");
  const durationSec = prefersReducedMotion ? 2.2 : 4.2;

  wheel.style.transition = `transform ${durationSec}s cubic-bezier(.12,.7,.1,1)`;
  void wheel.offsetWidth; // Força o navegador a registrar a posição inicial
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    currentTheme = THEMES[themeIndex];
    slotText.textContent = `Tema: ${currentTheme.name}`;
    drawButton.disabled = false;
    drawButton.textContent = "Girar de novo";
    isSpinning = false;
    startGame();
  }, (durationSec + 0.2) * 1000);
}

function handleHint(missionIndex) {
  const missionSection = $(`m${missionIndex}`);
  const feedback = missionSection.querySelector(".fb");
  const inputs = missionSection.querySelectorAll("input");

  let firstWrongIndex = -1;
  inputs.forEach((input, i) => {
    if (firstWrongIndex < 0 && normalizeString(input.value) !== normalizeString(input.getAttribute("data-answer"))) {
      firstWrongIndex = i;
    }
  });

  feedback.className = "fb hint";

  if (firstWrongIndex < 0) {
    feedback.textContent = "Todas as lacunas estão certas. Clique em Verificar.";
    return;
  }

  feedback.textContent = `Dica para a lacuna ${firstWrongIndex + 1}: ${MISSIONS[missionIndex].hints[firstWrongIndex]}`;
  inputs[firstWrongIndex].focus();
}

function handleCheck(missionIndex) {
  const section = $(`m${missionIndex}`);
  const inputs = section.querySelectorAll("input");
  const feedback = section.querySelector(".fb");

  let isAllCorrect = true;

  inputs.forEach((input) => {
    const isCorrect = normalizeString(input.value) === normalizeString(input.getAttribute("data-answer"));
    input.className = isCorrect ? "ok" : "no";
    if (!isCorrect) isAllCorrect = false;
  });

  if (!isAllCorrect) {
    feedback.className = "fb no";
    feedback.textContent = "Ainda não. Confira as lacunas em vermelho.";
    return;
  }

  feedback.className = "fb ok";
  feedback.textContent = `Correto! ${MISSIONS[missionIndex].explanation}`;

  // Desabilita campos concluídos
  inputs.forEach((input) => (input.disabled = true));
  section.querySelectorAll("button").forEach((btn) => (btn.disabled = true));
  section.className = "m done";

  // Atualiza o estado do banco de dados de acordo com a missão
  switch (missionIndex) {
    case 0:
      dbState.exists = true;
      dbState.rows = [];
      break;
    case 1:
      dbState.hasColumn2 = true;
      dbState.rows = currentTheme.rows.slice();
      break;
    case 2:
      dbState.rows = [];
      break;
    case 3:
      dbState.hasColumn2 = false;
      break;
    case 4:
      dbState.exists = false;
      break;
  }

  currentStep = missionIndex + 1;
  renderDatabaseView();

  // Libera a próxima missão
  const nextSection = $(`m${currentStep}`);
  if (nextSection) {
    nextSection.className = "m on";
    nextSection.querySelectorAll("input, button").forEach((el) => (el.disabled = false));
    setTimeout(() => {
      nextSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
    }, 700);
  } else {
    $("end").hidden = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  drawWheel();

  $("btnDraw")?.addEventListener("click", spinWheel);

  $("again")?.addEventListener("click", () => {
    window.scrollTo({ top: 0 });
    spinWheel();
  });

  // Event delegation para os botões das missões
  $("missions")?.addEventListener("click", (e) => {
    const checkAttr = e.target.getAttribute("data-check");
    const hintAttr = e.target.getAttribute("data-hint");

    if (hintAttr !== null) {
      handleHint(Number(hintAttr));
    } else if (checkAttr !== null) {
      handleCheck(Number(checkAttr));
    }
  });
});