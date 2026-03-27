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

const cliCommandCatalog = [
  {
    cmd: "pwd",
    category: "Navegacion",
    syntax: "pwd",
    detail:
      "Muestra la ruta absoluta del directorio actual. Es clave para evitar ejecutar comandos en la carpeta equivocada.",
    bioExample: "pwd  # Verifica que estas en el proyecto de analisis"
  },
  {
    cmd: "ls",
    category: "Navegacion",
    syntax: "ls -lah",
    detail:
      "Lista archivos y carpetas. Con -l muestra permisos y tamano; con -a incluye ocultos; con -h hace legible el tamano.",
    bioExample: "ls -lah datos_fastq/"
  },
  {
    cmd: "cd",
    category: "Navegacion",
    syntax: "cd ruta/directorio",
    detail:
      "Cambia de directorio. Usa rutas relativas o absolutas para moverte rapido entre carpetas de resultados.",
    bioExample: "cd analisis/01_qc"
  },
  {
    cmd: "mkdir",
    category: "Archivos",
    syntax: "mkdir -p resultados/{qc,alineamiento,variantes}",
    detail:
      "Crea carpetas. Con -p crea jerarquias completas; util para estandarizar pipelines reproducibles.",
    bioExample: "mkdir -p proyecto/{raw,clean,results,logs}"
  },
  {
    cmd: "cp",
    category: "Archivos",
    syntax: "cp origen destino",
    detail:
      "Copia archivos o carpetas. Con -r copia recursivamente directorios completos.",
    bioExample: "cp -r referencia/hg38.fa respaldo/"
  },
  {
    cmd: "mv",
    category: "Archivos",
    syntax: "mv archivo nuevo_nombre",
    detail:
      "Mueve o renombra archivos. Muy usado para normalizar nombres de muestras.",
    bioExample: "mv muestra1.fastq.gz paciente_001_R1.fastq.gz"
  },
  {
    cmd: "rm",
    category: "Archivos",
    syntax: "rm archivo; rm -r carpeta",
    detail:
      "Elimina archivos o carpetas. Es destructivo; recomienda revisar antes con ls.",
    bioExample: "rm lecturas_tmp.fastq"
  },
  {
    cmd: "cat",
    category: "Inspeccion",
    syntax: "cat archivo",
    detail:
      "Imprime contenido completo de un archivo en terminal. Mejor para archivos cortos.",
    bioExample: "cat metadata.tsv"
  },
  {
    cmd: "head",
    category: "Inspeccion",
    syntax: "head -n 20 archivo",
    detail:
      "Muestra primeras lineas. Util para inspeccionar rapidamente FASTA, FASTQ o tablas.",
    bioExample: "head -n 8 muestra_R1.fastq"
  },
  {
    cmd: "tail",
    category: "Inspeccion",
    syntax: "tail -n 20 archivo",
    detail:
      "Muestra ultimas lineas. Ideal para revisar logs al final de una ejecucion.",
    bioExample: "tail -n 30 logs/alineamiento.log"
  },
  {
    cmd: "less",
    category: "Inspeccion",
    syntax: "less archivo",
    detail:
      "Permite navegar archivo pagina por pagina sin cargarlo completo en pantalla.",
    bioExample: "less anotacion.gff3"
  },
  {
    cmd: "wc",
    category: "Conteo",
    syntax: "wc -l archivo",
    detail:
      "Cuenta lineas, palabras y bytes. Con -l se usa para conteos rapidos de registros.",
    bioExample: "wc -l genes_diferenciales.tsv"
  },
  {
    cmd: "grep",
    category: "Busqueda",
    syntax: "grep 'patron' archivo",
    detail:
      "Busca patrones por expresiones regulares. Fundamental para filtrar por IDs o motivos.",
    bioExample: "grep '^>' secuencias.fasta | wc -l"
  },
  {
    cmd: "cut",
    category: "Tabulares",
    syntax: "cut -f1,3 archivo.tsv",
    detail:
      "Extrae columnas por delimitador. Muy util en archivos TSV/CSV bioinformaticos.",
    bioExample: "cut -f1,5 variantes.vcf"
  },
  {
    cmd: "sort",
    category: "Tabulares",
    syntax: "sort -k2,2n archivo.tsv",
    detail:
      "Ordena lineas. Con claves numericas permite ordenar por cobertura, score o p-value.",
    bioExample: "sort -k6,6gr blast_hits.tsv"
  },
  {
    cmd: "uniq",
    category: "Tabulares",
    syntax: "sort archivo | uniq -c",
    detail:
      "Elimina duplicados consecutivos. Con -c cuenta ocurrencias de cada valor.",
    bioExample: "cut -f1 taxonomia.tsv | sort | uniq -c"
  },
  {
    cmd: "awk",
    category: "Procesamiento",
    syntax: "awk 'condicion {accion}' archivo",
    detail:
      "Lenguaje de procesamiento por columnas. Potente para filtros complejos sin abrir Excel.",
    bioExample: "awk '$6 > 100 {print $1,$6}' blast.tsv"
  },
  {
    cmd: "sed",
    category: "Procesamiento",
    syntax: "sed 's/viejo/nuevo/g' archivo",
    detail:
      "Editor por flujo para reemplazos masivos o limpieza de texto.",
    bioExample: "sed 's/ /_/g' ids.txt > ids_limpios.txt"
  },
  {
    cmd: "find",
    category: "Busqueda",
    syntax: "find ruta -name '*.fastq.gz'",
    detail:
      "Busca archivos por nombre, extension, fecha o tamano dentro de carpetas profundas.",
    bioExample: "find . -name '*.bam' -size +1G"
  },
  {
    cmd: "tar",
    category: "Compresion",
    syntax: "tar -czvf archivo.tar.gz carpeta",
    detail:
      "Empaqueta y comprime directorios para respaldo o transferencia de resultados.",
    bioExample: "tar -czvf resultados_run1.tar.gz resultados_run1/"
  },
  {
    cmd: "gzip",
    category: "Compresion",
    syntax: "gzip archivo",
    detail:
      "Comprime archivos individuales. FastQ y VCF suelen manejarse en formato .gz.",
    bioExample: "gzip matriz_expresion.tsv"
  },
  {
    cmd: "zcat",
    category: "Compresion",
    syntax: "zcat archivo.gz | head",
    detail:
      "Permite visualizar contenido de .gz sin descomprimir a disco.",
    bioExample: "zcat lecturas.fastq.gz | head -n 12"
  },
  {
    cmd: "chmod",
    category: "Permisos",
    syntax: "chmod +x script.sh",
    detail:
      "Cambia permisos de ejecucion/lectura/escritura. Necesario para scripts de pipeline.",
    bioExample: "chmod +x ejecutar_pipeline.sh"
  },
  {
    cmd: "history",
    category: "Productividad",
    syntax: "history | tail -n 30",
    detail:
      "Muestra comandos usados. Facilita reproducibilidad y documentacion del analisis.",
    bioExample: "history > bitacora_comandos.txt"
  },
  {
    cmd: "uname",
    category: "Sistema",
    syntax: "uname -r",
    detail:
      "Muestra informacion del sistema y kernel. Util para documentar el entorno de ejecucion.",
    bioExample: "uname -r  # registrar version de kernel en el reporte"
  },
  {
    cmd: "date",
    category: "Sistema",
    syntax: "date",
    detail:
      "Imprime fecha y hora actual. Se usa para sellar temporalmente ejecuciones o logs.",
    bioExample: "date >> logs/pipeline.log"
  },
  {
    cmd: "df",
    category: "Disco",
    syntax: "df -h",
    detail:
      "Muestra el espacio libre y usado en discos montados en formato legible.",
    bioExample: "df -h  # validar espacio antes de ensamblaje"
  },
  {
    cmd: "du",
    category: "Disco",
    syntax: "du -sh carpeta",
    detail:
      "Calcula el tamano de directorios para detectar resultados pesados y limpiar.",
    bioExample: "du -sh resultados/*"
  },
  {
    cmd: "ps",
    category: "Procesos",
    syntax: "ps -eaf",
    detail:
      "Lista procesos activos. Ayuda a revisar si una herramienta de bioinformatica sigue corriendo.",
    bioExample: "ps -eaf | grep fastqc"
  },
  {
    cmd: "top",
    category: "Procesos",
    syntax: "top",
    detail:
      "Monitor en vivo de CPU y memoria. Ideal para vigilar ejecuciones pesadas.",
    bioExample: "top  # monitorear consumo durante alineamiento"
  },
  {
    cmd: "kill",
    category: "Procesos",
    syntax: "kill -9 PID",
    detail:
      "Termina procesos colgados o que consumen recursos excesivos.",
    bioExample: "kill -9 24510"
  },
  {
    cmd: "free",
    category: "Procesos",
    syntax: "free -m",
    detail:
      "Muestra estado de memoria RAM en megabytes para diagnostico rapido.",
    bioExample: "free -m"
  },
  {
    cmd: "whoami",
    category: "Sistema",
    syntax: "whoami",
    detail:
      "Indica el usuario actual en terminal, util al trabajar en servidores compartidos.",
    bioExample: "whoami"
  },
  {
    cmd: "zip",
    category: "Compresion",
    syntax: "zip -r archivo.zip carpeta",
    detail:
      "Comprime multiples archivos en formato zip para compartir resultados.",
    bioExample: "zip -r entrega_informe.zip resultados_finales/"
  },
  {
    cmd: "unzip",
    category: "Compresion",
    syntax: "unzip archivo.zip",
    detail:
      "Descomprime paquetes zip recibidos desde colaboradores o repositorios.",
    bioExample: "unzip dataset_control.zip"
  },
  {
    cmd: "ln -s",
    category: "Archivos",
    syntax: "ln -s origen enlace",
    detail:
      "Crea enlaces simbolicos para organizar pipelines sin duplicar archivos pesados.",
    bioExample: "ln -s /datos/raw/PAC001_R1.fastq.gz raw_data/PAC001_R1.fastq.gz"
  },
  {
    cmd: "chown",
    category: "Permisos",
    syntax: "chown usuario:grupo archivo",
    detail:
      "Cambia propietario y grupo de archivos. Frecuente en servidores Linux multiusuario.",
    bioExample: "sudo chown bioinfo:bioinfo resultados/*.vcf"
  },
  {
    cmd: "chgrp",
    category: "Permisos",
    syntax: "chgrp grupo archivo",
    detail:
      "Cambia grupo asociado a archivos para trabajo colaborativo.",
    bioExample: "chgrp laboratorio shared/tabla_variantes.tsv"
  },
  {
    cmd: "wget",
    category: "Red",
    syntax: "wget URL",
    detail:
      "Descarga archivos desde internet o repositorios remotos en modo terminal.",
    bioExample: "wget https://ejemplo.org/referencia.fasta.gz"
  },
  {
    cmd: "curl",
    category: "Red",
    syntax: "curl -L URL -o archivo",
    detail:
      "Permite descargar datos y consultar APIs bioinformaticas por HTTP.",
    bioExample: "curl -L https://ejemplo.org/genes.tsv -o genes.tsv"
  },
  {
    cmd: "sort | uniq",
    category: "Tabulares",
    syntax: "sort archivo | uniq -c",
    detail:
      "Combinacion clasica para resumir ocurrencias de valores repetidos.",
    bioExample: "cut -f3 muestras.tsv | sort | uniq -c"
  }
];

const cliSimulatedOutput = {
  "pwd": "/home/user/proyecto_bioinfo",
  "ls -lah": "drwxr-xr-x raw_data\n-rw-r--r-- metadata.tsv\n-rw-r--r-- README.md\ndrwxr-xr-x results",
  "grep \"^>\" secuencias.fasta | wc -l": "245",
  "find . -name \"*.fastq.gz\"": "./raw_data/PAC001_R1.fastq.gz\n./raw_data/PAC001_R2.fastq.gz\n./raw_data/PAC002_R1.fastq.gz",
  "zcat muestra.fastq.gz | head -n 8": "@SEQ_ID\nGATCTGACTGAT\n+\nIIIIIIIIIIII",
  "df -h": "Filesystem      Size  Used Avail Use%\n/dev/sda2       250G  120G  118G  51%",
  "du -sh resultados": "1.8G    resultados",
  "ps -eaf | grep fastqc": "user  18210  1  35  fastqc PAC001_R1.fastq.gz",
  "free -m": "Mem: 15872 total, 7820 used, 7521 free",
  "tar -czvf resultados.tar.gz resultados/": "resultados/qc/\nresultados/variants/\nresultados/logs/"
};

const moduleData = {
  cli: {
    title: "Linea de comando para bioinformatica",
    description:
      "Modulo extenso de linea de comando para bioinformatica, alimentado con una ruta de aprendizaje inspirada en recursos de GitHub y un temario estructurado por niveles similar a un curso profesional.",
    lesson: `
<div class="lesson">
  <h3>Guia completa: linea de comando aplicada a bioinformatica</h3>
  <p>Trabajar en terminal te permite ejecutar analisis reproducibles y escalables. Un analisis manual en interfaz grafica es dificil de repetir exactamente; en cambio, un flujo en comandos puede ejecutarse nuevamente sobre nuevas muestras con pocos cambios.</p>
  <p><b>Estructura recomendada de proyecto:</b></p>
  <div class="code">proyecto_bioinfo/
  raw_data/            # datos originales (solo lectura)
  metadata/            # metadatos de muestras
  scripts/             # scripts .sh, .py, .R
  reference/           # genoma/transcriptoma de referencia
  results/
    01_qc/
    02_trimming/
    03_alignment/
    04_variants/
  logs/</div>
  <p><b>Conceptos indispensables:</b> rutas absolutas vs relativas, permisos, redireccion (<code>></code>, <code>> </code>), pipes (<code>|</code>), codigos de salida y logs.</p>
  <p><b>Flujos tipicos con comandos:</b></p>
  <ul>
    <li>Inspeccion inicial: <code>ls -lah</code>, <code>head</code>, <code>wc -l</code>.</li>
    <li>Control de calidad de archivos: verificar extension, tamano y consistencia.</li>
    <li>Filtrado de secuencias/tablas: <code>grep</code>, <code>awk</code>, <code>cut</code>, <code>sort</code>.</li>
    <li>Automatizacion con bucles: ejecutar una herramienta para multiples muestras.</li>
  </ul>
  <div class="code">Ejemplo integrado en FASTA:
grep "^>" secuencias.fasta | wc -l            # cuenta secuencias
grep -v "^>" secuencias.fasta | tr -d "\\n" | wc -c   # cuenta nucleotidos totales (aprox)</div>
</div>

<div class="lesson">
  <h3>Ruta de aprendizaje estructurada (base externa integrada)</h3>
  <p>Este modulo integra dos fuentes para organizar el estudio: una ruta abierta de comandos en GitHub y un temario progresivo de curso de terminal. A partir de ellas, esta plataforma propone un camino orientado a bioinformatica.</p>
  <ol>
    <li><b>Fundamentos:</b> que es terminal, tipos de comandos, navegacion y rutas.</li>
    <li><b>Archivos y texto:</b> crear/copiar/mover/eliminar, inspeccion con head/tail/less, busqueda con grep y find.</li>
    <li><b>Redireccion y automatizacion:</b> pipes, redireccion, operadores de control, alias y scripts basicos.</li>
    <li><b>Sistema y procesos:</b> permisos, variables de entorno, procesos foreground/background y monitoreo.</li>
    <li><b>Utilidades avanzadas:</b> compresion tar/gzip, sesiones persistentes, personalizacion del shell.</li>
    <li><b>Aplicacion bioinformatica:</b> manejo de FASTA/FASTQ/VCF, trazabilidad de pipelines y reportes reproducibles.</li>
  </ol>
  <div class="code">Objetivo final del modulo:
Ser capaz de recibir datos crudos, inspeccionarlos, filtrarlos, ejecutar un flujo reproducible
y documentar cada paso de analisis usando linea de comando.</div>
</div>

<div class="lesson">
  <h3>Temario recomendado para dominar terminal</h3>
  <ul>
    <li><b>Introduccion:</b> terminal, shell, comandos basicos, uso en Windows con entornos Unix-like.</li>
    <li><b>Busqueda en terminal:</b> wildcards, grep, find, filtros por nombre/extension/atributos.</li>
    <li><b>Funcionamiento interno:</b> tipos de comandos, redirecciones, encadenamiento y alias permanentes.</li>
    <li><b>Sistema operativo:</b> permisos, variables de entorno, gestion de procesos (ps/top/kill).</li>
    <li><b>Utilidades:</b> compresion (tar/gzip), editores de texto y optimizacion del entorno.</li>
  </ul>
  <p>En esta plataforma, cada bloque incluye ejemplos aplicados a archivos biologicos para convertir teoria en practica real.</p>
</div>

<div class="lesson">
  <h3>Capturas de comandos (visual)</h3>
  <p>Estas capturas didacticas muestran como se ve una sesion de trabajo real en terminal para bioinformatica: inspeccion de lecturas, filtrado, monitoreo y compresion.</p>
  <div class="cli-gallery">
    <figure class="cli-shot">
      <img src="assets/cli-screenshot-1.svg" alt="Captura terminal navegacion e inspeccion">
      <figcaption>Navegacion e inspeccion inicial de archivos FASTQ.</figcaption>
    </figure>
    <figure class="cli-shot">
      <img src="assets/cli-screenshot-2.svg" alt="Captura terminal busqueda y filtrado">
      <figcaption>Busqueda y filtrado de secuencias con grep/find/awk.</figcaption>
    </figure>
    <figure class="cli-shot">
      <img src="assets/cli-screenshot-3.svg" alt="Captura terminal procesos y permisos">
      <figcaption>Monitoreo de procesos, memoria y ejecucion de scripts.</figcaption>
    </figure>
    <figure class="cli-shot">
      <img src="assets/cli-screenshot-4.svg" alt="Captura terminal compresion de resultados">
      <figcaption>Compresion y control de espacio de disco en resultados.</figcaption>
    </figure>
  </div>
</div>

<div class="lesson">
  <h3>Catalogo detallado de comandos (explorador interactivo)</h3>
  <p>Debajo podras seleccionar un comando para ver sintaxis, explicacion y ejemplo bioinformatico. La biblioteca se expandio usando categorias del repositorio de comandos Linux compartido (sistema, disco, procesos, red, permisos, compresion, etc.).</p>
</div>

<div class="lesson">
  <h3>Buenas practicas profesionales</h3>
  <ul>
    <li>Nunca modifiques <code>raw_data</code>; trabaja en copias procesadas.</li>
    <li>Guarda bitacoras de comandos y versiones de software.</li>
    <li>Usa nombres consistentes de muestras (ej. <code>PAC001_R1.fastq.gz</code>).</li>
    <li>Valida salidas intermedias antes de continuar pipeline.</li>
    <li>Documenta cada etapa en README o cuaderno de laboratorio digital.</li>
  </ul>
</div>
`,
    interactive: `
<div class="interactive">
  <h4>Recursos base usados en este modulo</h4>
  <p><b>Ruta GitHub:</b> <a href="https://github.com/guides4all/Ruta-Terminal-Linea-comandos" target="_blank" rel="noreferrer">guides4all/Ruta-Terminal-Linea-comandos</a></p>
  <p><b>Curso estructurado:</b> <a href="https://platzi.com/cursos/terminal/" target="_blank" rel="noreferrer">Curso de Introduccion a la Terminal y Linea de Comandos (Platzi)</a></p>
  <p><b>Biblioteca de comandos Linux:</b> <a href="https://gist.github.com/mrcodedev/eef21c633c3916a7e30b01fa07062c2e" target="_blank" rel="noreferrer">Gist Comandos Linux (mrcodedev)</a></p>
  <p>Estos recursos se usan como referencia para el orden pedagogico del contenido.</p>
</div>

<div class="interactive">
  <h4>Planificador de estudio CLI (segun tiempo semanal)</h4>
  <label for="cliPlanHours">Horas por semana que puedes dedicar:</label>
  <select id="cliPlanHours">
    <option value="2">2 horas/semana</option>
    <option value="4">4 horas/semana</option>
    <option value="6">6 horas/semana</option>
    <option value="8">8+ horas/semana</option>
  </select>
  <button id="cliPlanBtn">Generar plan</button>
  <div id="cliPlanOutput" class="code">Selecciona tus horas y genera una ruta de trabajo.</div>
</div>

<div class="interactive">
  <h4>Terminal interactiva (simulada)</h4>
  <label for="cliTrySelect">Elige un comando y ejecútalo para ver salida simulada:</label>
  <select id="cliTrySelect">
    <option>pwd</option>
    <option>ls -lah</option>
    <option>grep "^>" secuencias.fasta | wc -l</option>
    <option>find . -name "*.fastq.gz"</option>
    <option>zcat muestra.fastq.gz | head -n 8</option>
    <option>df -h</option>
    <option>du -sh resultados</option>
    <option>ps -eaf | grep fastqc</option>
    <option>free -m</option>
    <option>tar -czvf resultados.tar.gz resultados/</option>
  </select>
  <button id="cliRunBtn">Ejecutar comando</button>
  <div id="cliRunOutput" class="code">$ _</div>
</div>

<div class="interactive">
  <h4>Explorador de comandos Unix/Linux para bioinformatica</h4>
  <label for="cliCommandSelect">Selecciona un comando para ver explicacion detallada:</label>
  <select id="cliCommandSelect"></select>
  <div id="cliCommandDetails" class="code"></div>
</div>

<div class="interactive">
  <h4>Simulador de reto 1</h4>
  <label for="cliInput">Escribe el comando para contar secuencias en FASTA:</label>
  <input id="cliInput" type="text" placeholder='Ejemplo: grep "^>" archivo.fasta | wc -l'>
  <button id="cliCheckBtn">Validar comando</button>
  <div id="cliFeedback" class="feedback" hidden></div>
</div>

<div class="interactive">
  <h4>Simulador de reto 2</h4>
  <label for="cliInput2">Escribe un comando para mostrar las primeras 12 lineas de un FASTQ comprimido:</label>
  <input id="cliInput2" type="text" placeholder="Ejemplo: zcat muestra.fastq.gz | head -n 12">
  <button id="cliCheckBtn2">Validar comando</button>
  <div id="cliFeedback2" class="feedback" hidden></div>
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
    const planBtn = document.getElementById("cliPlanBtn");
    const planHours = document.getElementById("cliPlanHours");
    const planOutput = document.getElementById("cliPlanOutput");
    planBtn.addEventListener("click", () => {
      const h = Number(planHours.value);
      let plan = "";
      if (h <= 2) {
        plan =
          "Plan sugerido (2h/semana, 10 semanas):\n" +
          "Sem 1-2: navegacion, archivos y rutas.\n" +
          "Sem 3-4: grep/find/head/tail con archivos FASTA/FASTQ.\n" +
          "Sem 5-6: redireccion, pipes y filtros con awk/cut/sort.\n" +
          "Sem 7-8: permisos, procesos y compresion.\n" +
          "Sem 9-10: mini pipeline reproducible con bitacora.";
      } else if (h <= 4) {
        plan =
          "Plan sugerido (4h/semana, 7 semanas):\n" +
          "Sem 1: fundamentos + estructura de proyecto.\n" +
          "Sem 2: manipulacion de archivos biologicos.\n" +
          "Sem 3: busqueda y filtrado (grep/find/awk).\n" +
          "Sem 4: redireccion, pipes, alias.\n" +
          "Sem 5: permisos, variables y procesos.\n" +
          "Sem 6: compresion y automatizacion por lotes.\n" +
          "Sem 7: proyecto final CLI para bioinformatica.";
      } else if (h <= 6) {
        plan =
          "Plan sugerido (6h/semana, 5 semanas):\n" +
          "Semana 1: fundamentos, archivos, busqueda.\n" +
          "Semana 2: texto/tablas (grep, awk, cut, sort, uniq).\n" +
          "Semana 3: shell avanzado (pipes, redireccion, alias, scripts).\n" +
          "Semana 4: sistema (permisos, procesos, logs, compresion).\n" +
          "Semana 5: pipeline bioinformatico completo y documentado.";
      } else {
        plan =
          "Plan intensivo (8+ h/semana, 3-4 semanas):\n" +
          "Bloque A: fundamentos y comandos core.\n" +
          "Bloque B: procesamiento masivo de FASTA/FASTQ/VCF.\n" +
          "Bloque C: automatizacion con scripts + reportes reproducibles.\n" +
          "Bloque D: proyecto final con validacion y control de calidad.";
      }
      planOutput.textContent = plan;
    });

    const commandSelect = document.getElementById("cliCommandSelect");
    const commandDetails = document.getElementById("cliCommandDetails");
    commandSelect.innerHTML = cliCommandCatalog
      .map((item) => `<option value="${item.cmd}">${item.cmd} (${item.category})</option>`)
      .join("");

    function renderCommandDetail(commandName) {
      const item = cliCommandCatalog.find((x) => x.cmd === commandName);
      if (!item) return;
      commandDetails.textContent =
        `Comando: ${item.cmd}\n` +
        `Categoria: ${item.category}\n` +
        `Sintaxis sugerida: ${item.syntax}\n\n` +
        `${item.detail}\n\n` +
        `Ejemplo en bioinformatica:\n${item.bioExample}`;
    }

    renderCommandDetail(cliCommandCatalog[0].cmd);
    commandSelect.addEventListener("change", (event) => {
      renderCommandDetail(event.target.value);
    });

    const runBtn = document.getElementById("cliRunBtn");
    const runSelect = document.getElementById("cliTrySelect");
    const runOutput = document.getElementById("cliRunOutput");
    runBtn.addEventListener("click", () => {
      const cmd = runSelect.value;
      const output = cliSimulatedOutput[cmd] || "Comando no reconocido en el simulador.";
      runOutput.textContent = `$ ${cmd}\n${output}`;
    });

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

    const btn2 = document.getElementById("cliCheckBtn2");
    btn2.addEventListener("click", () => {
      const input2 = document.getElementById("cliInput2").value.toLowerCase().trim();
      const fb2 = document.getElementById("cliFeedback2");
      const ok2 =
        (input2.includes("zcat") || input2.includes("gunzip -c")) &&
        input2.includes("head") &&
        (input2.includes("-n 12") || input2.includes("-12"));
      if (ok2) {
        setFeedback(
          fb2,
          true,
          "Correcto. Tu comando permite inspeccionar un FASTQ comprimido sin descomprimir a disco."
        );
      } else {
        setFeedback(
          fb2,
          false,
          "Sugerencia: zcat muestra.fastq.gz | head -n 12"
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
