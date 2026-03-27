const state = {
  completed: {
    cli: false,
    db: false,
    genomics: false,
    phylo: false
  },
  score: 0
};

const STORAGE_KEY = "biointeractiva_progress_v1";

const moduleData = {
  cli: {
    title: "Linea de comando para bioinformatica",
    description:
      "La linea de comando permite reproducibilidad y velocidad en flujos de analisis. En bioinformatica es comun procesar miles de archivos con scripts o comandos encadenados.",
    lesson: `
<div class="lesson">
  <h3>Conceptos clave</h3>
  <ul>
    <li><b>Navegacion:</b> <code>pwd</code>, <code>ls</code>, <code>cd</code>.</li>
    <li><b>Gestion de archivos:</b> <code>cp</code>, <code>mv</code>, <code>rm</code>, <code>mkdir</code>.</li>
    <li><b>Exploracion de secuencias:</b> <code>head</code>, <code>wc -l</code>, <code>grep</code>.</li>
    <li><b>Encadenamiento:</b> pipes <code>|</code> para combinar comandos.</li>
  </ul>
  <div class="code">Ejemplo practico:
grep "^>" secuencias.fasta | wc -l
Este comando cuenta cuantas secuencias hay en un archivo FASTA.</div>
</div>
`,
    interactive: `
<div class="interactive">
  <h4>Simulador de comando</h4>
  <label for="cliInput">Escribe el comando para contar secuencias en FASTA:</label>
  <input id="cliInput" type="text" placeholder='Ejemplo: grep "^>" archivo.fasta | wc -l'>
  <button id="cliCheckBtn">Validar comando</button>
  <div id="cliFeedback" class="feedback" hidden></div>
</div>
`,
    quiz: {
      question: "Cual comando lista el contenido de un directorio?",
      options: [
        { id: "a", text: "ls", correct: true },
        { id: "b", text: "pwd", correct: false },
        { id: "c", text: "wc -l", correct: false }
      ]
    }
  },
  db: {
    title: "Busqueda en bases de datos biologicas",
    description:
      "Las bases de datos biologicas integran secuencias, anotaciones funcionales y metadatos. Aprender consultas efectivas reduce tiempo y mejora la calidad de resultados.",
    lesson: `
<div class="lesson">
  <h3>Conceptos clave</h3>
  <ul>
    <li><b>NCBI:</b> nucleotidos, proteinas, genomas y bibliografia.</li>
    <li><b>UniProt:</b> informacion curada de proteinas.</li>
    <li><b>ENA/SRA:</b> lecturas de secuenciacion crudas.</li>
    <li><b>Consultas:</b> usar operadores como <code>AND</code>, <code>OR</code>, comillas y filtros por organismo.</li>
  </ul>
  <div class="code">Ejemplo de consulta en NCBI:
"cytochrome c oxidase" AND "Theobroma grandiflorum"[Organism]</div>
</div>
`,
    interactive: `
<div class="interactive">
  <h4>Constructor de consulta</h4>
  <label for="geneInput">Gen o proteina:</label>
  <input id="geneInput" type="text" placeholder="Ej: cytochrome c oxidase">
  <label for="organismInput">Organismo:</label>
  <input id="organismInput" type="text" placeholder="Ej: Theobroma grandiflorum">
  <button id="dbBuildBtn">Generar consulta</button>
  <div id="dbResult" class="code"></div>
</div>
`,
    quiz: {
      question: "Que base de datos se especializa en informacion de proteinas?",
      options: [
        { id: "a", text: "UniProt", correct: true },
        { id: "b", text: "PubChem", correct: false },
        { id: "c", text: "GEO", correct: false }
      ]
    }
  },
  genomics: {
    title: "Genomica",
    description:
      "La genomica analiza el ADN completo de un organismo. Incluye etapas desde control de calidad hasta interpretacion biologica de variantes y genes.",
    lesson: `
<div class="lesson">
  <h3>Flujo estandar de analisis genomico</h3>
  <ol>
    <li><b>QC:</b> evaluar calidad de lecturas (ej. FastQC).</li>
    <li><b>Filtrado/recorte:</b> eliminar adaptadores y bases de baja calidad.</li>
    <li><b>Alineamiento o ensamblaje:</b> mapear contra referencia o ensamblar de novo.</li>
    <li><b>Anotacion:</b> identificar genes y funciones.</li>
    <li><b>Analisis de variantes:</b> SNPs, indels y su posible impacto.</li>
  </ol>
  <div class="code">Pipeline conceptual:
FASTQ -> QC -> trimming -> alignment -> variant calling -> annotation</div>
</div>
`,
    interactive: `
<div class="interactive">
  <h4>Ordena el pipeline genomico</h4>
  <p>Escribe el orden correcto separado por coma usando estas etapas:
  <code>QC, trimming, alignment, variant calling, annotation</code></p>
  <textarea id="genomicsOrder"></textarea>
  <button id="genomicsCheckBtn">Evaluar orden</button>
  <div id="genomicsFeedback" class="feedback" hidden></div>
</div>
`,
    quiz: {
      question: "Que etapa identifica SNPs e indels?",
      options: [
        { id: "a", text: "Variant calling", correct: true },
        { id: "b", text: "Trimming", correct: false },
        { id: "c", text: "FastQC", correct: false }
      ]
    }
  },
  phylo: {
    title: "Filogenetica",
    description:
      "La filogenetica infiere relaciones evolutivas. Combina alineamientos, modelos de sustitucion y metodos para reconstruir arboles robustos.",
    lesson: `
<div class="lesson">
  <h3>Etapas importantes</h3>
  <ol>
    <li><b>Alineamiento multiple:</b> MAFFT, Clustal Omega, MUSCLE.</li>
    <li><b>Seleccion de modelo:</b> escoger el modelo de evolucion apropiado.</li>
    <li><b>Inferencia de arbol:</b> Neighbor Joining, Maximum Likelihood, Bayesiano.</li>
    <li><b>Soporte de nodos:</b> bootstrap para evaluar confiabilidad.</li>
  </ol>
  <div class="code">Interpretacion:
Una rama corta suele indicar menor divergencia; bootstrap alto sugiere mayor soporte.</div>
</div>
`,
    interactive: `
<div class="interactive">
  <h4>Interpretacion rapida de arbol</h4>
  <label for="bootstrapInput">Si un nodo tiene bootstrap 95, como lo interpretas?</label>
  <input id="bootstrapInput" type="text" placeholder="Escribe tu interpretacion">
  <button id="phyloCheckBtn">Evaluar respuesta</button>
  <div id="phyloFeedback" class="feedback" hidden></div>
</div>
`,
    quiz: {
      question: "Que metodo de alineamiento multiple es comun en filogenetica?",
      options: [
        { id: "a", text: "MAFFT", correct: true },
        { id: "b", text: "BLASTP", correct: false },
        { id: "c", text: "Bowtie2", correct: false }
      ]
    }
  }
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      state.completed = { ...state.completed, ...parsed.completed };
      state.score = Number.isFinite(parsed.score) ? parsed.score : 0;
    }
  } catch {
    // Si el JSON falla, se ignora y se reinicia desde valores por defecto.
  }
}

function getCompletedCount() {
  return Object.values(state.completed).filter(Boolean).length;
}

function updateProgressUI() {
  const completedCount = getCompletedCount();
  const total = 4;
  document.getElementById("completedCount").textContent = String(completedCount);
  document.getElementById("scoreValue").textContent = String(state.score);
  const pct = Math.round((completedCount / total) * 100);
  document.getElementById("progressBar").style.width = `${pct}%`;
}

function markModuleDone(moduleKey) {
  if (!state.completed[moduleKey]) {
    state.completed[moduleKey] = true;
    state.score += 25;
    saveState();
    updateProgressUI();
  }
}

function renderQuiz(moduleKey, quiz) {
  const optionsHtml = quiz.options
    .map(
      (opt) =>
        `<button class="quizOptionBtn" data-module="${moduleKey}" data-correct="${opt.correct}">${opt.text}</button>`
    )
    .join("");
  return `
<div class="lesson">
  <h3>Mini quiz</h3>
  <p>${quiz.question}</p>
  <div class="quiz-choices">${optionsHtml}</div>
  <div id="quizFeedback" class="feedback" hidden></div>
  ${
    state.completed[moduleKey]
      ? '<span class="status">Modulo completado</span>'
      : ""
  }
</div>
`;
}

function renderModule(moduleKey) {
  const module = moduleData[moduleKey];
  const container = document.getElementById("moduleContent");
  container.classList.remove("hidden");
  container.innerHTML = `
    <h2>${module.title}</h2>
    <p>${module.description}</p>
    ${module.lesson}
    ${module.interactive}
    ${renderQuiz(moduleKey, module.quiz)}
  `;

  attachModuleHandlers(moduleKey);
  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setFeedback(el, ok, msg) {
  el.hidden = false;
  el.classList.remove("ok", "err");
  el.classList.add(ok ? "ok" : "err");
  el.textContent = msg;
}

function attachModuleHandlers(moduleKey) {
  if (moduleKey === "cli") {
    const btn = document.getElementById("cliCheckBtn");
    btn.addEventListener("click", () => {
      const input = document.getElementById("cliInput").value.toLowerCase().trim();
      const fb = document.getElementById("cliFeedback");
      const ok = input.includes("grep") && input.includes("^>") && input.includes("wc");
      if (ok) {
        setFeedback(
          fb,
          true,
          "Correcto. Usaste una estrategia adecuada para contar cabeceras FASTA."
        );
      } else {
        setFeedback(
          fb,
          false,
          'Intenta incluir: grep "^>" archivo.fasta | wc -l'
        );
      }
    });
  }

  if (moduleKey === "db") {
    const btn = document.getElementById("dbBuildBtn");
    const result = document.getElementById("dbResult");
    result.textContent = "La consulta generada aparecera aqui.";
    btn.addEventListener("click", () => {
      const gene = document.getElementById("geneInput").value.trim();
      const organism = document.getElementById("organismInput").value.trim();
      if (!gene || !organism) {
        result.textContent = "Completa ambos campos para construir la consulta.";
        return;
      }
      result.textContent = `"${gene}" AND "${organism}"[Organism]`;
    });
  }

  if (moduleKey === "genomics") {
    const btn = document.getElementById("genomicsCheckBtn");
    btn.addEventListener("click", () => {
      const val = document
        .getElementById("genomicsOrder")
        .value.toLowerCase()
        .replace(/\s+/g, "");
      const fb = document.getElementById("genomicsFeedback");
      const target = "qc,trimming,alignment,variantcalling,annotation";
      if (val === target) {
        setFeedback(
          fb,
          true,
          "Excelente. Orden correcto del pipeline genomico."
        );
      } else {
        setFeedback(
          fb,
          false,
          "Orden sugerido: QC, trimming, alignment, variant calling, annotation."
        );
      }
    });
  }

  if (moduleKey === "phylo") {
    const btn = document.getElementById("phyloCheckBtn");
    btn.addEventListener("click", () => {
      const val = document.getElementById("bootstrapInput").value.toLowerCase();
      const fb = document.getElementById("phyloFeedback");
      const ok = val.includes("alto") || val.includes("confiable") || val.includes("soporte");
      if (ok) {
        setFeedback(
          fb,
          true,
          "Bien interpretado. Un bootstrap de 95 indica fuerte soporte para ese nodo."
        );
      } else {
        setFeedback(
          fb,
          false,
          "Pista: bootstrap 95 suele interpretarse como alto soporte estadistico."
        );
      }
    });
  }

  document.querySelectorAll(".quizOptionBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const isCorrect = btn.dataset.correct === "true";
      const module = btn.dataset.module;
      const fb = document.getElementById("quizFeedback");
      if (isCorrect) {
        setFeedback(fb, true, "Respuesta correcta. Modulo completado.");
        markModuleDone(module);
      } else {
        setFeedback(fb, false, "Respuesta incorrecta. Intenta de nuevo.");
      }
    });
  });
}

function bindGlobalEvents() {
  document.getElementById("goToModulesBtn").addEventListener("click", () => {
    document.getElementById("modules").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("resetProgressBtn").addEventListener("click", () => {
    state.completed = { cli: false, db: false, genomics: false, phylo: false };
    state.score = 0;
    saveState();
    updateProgressUI();
    alert("Progreso reiniciado.");
  });

  document.querySelectorAll(".openModuleBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      renderModule(btn.dataset.module);
    });
  });
}

function init() {
  loadState();
  updateProgressUI();
  bindGlobalEvents();
}

init();
