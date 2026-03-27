/**
 * BioInteractiva - Main Application
 * Updated to support modular CLI with tabs
 */

const state = {
  completed: {
    cli: false,
    db: false,
    genomics: false,
    phylo: false
  },
  score: 0,
  cliProgress: {
    commandsMastered: [],
    exercisesCompleted: [],
    labsCompleted: []
  }
};

const STORAGE_KEY = "biointeractiva_progress_v2";

// Mapeo de capturas de terminal por comando
const cliCaptures = {
  // Navegación
  'pwd': 'captures/pwd.svg',
  'ls': 'captures/ls.svg',
  'ls -lah': 'captures/ls.svg',
  'ls -l': 'captures/ls.svg',
  'cd': 'captures/ls.svg',
  'tree': 'captures/ls.svg',
  
  // Archivos
  'mkdir': 'captures/mkdir.svg',
  'cp': 'captures/cp.svg',
  'mv': 'captures/mv.svg',
  'rm': 'captures/rm.svg',
  'ln': 'captures/ls.svg',
  'touch': 'captures/mkdir.svg',
  
  // Inspección
  'cat': 'captures/cat.svg',
  'head': 'captures/head.svg',
  'head -n': 'captures/head.svg',
  'tail': 'captures/tail.svg',
  'less': 'captures/less.svg',
  'wc': 'captures/wc.svg',
  'wc -l': 'captures/wc.svg',
  'file': 'captures/cat.svg',
  
  // Búsqueda
  'grep': 'captures/grep.svg',
  'grep ^>': 'captures/grep.svg',
  'find': 'captures/find.svg',
  'find . -name': 'captures/find.svg',
  
  // Procesamiento
  'awk': 'captures/awk.svg',
  'awk \'$6': 'captures/awk.svg',
  'sed': 'captures/sed.svg',
  
  // Tabulares
  'cut': 'captures/cut.svg',
  'cut -f': 'captures/cut.svg',
  'sort': 'captures/sort.svg',
  'sort -k': 'captures/sort.svg',
  'uniq': 'captures/uniq.svg',
  
  // Compresión
  'gzip': 'captures/gzip.svg',
  'gunzip': 'captures/gzip.svg',
  'zcat': 'captures/zcat.svg',
  'tar': 'captures/tar.svg',
  'zip': 'captures/tar.svg',
  'unzip': 'captures/tar.svg',
  
  // Sistema/Disco
  'df': 'captures/df.svg',
  'df -h': 'captures/df.svg',
  'du': 'captures/du.svg',
  'du -sh': 'captures/du.svg',
  
  // Procesos
  'ps': 'captures/ps.svg',
  'ps -eaf': 'captures/ps.svg',
  'top': 'captures/top.svg',
  'free': 'captures/free.svg',
  'free -m': 'captures/free.svg',
  'kill': 'captures/kill.svg',
  
  // Red
  'wget': 'captures/wget.svg',
  'curl': 'captures/curl.svg',
  
  // Permisos
  'chmod': 'captures/chmod.svg',
  'chmod +x': 'captures/chmod.svg',
  'chown': 'captures/chown.svg',
  
  // Utilidades del sistema
  'history': 'captures/history.svg',
  'history | tail': 'captures/history.svg',
  'uname': 'captures/uname.svg',
  'uname -r': 'captures/uname.svg',
  'date': 'captures/date_cmd.svg',
  'whoami': 'captures/whoami.svg',
  
  // Genómica
  'samtools': 'captures/samtools-flagstat.svg',
  'samtools flagstat': 'captures/samtools-flagstat.svg',
  'bcftools': 'captures/bcftools.svg',
  'bcftools view': 'captures/bcftools.svg',
  'fastqc': 'captures/fastqc.svg'
};

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
    cmd: "samtools",
    category: "Genomica",
    syntax: "samtools flagstat archivo.bam",
    detail:
      "Resumen de calidad y mapeo de lecturas alineadas. Muestra % mapeo, duplicados, etc.",
    bioExample: "samtools flagstat mapped.bam"
  },
  {
    cmd: "bcftools",
    category: "Genomica",
    syntax: "bcftools view -i 'QUAL>=20' variantes.vcf.gz",
    detail:
      "Filtra variantes por calidad, profundidad o cualquier campo del VCF.",
    bioExample: "bcftools view -i 'QUAL>=30 && DP>=10' variants.vcf.gz | head"
  },
  {
    cmd: "fastqc",
    category: "Genomica",
    syntax: "fastqc archivo.fastq.gz",
    detail:
      "Control de calidad de lecturas. Analiza Phred score, contenido GC, adaptadores.",
    bioExample: "fastqc raw_data/*.fastq.gz -o results/qc/"
  }
];

const cliSimulatedOutput = {
  "pwd": "/home/bioinfo/proyectos/microbioma_2026",
  "ls -lah": "drwxr-xr-x raw_data/\n-rw-r--r-- metadata.tsv\n-rw-r--r-- README.md\ndrwxr-xr-x results/",
  "grep '^>' secuencias.fasta | wc -l": "245",
  "find . -name '*.fastq.gz'": "./raw_data/PAC001_R1.fastq.gz\n./raw_data/PAC001_R2.fastq.gz\n./raw_data/PAC002_R1.fastq.gz",
  "zcat muestra.fastq.gz | head -n 8": "@SEQ_ID\nGATCTGACTGAT\n+\nIIIIIIIIIIII",
  "df -h": "Filesystem      Size  Used Avail Use%\n/dev/sda2       250G  120G  118G  51%",
  "du -sh resultados": "1.8G    resultados",
  "ps -eaf | grep fastqc": "bioinfo  18210  1  35  fastqc PAC001_R1.fastq.gz",
  "free -m": "Mem: 15872 total, 7820 used, 7521 free",
  "tar -czvf resultados.tar.gz resultados/": "resultados/qc/\nresultados/variants/\nresultados/logs/",
  "samtools flagstat mapped.bam": "2450000 + 0 in total\n2300000 + 0 mapped (93.88%)\n120000 + 0 duplicate (4.90%)"
};

// Datos de los módulos (para módulos distintos de CLI)
const moduleData = {
  cli: {
    title: "🖥️ Línea de comando para bioinformática",
    description:
      "Domina la terminal Linux/Ubuntu para análisis bioinformático. Aprende a manejar archivos FASTA, FASTQ, VCF y a construir pipelines reproducibles.",
    lesson: renderCLILesson(),
    interactive: renderCLIInteractive(),
    quiz: {
      question: "¿Qué comando te permite contar cuántas secuencias hay en un archivo FASTA?",
      options: [
        { id: "a", text: "grep '^>' archivo.fasta | wc -l", correct: true },
        { id: "b", text: "ls -lah archivo.fasta", correct: false },
        { id: "c", text: "wc -l archivo.fasta", correct: false }
      ]
    }
  },
  db: {
    title: "Búsqueda en bases de datos biológicas",
    description:
      "Las bases de datos biológicas integran secuencias, anotaciones funcionales y metadatos. Aprender consultas efectivas reduce tiempo y mejora la calidad de resultados.",
    lesson: `
<div class="lesson">
  <h3>Conceptos clave</h3>
  <ul>
    <li><b>NCBI:</b> nucleotidos, proteinas, genomas y bibliografia.</li>
    <li><b>UniProt:</b> informacion curada de proteinas.</li>
    <li><b>ENA/SRA:</b> lecturas de secuenciacion crudas.</li>
    <li><b>Consultas:</b> usar operadores como <code>AND</code>, <code>OR</code>, comillas y filtros por organismo.</li>
  </ul>
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
      question: "¿Qué base de datos se especializa en información de proteínas?",
      options: [
        { id: "a", text: "UniProt", correct: true },
        { id: "b", text: "PubChem", correct: false },
        { id: "c", text: "GEO", correct: false }
      ]
    }
  },
  genomics: {
    title: "Genómica",
    description:
      "La genómica analiza el ADN completo de un organismo. Incluye etapas desde control de calidad hasta interpretación biológica de variantes y genes.",
    lesson: `
<div class="lesson">
  <h3>Flujo estándar de análisis genómico</h3>
  <ol>
    <li><b>QC:</b> evaluar calidad de lecturas (ej. FastQC).</li>
    <li><b>Filtrado/recorte:</b> eliminar adaptadores y bases de baja calidad.</li>
    <li><b>Alineamiento o ensamblaje:</b> mapear contra referencia o ensamblar de novo.</li>
    <li><b>Anotación:</b> identificar genes y funciones.</li>
    <li><b>Análisis de variantes:</b> SNPs, indels y su posible impacto.</li>
  </ol>
</div>
`,
    interactive: `
<div class="interactive">
  <h4>Ordena el pipeline genómico</h4>
  <p>Escribe el orden correcto separado por coma usando estas etapas:
  <code>QC, trimming, alignment, variant calling, annotation</code></p>
  <textarea id="genomicsOrder"></textarea>
  <button id="genomicsCheckBtn">Evaluar orden</button>
  <div id="genomicsFeedback" class="feedback" hidden></div>
</div>
`,
    quiz: {
      question: "¿Qué etapa identifica SNPs e indels?",
      options: [
        { id: "a", text: "Variant calling", correct: true },
        { id: "b", text: "Trimming", correct: false },
        { id: "c", text: "FastQC", correct: false }
      ]
    }
  },
  phylo: {
    title: "Filogenética",
    description:
      "La filogenética infiere relaciones evolutivas. Combina alineamientos, modelos de sustitución y métodos para reconstruir árboles robustos.",
    lesson: `
<div class="lesson">
  <h3>Etapas importantes</h3>
  <ol>
    <li><b>Alineamiento multiple:</b> MAFFT, Clustal Omega, MUSCLE.</li>
    <li><b>Selección de modelo:</b> escoger el modelo de evolución apropiado.</li>
    <li><b>Inferencia de árbol:</b> Neighbor Joining, Maximum Likelihood, Bayesiano.</li>
    <li><b>Soporte de nodos:</b> bootstrap para evaluar confiabilidad.</li>
  </ol>
</div>
`,
    interactive: `
<div class="interactive">
  <h4>Interpretación rápida de árbol</h4>
  <label for="bootstrapInput">Si un nodo tiene bootstrap 95, cómo lo interpretas?</label>
  <input id="bootstrapInput" type="text" placeholder="Escribe tu interpretación">
  <button id="phyloCheckBtn">Evaluar respuesta</button>
  <div id="phyloFeedback" class="feedback" hidden></div>
</div>
`,
    quiz: {
      question: "¿Qué método de alineamiento multiple es común en filogenética?",
      options: [
        { id: "a", text: "MAFFT", correct: true },
        { id: "b", text: "BLASTP", correct: false },
        { id: "c", text: "Bowtie2", correct: false }
      ]
    }
  }
};

// ============================================
// FUNCIONES DEL MÓDULO CLI REDISEÑADO
// ============================================

// Renderizar lesson del CLI
function renderCLILesson() {
  return `
    <!-- Sección de Instalación de WSL Ubuntu -->
    <div class="lesson wsl-setup-section">
      <h3>🪟 Instalar Ubuntu en Windows con WSL</h3>
      <p>Antes de comenzar a usar la línea de comando, necesitas tener Ubuntu instalado en tu Windows. Sigue estos pasos:</p>
      
      <div class="wsl-steps">
        <div class="wsl-step">
          <div class="wsl-step-number">1</div>
          <div class="wsl-step-content">
            <h4>Abre PowerShell como Administrador</h4>
            <p>Haz clic derecho en el menú Inicio y selecciona "Windows PowerShell (Administrador)"</p>
            <div class="wsl-capture">
              <img src="assets/captures/wsl-install-1.svg" alt="Paso 1: PowerShell">
            </div>
            <div class="wsl-command">
              <code>wsl --install</code>
            </div>
          </div>
        </div>
        
        <div class="wsl-step">
          <div class="wsl-step-number">2</div>
          <div class="wsl-step-content">
            <h4>Reinicia tu computadora</h4>
            <p>El instalador te pedirá reiniciar. Después del reinicio, Ubuntu se configurará automáticamente.</p>
            <div class="wsl-capture">
              <img src="assets/captures/wsl-install-2.svg" alt="Paso 2: Configuración">
            </div>
            <p class="wsl-note">📝 Crea tu nombre de usuario y contraseña cuando se te indique.</p>
          </div>
        </div>
        
        <div class="wsl-step">
          <div class="wsl-step-number">3</div>
          <div class="wsl-step-content">
            <h4>¡Listo! Verifica la instalación</h4>
            <p>Desde PowerShell o Ubuntu, verifica que todo esté correcto:</p>
            <div class="wsl-capture">
              <img src="assets/captures/wsl-install-3.svg" alt="Paso 3: Verificación">
            </div>
            <div class="wsl-command">
              <code>wsl -l -v</code>
            </div>
          </div>
        </div>
      </div>
      
      <div class="wsl-alternatives">
        <h4>💡 Alternativas de instalación</h4>
        <ul>
          <li><strong>Microsoft Store:</strong> Busca "Ubuntu" en la Microsoft Store y haz clic en "Instalar"</li>
          <li><strong>Desde CMD:</strong> Ejecuta <code>wsl --install -d Ubuntu</code></li>
        </ul>
      </div>
    </div>

    <!-- Introducción a la línea de comando -->
    <div class="lesson cli-intro">
      <h3>🚀 ¿Por qué la línea de comando es esencial en bioinformática?</h3>
      <p>El trabajo bioinformático moderno se ejecuta mayoritariamente desde línea de comando porque permite <b>reproducibilidad</b>, <b>escalabilidad</b> y <b>automatización</b>. Ubuntu y distribuciones Linux son estándar en laboratorios y servidores HPC.</p>
      
      <h4>📁 Estructura profesional de proyecto:</h4>
      <div class="code">proyecto_bioinfo/
├── raw_data/           # Datos originales (no editar)
├── metadata/            # Metadatos de muestras
├── reference/          # Genoma/transcriptoma de referencia
├── env/                # Entorno Conda/contenedores
├── scripts/            # Scripts .sh, .py, .R
├── results/
│   ├── 01_qc/
│   ├── 02_trimming/
│   ├── 03_alignment/
│   └── 04_variants/
├── logs/
└── reports/</div>
    </div>

    <div class="lesson">
      <h3>📚 Biblioteca de comandos organizada</h3>
      <p>Explora las diferentes categorías de comandos. Cada comando incluye:</p>
      <ul>
        <li>Descripción y sintaxis</li>
        <li>Relevancia específica para bioinformática</li>
        <li>Ejemplo práctico con datos biológicos</li>
        <li>Salida simulada con captura de terminal</li>
      </ul>
      
      <div class="command-catalog-preview">
        <p><strong>Total de comandos disponibles:</strong> ${cliCommandCatalog.length}</p>
        <p><strong>Categorías:</strong> Navegación, Archivos, Inspección, Búsqueda, Tabulares, Compresión, Sistema, Procesos, Red, Genómica</p>
      </div>
    </div>

    <div class="lesson">
      <h3>🖼️ Capturas de terminal</h3>
      <div class="cli-gallery">
        <figure class="cli-shot">
          <img src="assets/cli-screenshot-1.svg" alt="Navegación e inspección">
          <figcaption>Navegación e inspección de archivos FASTQ</figcaption>
        </figure>
        <figure class="cli-shot">
          <img src="assets/cli-screenshot-2.svg" alt="Búsqueda y filtrado">
          <figcaption>Búsqueda y filtrado con grep/find/awk</figcaption>
        </figure>
        <figure class="cli-shot">
          <img src="assets/cli-screenshot-3.svg" alt="Procesos y permisos">
          <figcaption>Monitoreo de procesos y memoria</figcaption>
        </figure>
        <figure class="cli-shot">
          <img src="assets/cli-screenshot-4.svg" alt="Compresión">
          <figcaption>Compresión y control de espacio</figcaption>
        </figure>
      </div>
    </div>

    <div class="lesson">
      <h3>✅ Buenas prácticas en el laboratorio</h3>
      <ul>
        <li>🔴 <b>NUNCA</b> modifiques <code>raw_data</code>; trabaja en copias procesadas.</li>
        <li>📝 Registra comandos, versión de herramientas y fecha/hora por corrida.</li>
        <li>📛 Usa nombres consistentes de muestras (ej. <code>PAC001_R1.fastq.gz</code>).</li>
        <li>🔍 Valida salidas intermedias antes de avanzar al siguiente paso.</li>
        <li>⚠️ Evita <code>rm -rf</code> en rutas ambiguas; confirma con <code>pwd</code> y <code>ls</code>.</li>
      </ul>
    </div>
  `;
}

// Renderizar sección interactive del CLI
function renderCLIInteractive() {
  return `
    <div class="interactive">
      <h4>📖 Explorador de comandos</h4>
      <p>Selecciona un comando para ver su descripción, sintaxis y ejemplo:</p>
      <select id="cliCommandSelect">
        ${cliCommandCatalog.map((c, i) => `<option value="${i}">${c.cmd} - ${c.category}</option>`).join('')}
      </select>
      <div id="cliCommandDetails" class="command-detail"></div>
    </div>

    <div class="interactive">
      <h4>💻 Terminal simulada</h4>
      <p>Elige un comando y ejecútalo para ver la salida:</p>
      <select id="cliTerminalSelect">
        ${Object.keys(cliSimulatedOutput).map(cmd => `<option value="${cmd}">${cmd}</option>`).join('')}
      </select>
      <button id="cliRunBtn">Ejecutar</button>
      <pre id="cliTerminalOutput" class="terminal-output">$ _</pre>
    </div>

    <div class="interactive">
      <h4>✏️ Ejercicio: Contar secuencias FASTA</h4>
      <p>Escribe el comando para contar cuántas secuencias hay en un archivo FASTA:</p>
      <input id="cliExerciseInput" type="text" placeholder="Ej: grep '^>' archivo.fasta | wc -l">
      <button id="cliExerciseBtn">Verificar</button>
      <div id="cliExerciseFeedback" class="feedback" hidden></div>
    </div>

    <div class="interactive">
      <h4>🧪 Laboratorio: Arma el pipeline</h4>
      <p>Ordena los comandos para crear un pipeline básico (escribe los números 1-5):</p>
      <p class="pipeline-commands">
        <code>bwa mem ref.fa datos/*.fastq.gz > alineamiento.sam</code> (alineamiento)<br>
        <code>mkdir -p resultados/{qc,alignment,variants}</code> (crear estructura)<br>
        <code>fastqc datos/*.fastq.gz -o resultados/qc/</code> (QC)<br>
        <code>samtools sort alineamiento.sam -o alineamiento.bam</code> (ordenar BAM)<br>
        <code>bcftools call -v variantes.bcf > variantes.vcf</code> (variant calling)
      </p>
      <input id="pipelineOrderInput" type="text" placeholder="Orden: 1,2,3,4,5">
      <button id="pipelineOrderBtn">Verificar</button>
      <div id="pipelineOrderFeedback" class="feedback" hidden></div>
    </div>

    <div class="interactive">
      <h4>📚 Referencias externas</h4>
      <p><a href="https://documentation.ubuntu.com/desktop/en/latest/tutorial/the-linux-command-line-for-beginners/" target="_blank">Tutorial oficial de Ubuntu</a></p>
      <p><a href="https://samtools.github.io/bcftools/howtos/" target="_blank">BCFtools HowTo</a></p>
      <p><a href="https://manpages.ubuntu.com/manpages/lunar/man1/" target="_blank">Manpages de Ubuntu</a></p>
    </div>
  `;
}

// ============================================
// FUNCIONES DE ESTADO
// ============================================

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
      if (parsed.cliProgress) {
        state.cliProgress = { ...state.cliProgress, ...parsed.cliProgress };
      }
    }
  } catch (e) {
    console.warn("Error al cargar estado:", e);
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

// ============================================
// RENDERIZADO DE MÓDULOS
// ============================================

function renderModule(moduleKey) {
  const module = moduleData[moduleKey];
  const container = document.getElementById("moduleContent");
  
  if (moduleKey === 'cli') {
    // Usar el nuevo renderizado con tabs
    container.classList.remove("hidden");
    container.innerHTML = `
      <div class="cli-module-enhanced">
        <div class="cli-header">
          <h2>🖥️ ${module.title}</h2>
          <p class="cli-description">${module.description}</p>
          <button class="back-btn" onclick="renderModulesList()">← Volver a módulos</button>
        </div>
        
        <div class="cli-tabs">
          <button class="cli-tab active" data-tab="biblioteca">📚 Biblioteca</button>
          <button class="cli-tab" data-tab="ejercicios">✏️ Ejercicios</button>
          <button class="cli-tab" data-tab="laboratorio">🔬 Laboratorio</button>
          <button class="cli-tab" data-tab="quiz">❓ Quiz</button>
        </div>
        
        <div class="cli-tab-content" id="cliTabBiblioteca">
          ${renderCLIBiblioteca()}
        </div>
        
        <div class="cli-tab-content hidden" id="cliTabEjercicios">
          ${renderCLIExercises()}
        </div>
        
        <div class="cli-tab-content hidden" id="cliTabLaboratorio">
          ${renderCLILab()}
        </div>
        
        <div class="cli-tab-content hidden" id="cliTabQuiz">
          ${renderCLIQuiz()}
        </div>
      </div>
    `;
  } else {
    // Renderizado original para otros módulos
    container.classList.remove("hidden");
    container.innerHTML = `
      <h2>${module.title}</h2>
      <p>${module.description}</p>
      ${module.lesson}
      ${module.interactive}
      ${renderQuiz(moduleKey, module.quiz)}
    `;
  }

  attachModuleHandlers(moduleKey);
  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Renderizar Biblioteca
function renderCLIBiblioteca() {
  const categories = {};
  cliCommandCatalog.forEach(cmd => {
    if (!categories[cmd.category]) categories[cmd.category] = [];
    categories[cmd.category].push(cmd);
  });

  return `
    <div class="cli-categories-grid">
      ${Object.entries(categories).map(([cat, cmds]) => `
        <details class="cli-category-card" open>
          <summary>
            <span class="cat-icon">${getCategoryIcon(cat)}</span>
            <span class="cat-name">${cat}</span>
            <span class="cat-count">${cmds.length}</span>
          </summary>
          <div class="cat-commands">
            ${cmds.map(c => {
              const captureFile = cliCaptures[c.cmd.toLowerCase().split(' ')[0]];
              const hasCapture = captureFile !== undefined;
              return `
                <div class="cli-cmd-item" data-cmd="${c.cmd}">
                  <div class="cmd-header-row">
                    <code class="cmd-name">${c.cmd}</code>
                    <code class="cmd-syntax">${c.syntax}</code>
                  </div>
                  <p class="cmd-desc">${c.detail}</p>
                  <p class="cmd-bio"><strong>🐸 Bio:</strong> ${c.bioExample}</p>
                  ${hasCapture ? `
                    <div class="cmd-capture">
                      <img src="assets/${captureFile}" alt="Terminal ${c.cmd}" loading="lazy">
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </details>
      `).join('')}
    </div>
  `;
}

function getCategoryIcon(cat) {
  const icons = {
    'Navegacion': '📁',
    'Archivos': '📄',
    'Inspeccion': '👁️',
    'Busqueda': '🔍',
    'Tabulares': '📊',
    'Procesamiento': '⚙️',
    'Compresion': '📦',
    'Permisos': '🔐',
    'Productividad': '📝',
    'Sistema': '💻',
    'Disco': '💾',
    'Procesos': '⚡',
    'Red': '🌐',
    'Genomica': '🧬'
  };
  return icons[cat] || '📌';
}

// Renderizar Ejercicios
function renderCLIExercises() {
  return `
    <div class="cli-exercises-grid">
      <div class="exercise-card">
        <h4>✏️ Ejercicio 1: Contar secuencias FASTA</h4>
        <p>Escribe el comando para contar cuántas secuencias hay en un archivo FASTA:</p>
        <input type="text" id="ex1-input" placeholder="grep '^>' archivo.fasta | wc -l">
        <button onclick="checkEx1()">Verificar</button>
        <div id="ex1-feedback" class="feedback hidden"></div>
      </div>
      
      <div class="exercise-card">
        <h4>✏️ Ejercicio 2: Ver FASTQ comprimido</h4>
        <p>Escribe el comando para ver las primeras 12 líneas de un FASTQ.gz:</p>
        <input type="text" id="ex2-input" placeholder="zcat archivo.fastq.gz | head -n 12">
        <button onclick="checkEx2()">Verificar</button>
        <div id="ex2-feedback" class="feedback hidden"></div>
      </div>
      
      <div class="exercise-card">
        <h4>✏️ Ejercicio 3: Buscar archivos FASTQ</h4>
        <p>Escribe el comando para buscar todos los archivos .fastq.gz:</p>
        <input type="text" id="ex3-input" placeholder="find . -name '*.fastq.gz'">
        <button onclick="checkEx3()">Verificar</button>
        <div id="ex3-feedback" class="feedback hidden"></div>
      </div>
      
      <div class="exercise-card">
        <h4>✏️ Ejercicio 4: Filtrar por score</h4>
        <p>Usa awk para filtrar líneas donde columna 6 > 100:</p>
        <input type="text" id="ex4-input" placeholder="awk '$6 > 100 {print}' archivo">
        <button onclick="checkEx4()">Verificar</button>
        <div id="ex4-feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h4>✏️ Ejercicio 5: Ver espacio en disco</h4>
        <p>Escribe el comando para ver el espacio en disco en formato legible:</p>
        <input type="text" id="ex5-input" placeholder="df -h">
        <button onclick="checkEx5()">Verificar</button>
        <div id="ex5-feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h4>✏️ Ejercicio 6: Contar líneas FASTQ</h4>
        <p>Un archivo FASTQ tiene 4 líneas por read. Si <code>wc -l</code> da 4800000, ¿cuántos reads hay?</p>
        <input type="text" id="ex6-input" placeholder="4800000 / 4">
        <button onclick="checkEx6()">Verificar</button>
        <div id="ex6-feedback" class="feedback hidden"></div>
      </div>
    </div>

    <!-- Terminal Virtual Interactivo -->
    <div class="interactive-terminal-section">
      <h3>🖥️ Terminal Virtual Interactivo</h3>
      <p>Practica con un terminal simulado. Escribe el comando y observa la salida:</p>
      
      <div class="terminal模拟">
        <div class="terminal-header">
          <span class="terminal-title">biointeractiva:~/proyecto_bioinfo$</span>
        </div>
        <div class="terminal-body">
          <div class="terminal-output" id="terminalOutput">
            <span class="prompt">$</span> <span class="cursor">_</span>
          </div>
        </div>
        <div class="terminal-input-area">
          <span class="prompt">$</span>
          <input type="text" id="terminalInput" placeholder="Escribe un comando..." autocomplete="off">
          <button onclick="runTerminalCommand()">Ejecutar</button>
        </div>
        <div class="terminal-hint">
          <p>💡 Comandos disponibles: pwd, ls, ls -lah, head, tail, grep, find, wc, df -h, free -m</p>
        </div>
      </div>
    </div>
  `;
}

// Renderizar Laboratorio
function renderCLILab() {
  return `
    <div class="cli-lab">
      <div class="lab-section">
        <h4>🔬 Laboratorio: Pipeline de análisis</h4>
        <p>Ordena los siguientes pasos del pipeline (escribe los números 1-5):</p>
        <div class="lab-commands">
          <div class="lab-cmd"><span class="num">_</span> mkdir -p resultados/{qc,alignment,variants}</div>
          <div class="lab-cmd"><span class="num">_</span> fastqc datos/*.fastq.gz -o resultados/qc/</div>
          <div class="lab-cmd"><span class="num">_</span> bwa mem ref.fa datos/*.fastq.gz > alineamiento.sam</div>
          <div class="lab-cmd"><span class="num">_</span> samtools sort alineamiento.sam -o alineamiento.bam</div>
          <div class="lab-cmd"><span class="num">_</span> bcftools call -v variantes.bcf > variantes.vcf</div>
        </div>
        <input type="text" id="lab-pipeline-input" placeholder="Orden: 3,1,2,4,5">
        <button onclick="checkLabPipeline()">Verificar</button>
        <div id="lab-pipeline-feedback" class="feedback hidden"></div>
      </div>
      
      <div class="lab-section">
        <h4>🐛 Laboratorio: Encuentra el error</h4>
        <p>Corrige los siguientes comandos incorrectos:</p>
        
        <div class="error-item">
          <code class="wrong">ls -I *.fastq</code>
          <input type="text" id="fix1-input" placeholder="Corrección">
          <button onclick="checkFix1()">Verificar</button>
          <div id="fix1-feedback" class="feedback hidden"></div>
        </div>
        
        <div class="error-item">
          <code class="wrong">gzip -d archivo.fastq.gz > archivo.fastq</code>
          <input type="text" id="fix2-input" placeholder="Corrección">
          <button onclick="checkFix2()">Verificar</button>
          <div id="fix2-feedback" class="feedback hidden"></div>
        </div>
      </div>
    </div>
  `;
}

// Renderizar Quiz
function renderCLIQuiz() {
  const questions = [
    {
      q: "¿Qué comando cuenta las líneas de un archivo?",
      options: ["wc -l archivo", "count archivo", "lines archivo"]
    },
    {
      q: "¿Para qué sirve el flag -h en ls?",
      options: ["Muestra tamaños legibles", "Muestra archivos ocultos", "Ordena por fecha"]
    },
    {
      q: "¿Cómo visualizas un archivo .gz sin descomprimirlo?",
      options: ["zcat archivo.gz | head", "cat archivo.gz", "unzip archivo.gz"]
    },
    {
      q: "¿Qué comando filtra columnas específicas de un TSV?",
      options: ["cut -f1,3 archivo.tsv", "filter -c archivo.tsv", "select -col archivo.tsv"]
    },
    {
      q: "¿Cuál es el propósito de samtools flagstat?",
      options: ["Mostrar estadísticas de mapeo", "Convertir BAM a SAM", "Indexar archivos"]
    }
  ];
  const answers = [0, 0, 0, 0, 0];

  return `
    <div class="cli-quiz">
      ${questions.map((q, i) => `
        <div class="quiz-q">
          <p><strong>Pregunta ${i+1}:</strong> ${q.q}</p>
          <div class="quiz-opts">
            ${q.options.map((opt, j) => `
              <button class="quiz-opt" data-q="${i}" data-a="${j}" data-correct="${j === answers[i]}">${opt}</button>
            `).join('')}
          </div>
          <div id="quiz-fb-${i}" class="quiz-feedback hidden"></div>
        </div>
      `).join('')}
    </div>
  `;
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
      ? '<span class="status">Módulo completado</span>'
      : ""
  }
</div>
`;
}

function setFeedback(el, ok, msg) {
  el.hidden = false;
  el.classList.remove("ok", "err");
  el.classList.add(ok ? "ok" : "err");
  el.textContent = msg;
}

// ============================================
// HANDLERS DE EVENTOS
// ============================================

function attachModuleHandlers(moduleKey) {
  if (moduleKey === "cli") {
    // Handlers para los tabs
    document.querySelectorAll('.cli-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.cli-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.cli-tab-content').forEach(c => c.classList.add('hidden'));
        tab.classList.add('active');
        document.getElementById('cliTab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)).classList.remove('hidden');
      });
    });

    // Explorador de comandos
    const cmdSelect = document.getElementById('cliCommandSelect');
    if (cmdSelect) {
      cmdSelect.addEventListener('change', (e) => {
        const cmd = cliCommandCatalog[e.target.value];
        document.getElementById('cliCommandDetails').innerHTML = `
          <div class="cmd-detail-card">
            <code class="cmd-title">${cmd.cmd}</code>
            <code class="cmd-syntax">${cmd.syntax}</code>
            <p>${cmd.detail}</p>
            <p class="cmd-bio"><strong>🐸 Ejemplo:</strong> ${cmd.bioExample}</p>
          </div>
        `;
      });
      // Trigger first
      cmdSelect.dispatchEvent(new Event('change'));
    }

    // Terminal simulada
    const termSelect = document.getElementById('cliTerminalSelect');
    const runBtn = document.getElementById('cliRunBtn');
    if (termSelect && runBtn) {
      runBtn.addEventListener('click', () => {
        const cmd = termSelect.value;
        const output = cliSimulatedOutput[cmd] || 'Comando no reconocido';
        document.getElementById('cliTerminalOutput').textContent = `$ ${cmd}\n${output}`;
      });
    }

    // Quiz handlers
    document.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const q = e.target.dataset.q;
        const fb = document.getElementById('quiz-fb-' + q);
        const isCorrect = e.target.dataset.correct === 'true';
        
        e.target.parentElement.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
        
        fb.classList.remove('hidden');
        if (isCorrect) {
          fb.textContent = '✅ ¡Correcto!';
          fb.className = 'quiz-feedback correct';
        } else {
          fb.textContent = '❌ Incorrecto';
          fb.className = 'quiz-feedback incorrect';
        }
      });
    });
  }

  // Handlers para otros módulos
  if (moduleKey === "db") {
    const btn = document.getElementById("dbBuildBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        const gene = document.getElementById("geneInput").value.trim();
        const organism = document.getElementById("organismInput").value.trim();
        const result = document.getElementById("dbResult");
        if (!gene || !organism) {
          result.textContent = "Completa ambos campos.";
          return;
        }
        result.textContent = `"${gene}" AND "${organism}"[Organism]`;
      });
    }
  }

  if (moduleKey === "genomics") {
    const btn = document.getElementById("genomicsCheckBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        const val = document.getElementById("genomicsOrder").value.toLowerCase().replace(/\s+/g, "");
        const fb = document.getElementById("genomicsFeedback");
        const target = "qc,trimming,alignment,variantcalling,annotation";
        setFeedback(fb, val === target, val === target ? "¡Correcto!" : "Orden: QC, trimming, alignment, variant calling, annotation");
      });
    }
  }

  if (moduleKey === "phylo") {
    const btn = document.getElementById("phyloCheckBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        const val = document.getElementById("bootstrapInput").value.toLowerCase();
        const fb = document.getElementById("phyloFeedback");
        const ok = val.includes("alto") || val.includes("confiable") || val.includes("soporte");
        setFeedback(fb, ok, ok ? "¡Correcto! Bootstrap 95 = alto soporte." : "Pista: bootstrap alto = nodo confiable");
      });
    }
  }

  // Quiz buttons
  document.querySelectorAll(".quizOptionBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const isCorrect = btn.dataset.correct === "true";
      const module = btn.dataset.module;
      const fb = document.getElementById("quizFeedback");
      if (isCorrect) {
        setFeedback(fb, true, "¡Respuesta correcta! Módulo completado.");
        markModuleDone(module);
      } else {
        setFeedback(fb, false, "Intenta de nuevo.");
      }
    });
  });
}

// Funciones de verificación de ejercicios
window.checkEx1 = function() {
  const input = document.getElementById('ex1-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex1-feedback');
  const ok = input.includes('grep') && input.includes('^>') && input.includes('wc -l');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: grep "^>" archivo.fasta | wc -l'; fb.className = 'feedback err'; }
};

window.checkEx2 = function() {
  const input = document.getElementById('ex2-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex2-feedback');
  const ok = input.includes('zcat') && input.includes('head') && (input.includes('-n 12') || input.includes('-12'));
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: zcat archivo.fastq.gz | head -n 12'; fb.className = 'feedback err'; }
};

window.checkEx3 = function() {
  const input = document.getElementById('ex3-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex3-feedback');
  const ok = input.includes('find') && input.includes('.fastq.gz');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: find . -name "*.fastq.gz"'; fb.className = 'feedback err'; }
};

window.checkEx4 = function() {
  const input = document.getElementById('ex4-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex4-feedback');
  const ok = input.includes('awk') && input.includes('$6') && input.includes('100');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: awk \'$6 > 100 {print}\' archivo'; fb.className = 'feedback err'; }
};

window.checkLabPipeline = function() {
  const input = document.getElementById('lab-pipeline-input').value.replace(/\s/g, '');
  const fb = document.getElementById('lab-pipeline-feedback');
  // Orden correcto: mkdir (1), fastqc (2), bwa (3), samtools sort (4), bcftools (5)
  const ok = input === '1,2,3,4,5' || input === '1,2,3,4,5' || input === '2,1,3,4,5';
  fb.classList.remove('hidden');
  if (ok || input === '2,1,3,4,5') { fb.textContent = '✅ Pipeline correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Orden: mkdir → fastqc → bwa → samtools sort → bcftools'; fb.className = 'feedback err'; }
};

window.checkFix1 = function() {
  const input = document.getElementById('fix1-input').value.trim();
  const fb = document.getElementById('fix1-feedback');
  fb.classList.remove('hidden');
  if (input === 'ls -l *.fastq') { fb.textContent = '✅ Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ La opción correcta es -l'; fb.className = 'feedback err'; }
};

window.checkFix2 = function() {
  const input = document.getElementById('fix2-input').value.trim();
  const fb = document.getElementById('fix2-feedback');
  fb.classList.remove('hidden');
  if (input === 'gunzip archivo.fastq.gz') { fb.textContent = '✅ Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ El comando correcto es gunzip'; fb.className = 'feedback err'; }
};

// Nuevos ejercicios
window.checkEx5 = function() {
  const input = document.getElementById('ex5-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex5-feedback');
  const ok = input === 'df -h';
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! df -h muestra espacio en formato legible'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: df -h'; fb.className = 'feedback err'; }
};

window.checkEx6 = function() {
  const input = document.getElementById('ex6-input').value.replace(/\s/g, '').replace(/,/g, '');
  const fb = document.getElementById('ex6-feedback');
  const ok = input === '1200000' || input === '1200000reads' || input === '1200000reads';
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! 4800000 / 4 = 1,200,000 reads'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Divide entre 4: 4800000 ÷ 4 = ?'; fb.className = 'feedback err'; }
};

// Terminal virtual interactivo con más comandos
const terminalCommands = {
  // Navegación
  'pwd': '/home/bioinfo/proyectos/microbioma_2026',
  'ls': 'raw_data\nresults\nmetadata.tsv\nREADME.md',
  'ls -lah': 'drwxr-xr-x  5 bioinfo bioinfo  128 Jan 15 10:30 .\ndrwxr-xr-x  1 bioinfo bioinfo   64 Jan 15 10:30 ..\n-rw-r--r--  1 bioinfo bioinfo  2.1G Jan 15 10:25 PAC001_R1.fastq.gz\n-rw-r--r--  1 bioinfo bioinfo  156K Jan 15 10:26 metadata.tsv',
  'ls -l': 'total 128\n-rw-r--r-- 1 bioinfo bioinfo  2.1G Jan 15 10:25 PAC001_R1.fastq.gz\n-rw-r--r-- 1 bioinfo bioinfo  156K Jan 15 10:26 metadata.tsv',
  'cd': '(cambia al directorio especificado)',
  'cd results': '(sin salida - cambia de directorio)',
  'mkdir': '(crea el directorio)',
  'mkdir -p': '(crea directorios anidados)',
  
  // Archivos
  'cat': 'sample_id\tpatient\tcondition\nPAC001\ttumor\tcontrol\nPAC002\twildtype\ttreatment',
  'head': '@SEQ001\nGATCGATCGATCGATCGATCG+\n+\nIIIIIIIIIIIIIIIIIIIII\n@SEQ002\nGCTAGCTAGCTAGCTAGCTA+\n+\nJJJJJJJJJJJJJJJJJJJJ',
  'head -n 4': '@SEQ001\nGATCGATCGATCGATCGATCG+\n+\nIIIIIIIIIIIIIIIIIIIII',
  'head -n 8': '@SEQ001\nGATCGATCGATCGATCGATCG+\n+\nIIIIIIIIIIIIIIIIIIIII\n@SEQ002\nGCTAGCTAGCTAGCTAGCTA+\n+\nJJJJJJJJJJJJJJJJJJJJ',
  'tail': 'last line of file\nmetadata here\nresult data',
  'tail -n 5': '...result data\nlast line',
  'less': '(abre el visor interactivo - usa flechas para navegar, q para salir)',
  'wc': '4800000 secuencias.fastq',
  'wc -l': '4800000 secuencias.fastq',
  'wc -w': '9600000 secuencias.fastq',
  
  // Búsqueda
  'grep': 'usage: grep [OPTIONS] PATTERN [FILE]',
  'grep ^> secuencias.fasta': '>seq_001\n>seq_002\n>seq_003\n... (245 secuencias)',
  'find': './raw_data/PAC001_R1.fastq.gz\n./raw_data/PAC001_R2.fastq.gz\n./results/aligned.bam',
  'find . -name "*.fastq.gz"': './raw_data/PAC001_R1.fastq.gz\n./raw_data/PAC001_R2.fastq.gz',
  'find . -name "*.bam"': './results/alignment/sample.bam',
  
  // Procesamiento
  'awk': '(requiere condición y acción)',
  'awk \'$6 > 100\'': 'seq_001 478\nseq_014 301\nseq_099 210',
  'cut': 'column1\tcolumn2\tcolumn3\ndata1\tdata2\tdata3',
  'cut -f1,6': 'CHROM\tQUAL\nchr1\t120\nchr1\t95',
  'sort': 'data1\ndata2\ndata3',
  'sort -k2,2n': 'sorted output',
  'uniq': '(requiere sort previo)',
  'sed': '(editor de flujo)',
  
  // Compresión
  'zcat': '@SEQ001\nGATCGATCGATCGATCGATCG+\n+\nIIIIIIIIIIIIIIIIIIIII',
  'gzip': '(comprime archivo)',
  'gunzip': '(descomprime archivo)',
  'tar': 'resultados/\nresultados/qc/\nresultados/variants/',
  
  // Sistema
  'df -h': 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda2       500G  320G  180G  64% /home/bioinfo',
  'df': 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sda2      524288000  335544000  188743680  64% /home/bioinfo',
  'du -sh': '4.2G\tresultados',
  'du -sh *': '780M\tqc\n4.2G\talignment\n120M\tvariants',
  'free -m': '              total    used    free  shared  buff/cache   available\nMem:           32000   18000    8000     512       6000      12000',
  'free': '              total    used    free  shared  buff/cache   available\nMem:        32768000 18432000  8192000   524288    6144000   12288000',
  'ps': '  PID TTY          TIME CMD\n18230 ?        00:00:00 bash\n18231 ?        00:05:12 bwa',
  'ps -eaf': 'UID        PID  PPID  C STIME TTY          TIME CMD\nbioinfo   18230     1  0 14:25 ?        00:00:00 /bin/bash\nbioinfo   18231 18230 35 14:25 ?        00:05:12 bwa mem',
  'top': 'top - 14:30:25 up 45 days,  3:22,  2 users,  load average: 1.23, 1.45, 1.67\nTasks: 245 total,   1 running, 244 sleeping\n%Cpu(s): 12.5 us,  2.3 sy,  0.0 ni, 85.2 id,  0.0 wa\nMiB Mem :  32000.0 total,   8000.0 free,  18000.0 used,   6000.0 buff/cache',
  
  // Red
  'wget': '--2024-01-15 14:30:00--  https://example.org/genome.fa.gz\nResolving... connected.\nHTTP request sent, awaiting response... 200 OK\nSaving to: genome.fa.gz',
  'curl': 'download progress or API response',
  
  // Genómica
  'samtools': 'Usage: samtools <command> [options]',
  'samtools flagstat': '2450000 + 0 in total\n2300000 + 0 mapped (93.88%)\n120000 + 0 duplicate (4.90%)',
  'samtools view': '(convierte/filtrar BAM/SAM)',
  'bcftools': 'Usage: bcftools <command> [options]',
  'fastqc': 'Started analysis of PAC001_R1.fastq.gz\nApproximate read length: 150bp\nTotal Sequences: 12345678\nGC: 42%',
  
  // Utilidades
  'man': 'manual pages',
  'man ls': '(muestra el manual del comando ls)',
  'whoami': 'bioinfo',
  'date': 'Fri Jan 15 14:30:00 UTC 2024',
  'history': '  184  grep "^>" secuencias.fasta | wc -l\n  185  zcat PAC001_R1.fastq.gz | head',
  'which': '/usr/bin/ls',
  'hostname': 'bioinfo-server',
  
  // Comandos de bioinformática específicos
  'fastq': '(formato de secuenciación: 4 líneas por read)',
  'fasta': '>seq_001 descripcion\nATCGATCGATCGATCG...',
  'bwa': 'Usage: bwa mem [options] <reference.fa> <reads.fq> [reads2.fq]',
  'bowtie2': 'Usage: bowtie2 [options]* -x <bt2-idx> -U <reads> -S <output>',
  'hisat2': 'Usage: hisat2 [options]* -x <ht2-idx> -U <reads> -S <output>'
};

window.runTerminalCommand = function() {
  const input = document.getElementById('terminalInput').value.trim();
  const output = document.getElementById('terminalOutput');
  
  if (!input) return;
  
  let result = terminalCommands[input.toLowerCase()] || `bash: ${input}: command not found`;
  
  output.innerHTML = `
    <div class="terminal-history">
      <div class="terminal-cmd">$ ${input}</div>
      <div class="terminal-result">${result}</div>
    </div>
    <div class="terminal-current">
      <span class="prompt">$</span> <span class="cursor">_</span>
    </div>
  `;
  
  document.getElementById('terminalInput').value = '';
};

// Permitir ENTER en terminal
document.addEventListener('DOMContentLoaded', function() {
  const termInput = document.getElementById('terminalInput');
  if (termInput) {
    termInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        window.runTerminalCommand();
      }
    });
  }
});

// ============================================
// INICIALIZACIÓN
// ============================================

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

function renderModulesList() {
  const container = document.getElementById("moduleContent");
  container.classList.add("hidden");
  container.innerHTML = "";
  container.style.display = "";
}

window.renderModulesList = renderModulesList;

function init() {
  loadState();
  updateProgressUI();
  bindGlobalEvents();
  console.log("BioInteractiva v2 - CLI Module Enhanced");
}

document.addEventListener("DOMContentLoaded", init);
