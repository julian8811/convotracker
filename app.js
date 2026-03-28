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
  'less archivo': 'captures/less-archivo.svg',
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
  'chgrp': 'captures/chgrp.svg',
  'chgrp grupo archivo': 'captures/chgrp.svg',

  // Genómica
  'samtools': 'captures/samtools-flagstat.svg',
  'samtools flagstat': 'captures/samtools-flagstat.svg',
  'bcftools': 'captures/bcftools.svg',
  'bcftools view': 'captures/bcftools.svg',
  "bcftools view -i 'QUAL>=30 && DP>=10' variants.vcf.gz | head": 'captures/bcftools-view-i-head.svg',
  'fastqc': 'captures/fastqc.svg',
  'fastqc archivo.fastq.gz': 'captures/fastqc.svg'
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
    category: "Genómica",
    syntax: "samtools flagstat archivo.bam",
    detail:
      "Resumen de calidad y mapeo de lecturas alineadas. Muestra % mapeo, duplicados, etc.",
    bioExample: "samtools flagstat mapped.bam"
  },
  {
    cmd: "bcftools",
    category: "Genómica",
    syntax: "bcftools view -i 'QUAL>=20' variantes.vcf.gz",
    detail:
      "Filtra variantes por calidad, profundidad o cualquier campo del VCF.",
    bioExample: "bcftools view -i 'QUAL>=30 && DP>=10' variants.vcf.gz | head"
  },
  {
    cmd: "fastqc",
    category: "Genómica",
    syntax: "fastqc archivo.fastq.gz",
    detail:
      "Control de calidad de lecturas. Analiza Phred score, contenido GC, adaptadores.",
    bioExample: "fastqc raw_data/*.fastq.gz -o results/qc/"
  },
  {
    cmd: "zcat",
    category: "Compresion",
    syntax: "zcat archivo.gz",
    detail:
      "Visualiza archivos comprimidos sin descomprimir. Esencial para FastQ y VCF en formato .gz.",
    bioExample: "zcat muestra.fastq.gz | head -n 8"
  },
  {
    cmd: "gunzip",
    category: "Compresion",
    syntax: "gunzip archivo.gz",
    detail:
      "Descomprime archivos .gz. Crea versión sin comprimir.",
    bioExample: "gunzip variantes.vcf.gz"
  },
  {
    cmd: "tar",
    category: "Compresion",
    syntax: "tar -czvf archivo.tar.gz carpeta/",
    detail:
      "Empaqueta y comprime carpetas. Estándar para distribuir conjuntos de datos.",
    bioExample: "tar -czvf analisis_2026.tar.gz resultados/"
  },
  {
    cmd: "bwa",
    category: "Genómica",
    syntax: "bwa mem ref.fa reads.fq > alineamiento.sam",
    detail:
      "Alineador de lecturas cortas/medias contra genoma de referencia. Rápido y preciso.",
    bioExample: "bwa mem hg38.fa PAC001_R1.fq PAC001_R2.fq > PAC001.sam"
  },
  {
    cmd: "samtools sort",
    category: "Genómica",
    syntax: "samtools sort archivo.sam -o archivo.bam",
    detail:
      "Ordena archivos BAM por posición genómica. Requiere para meisten operaciones.",
    bioExample: "samtools sort alineamiento.sam -o alineamiento.bam"
  },
  {
    cmd: "samtools index",
    category: "Genómica",
    syntax: "samtools index archivo.bam",
    detail:
      "Crea índice .bai para acceso rápido a regiones específicas del BAM.",
    bioExample: "samtools index mapped.bam"
  },
  {
    cmd: "fastp",
    category: "Genómica",
    syntax: "fastp -i lectura.fq -o lectura_clean.fq",
    detail:
      "Filtrado y control de calidad todo-en-uno. Detecta adaptadores, recorta calidad.",
    bioExample: "fastp -i R1.fq -o R1_clean.fq --detect_adapter_for_pe"
  },
  {
    cmd: "seqkit",
    category: "Genómica",
    syntax: "seqkit stat archivo.fasta",
    detail:
      "Kit de herramientas para secuencias FASTA/FASTQ. Estadísticas, formato, filtering.",
    bioExample: "seqkit stat referencia.fa"
  },
  {
    cmd: "bedtools",
    category: "Genómica",
    syntax: "bedtools intersect -a genes.bed -b variantes.vcf",
    detail:
      "Operaciones de genómica intervals. Intersectar variantes con genes, annotaciones.",
    bioExample: "bedtools intersect -a variantes.vcf -b promotores.bed > var_en_promotores.vcf"
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
    return true;
  }
  return false;
}

// Función expuesta globally para botones de completar módulo
window.completeModule = function(moduleKey) {
  const moduleNames = { cli: 'Línea de Comando', db: 'Bases de Datos', genomics: 'Genómica', phylo: 'Filogenética' };
  
  if (state.completed[moduleKey]) {
    alert(`✅ Ya completaste el módulo de ${moduleNames[moduleKey]}`);
    return;
  }
  
  const confirmed = confirm(`¿Marcar como completado el módulo de ${moduleNames[moduleKey]}?\n\n¡Ganarás 25 puntos!`);
  if (confirmed) {
    markModuleDone(moduleKey);
    alert(`🎉 ¡Felicitaciones! Has completado el módulo de ${moduleNames[moduleKey]}!\n\nPuntos: +25`);
    
    // Actualizar la vista del módulo actual
    renderModule(moduleKey);
  }
};

// ============================================
// RENDERIZADO DE MÓDULOS
// ============================================

// ============================================
   // MÓDULOS ENHANCED PARA DB, GENOMICS Y PHYLO
// ============================================

// ---------- MÓDULO 2: BASES DE DATOS BIOLÓGICAS ----------

function renderDBLesson() {
  return `
    <div class="lesson db-intro">
      <h3>🔬 ¿Por qué aprender a buscar en bases de datos biológicas?</h3>
      <p>Las bases de datos biológicas contienen millones de secuencias, estructuras proteicas, expresiones génicas y más. Saber consultarlas eficientemente es una habilidad fundamental para cualquier bioinformático.</p>
      
      <h4>📊 Principales bases de datos:</h4>
      <div class="db-grid">
        <div class="db-card">
          <h5>🧬 NCBI (National Center for Biotechnology Information)</h5>
          <p>Incluye GenBank, RefSeq, PubMed, BLAST. La base más completa.</p>
          <code>https://www.ncbi.nlm.nih.gov/</code>
          <div class="db-tags">
            <span class="tag">Secuencias</span>
            <span class="tag">Literatura</span>
            <span class="tag">BLAST</span>
          </div>
        </div>
        <div class="db-card">
          <h5>🧪 UniProt</h5>
          <p>Proteínas curadas manualmente. Anotaciones funcionales de alta calidad.</p>
          <code>https://www.uniprot.org/</code>
          <div class="db-tags">
            <span class="tag">Proteínas</span>
            <span class="tag">Anotación</span>
            <span class="tag">GO Terms</span>
          </div>
        </div>
        <div class="db-card">
          <h5>🧬 ENA (European Nucleotide Archive)</h5>
          <p>Secuencias de nucleótidos de Europa. SRA para reads crudos.</p>
          <code>https://www.ebi.ac.uk/ena/</code>
          <div class="db-tags">
            <span class="tag">Nucleótidos</span>
            <span class="tag">SRA</span>
            <span class="tag">Reads</span>
          </div>
        </div>
        <div class="db-card">
          <h5>🧬 PDB (Protein Data Bank)</h5>
          <p>Estructuras 3D de proteínas y ácidos nucleicos.</p>
          <code>https://www.rcsb.org/</code>
          <div class="db-tags">
            <span class="tag">Estructura 3D</span>
            <span class="tag">Cristalografía</span>
            <span class="tag">Cryo-EM</span>
          </div>
        </div>
        <div class="db-card">
          <h5>🧬 Ensembl</h5>
          <p>Genomas de eukaryotas. Anotaciones de genes, variantes, expresión.</p>
          <code>https://www.ensembl.org/</code>
          <div class="db-tags">
            <span class="tag">Genomas</span>
            <span class="tag">Variantes</span>
            <span class="tag">Expresión</span>
          </div>
        </div>
        <div class="db-card">
          <h5>🧬 UCSC Genome Browser</h5>
          <p>Genomas de referencia con track de anotaciones visuales.</p>
          <code>https://genome.ucsc.edu/</code>
          <div class="db-tags">
            <span class="tag">Visualización</span>
            <span class="tag">Tracks</span>
            <span class="tag">IGV</span>
          </div>
        </div>
        <div class="db-card">
          <h5>📊 GTEx</h5>
          <p>Base de datos de expresión génica por tejido.</p>
          <code>https://gtexportal.org/</code>
          <div class="db-tags">
            <span class="tag">Expresión</span>
            <span class="tag">RNA-seq</span>
            <span class="tag">Tejidos</span>
          </div>
        </div>
        <div class="db-card">
          <h5>🧬 GEO (Gene Expression Omnibus)</h5>
          <p>Repositorio público de datos de expresión y microarrays.</p>
          <code>https://www.ncbi.nlm.nih.gov/geo/</code>
          <div class="db-tags">
            <span class="tag">Microarrays</span>
            <span class="tag">RNA-seq</span>
            <span class="tag">Series</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Guía de Operadores -->
    <div class="lesson">
      <h3>🔍 Guía de Operadores de Búsqueda</h3>
      <p>Domina los operadores para hacer búsquedas precisas:</p>
      
      <div class="operators-grid">
        <div class="operator-card">
          <code class="op-code">AND</code>
          <p>Ambas condiciones</p>
          <code>BRCA1 AND cancer</code>
          <span class="op-result">→ Solo resultados con ambas palabras</span>
        </div>
        <div class="operator-card">
          <code class="op-code">OR</code>
          <p>Cualquiera de las condiciones</p>
          <code>BRCA1 OR BRCA2</code>
          <span class="op-result">→ Resultados con cualquiera</span>
        </div>
        <div class="operator-card">
          <code class="op-code">NOT</code>
          <p>Excluir término</p>
          <code>cancer NOT melanoma</code>
          <span class="op-result">→ Cancer sin melanoma</span>
        </div>
        <div class="operator-card">
          <code class="op-code">[Field]</code>
          <p>Buscar en campo específico</p>
          <code>BRCA1[Gene]</code>
          <span class="op-result">→ Solo en campo Gen</span>
        </div>
        <div class="operator-card">
          <code class="op-code">"phrase"</code>
          <p>Buscar frase exacta</p>
          <code>"breast cancer"</code>
          <span class="op-result">→ Frase exacta</span>
        </div>
        <div class="operator-card">
          <code class="op-code">:</code>
          <p>Rango o taxonomía</p>
          <code>txid9606[Organism]</code>
          <span class="op-result">→ Humano (TaxID 9606)</span>
        </div>
        <div class="operator-card">
          <code class="op-code">[tiab]</code>
          <p>Título y abstract</p>
          <code>COVID[tit] OR COVID[abs]</code>
          <span class="op-result">→ En título o abstract</span>
        </div>
        <div class="operator-card">
          <code class="op-code">*</code>
          <p>Comodín para sufijos</p>
          <code>genom*</code>
          <span class="op-result">→ genome, genomic, genomics</span>
        </div>
      </div>
    </div>

    <!-- Comparador de Bases de Datos -->
    <div class="lesson">
      <h3>📊 Comparador de Bases de Datos</h3>
      <div class="db-compare-table">
        <table>
          <thead>
            <tr>
              <th>Base de Datos</th>
              <th>Tipo de Datos</th>
              <th>Cobertura</th>
              <th>API</th>
              <th>Mejor Para</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>NCBI GenBank</strong></td>
              <td>Secuencias DNA/RNA</td>
              <td>Millones</td>
              <td>✓ E-utilities</td>
              <td>Búsqueda general</td>
            </tr>
            <tr>
              <td><strong>UniProt</strong></td>
              <td>Proteínas</td>
              <td>200M+</td>
              <td>✓ REST API</td>
              <td>Proteínas y función</td>
            </tr>
            <tr>
              <td><strong>ENA</strong></td>
              <td>Reads crudos</td>
              <td>Exabytes</td>
              <td>✓ ENA API</td>
              <td>Datos crudos NGS</td>
            </tr>
            <tr>
              <td><strong>PDB</strong></td>
              <td>Estructuras 3D</td>
              <td>200K+</td>
              <td>✓ RCSB API</td>
              <td>Estructura proteica</td>
            </tr>
            <tr>
              <td><strong>Ensembl</strong></td>
              <td>Genomas eukariotas</td>
              <td>200+ especies</td>
              <td>✓ REST API</td>
              <td>Anotación génica</td>
            </tr>
            <tr>
              <td><strong>GTEx</strong></td>
              <td>Expresión génica</td>
              <td>50K+ muestras</td>
              <td>✓ API</td>
              <td>Expresión por tejido</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="lesson">
      <h3>📚 Ejemplos de Consultas Avanzadas</h3>
      <div class="code"># NCBI - Gen específico en organismo
"BRCA1[Gene] AND Homo sapiens[Organism]"

# NCBI - Secuencias de un taxón
txid9606[Organism:exp] AND mRNA[Properties]

# NCBI - Artículos de los últimos 5 años
COVID-19[Title/Abstract] AND ("2020/01/01"[PDAT] : "2025"[PDAT])

# UniProt - Proteínas de humano con GO específico
organism:"Homo sapiens" AND keyword:"DNA repair" AND reviewed:true

# ENA - Reads de secuenciación
taxon:(Homo sapiens) AND instrument_model:"Illumina"

# Ensembl - Variantes en un gen
POST /variant_recoder/human?rs_ids=rs699</div>
    </div>

    <div class="lesson">
      <h3>📚 Recursos adicionales</h3>
      <ul>
        <li><a href="https://www.ncbi.nlm.nih.gov/books/NBK25497/" target="_blank">Tutorial NCBI E-utilities</a></li>
        <li><a href="https://www.uniprot.org/help/api" target="_blank">UniProt API</a></li>
        <li><a href="https://www.ebi.ac.uk/ena/browser/api" target="_blank">ENA API</a></li>
        <li><a href="https://www.ensembl.org/info/data/api.html" target="_blank">Ensembl API</a></li>
      </ul>
    </div>
  `;
}

function renderDBInteractive() {
  return `
    <!-- Constructor de Consultas Avanzado -->
    <div class="interactive db-query-builder-enhanced">
      <h4>🛠️ Constructor de Consultas NCBI</h4>
      <p>Construye tu consulta paso a paso:</p>
      
      <div class="query-builder-steps">
        <div class="query-step">
          <label>🎯 Término de búsqueda:</label>
          <input type="text" id="dbGene" placeholder="Ej: BRCA1, cytochrome c oxidase">
          <span class="query-help">Palabra clave o nombre del gen/proteína</span>
        </div>
        
        <div class="query-step">
          <label>🔬 Organismo:</label>
          <input type="text" id="dbOrganism" placeholder="Ej: Homo sapiens, yeast">
          <span class="query-help">Nombre común o taxid (ej: 9606)</span>
        </div>
        
        <div class="query-step">
          <label>📂 Base de datos:</label>
          <select id="dbSelect">
            <option value="nucleotide">🧬 Nucleotide (GenBank)</option>
            <option value="protein">🧪 Protein (UniProt)</option>
            <option value="pubmed">📚 PubMed</option>
            <option value="structure">🧬 Structure (PDB)</option>
            <option value="gene">🧬 Gene</option>
            <option value="geo">📊 GEO (Expression)</option>
          </select>
        </div>
        
        <div class="query-step">
          <label>⚙️ Filtros adicionales:</label>
          <div class="filter-checks">
            <label><input type="checkbox" id="filterReviewed"> Solo revisados</label>
            <label><input type="checkbox" id="filterProtein"> Solo proteínas</label>
            <label><input type="checkbox" id="filterGenome"> Genoma completo</label>
          </div>
        </div>
        
        <button class="query-build-btn" onclick="buildDBQuery()">🔨 Generar Consulta</button>
        
        <div id="dbQueryResult" class="query-result code"></div>
        
        <div class="query-preview">
          <h5>📋 Consulta generada:</h5>
          <code id="queryPreviewText">Aún no hay consulta</code>
        </div>
      </div>
    </div>

    <!-- Ejercicios de Consulta -->
    <div class="lesson">
      <h4>✏️ Ejercicios de Consulta</h4>
      
      <div class="exercise-card">
        <h5>✏️ Ejercicio 1: Consulta básica</h5>
        <p>Escribe una consulta para buscar el gen "cytochrome c" en humanos:</p>
        <input type="text" id="exDB1" placeholder='"cytochrome c"[Gene] AND Homo sapiens[Organism]'>
        <button onclick="checkDBEx1()">Verificar</button>
        <div id="dbEx1Feedback" class="feedback hidden"></div>
      </div>
      
      <div class="exercise-card">
        <h5>✏️ Ejercicio 2: Operador AND</h5>
        <p>Busca proteínas relacionadas con "DNA repair" en yeast (Saccharomyces cerevisiae):</p>
        <input type="text" id="exDB2" placeholder='"DNA repair"[Keyword] AND "Saccharomyces cerevisiae"[Organism]'>
        <button onclick="checkDBEx2()">Verificar</button>
        <div id="dbEx2Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 3: Operador OR</h5>
        <p>Busca secuencias de BRCA1 o BRCA2 en humano:</p>
        <input type="text" id="exDB3" placeholder='(BRCA1 OR BRCA2) AND Homo sapiens[Organism]'>
        <button onclick="checkDBEx3()">Verificar</button>
        <div id="dbEx3Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 4: Campo específico</h5>
        <p>Busca artículos sobre COVID-19 en el título:</p>
        <input type="text" id="exDB4" placeholder='COVID-19[Title]'>
        <button onclick="checkDBEx4()">Verificar</button>
        <div id="dbEx4Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 5: Rango de fechas</h5>
        <p>Busca artículos de 2020 a 2023 sobre SARS-CoV-2:</p>
        <input type="text" id="exDB5" placeholder='SARS-CoV-2[Title/Abstract] AND ("2020/01/01"[PDAT] : "2023/12/31"[PDAT])'>
        <button onclick="checkDBEx5()">Verificar</button>
        <div id="dbEx5Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 6: TaxID</h5>
        <p>Usa el TaxID (9606) para buscar secuencias en humano:</p>
        <input type="text" id="exDB6" placeholder='txid9606[Organism:exp]'>
        <button onclick="checkDBEx6()">Verificar</button>
        <div id="dbEx6Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 7: UniProt</h5>
        <p>Busca proteínas de Arabidopsis con GO "photosynthesis":</p>
        <input type="text" id="exDB7" placeholder='organism:"Arabidopsis thaliana" AND photosynthesis'>
        <button onclick="checkDBEx7()">Verificar</button>
        <div id="dbEx7Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 8: PDB</h5>
        <p>Busca estructuras de hemoglobina:</p>
        <input type="text" id="exDB8" placeholder='hemoglobin[Title]'>
        <button onclick="checkDBEx8()">Verificar</button>
        <div id="dbEx8Feedback" class="feedback hidden"></div>
      </div>
    </div>

    <!-- Simulador de Búsqueda -->
    <div class="lesson simulator-section">
      <h4>🌐 Simulador de Búsqueda</h4>
      <p>Practica con búsquedas simuladas en diferentes bases de datos:</p>
      
      <div class="sim-search-box">
        <input type="text" id="dbSimInput" placeholder="Escribe tu búsqueda...">
        <select id="dbSimSelect">
          <option value="ncbi">NCBI GenBank</option>
          <option value="uniprot">UniProt</option>
          <option value="pdb">PDB</option>
          <option value="pubmed">PubMed</option>
        </select>
        <button onclick="simulateDBSearch()">🔍 Buscar</button>
      </div>
      
      <div id="dbSimResult" class="sim-result code"></div>
    </div>

    <!-- Explorador de Resultados -->
    <div class="lesson">
      <h4>📊 Explorador de Resultados Simulado</h4>
      <div class="results-explorer">
        <div class="result-item">
          <span class="result-type">🧬 GenBank</span>
          <code>NM_001007.1</code>
          <p>Cytochrome c oxidase subunit I - Homo sapiens</p>
        </div>
        <div class="result-item">
          <span class="result-type">🧪 UniProt</span>
          <code>P99999</code>
          <p>Cytochrome c - Arabidopsis thaliana</p>
        </div>
        <div class="result-item">
          <span class="result-type">📚 PubMed</span>
          <code>PMID: 12345678</code>
          <p>Role of cytochrome c in apoptosis</p>
        </div>
        <div class="result-item">
          <span class="result-type">🧬 PDB</span>
          <code>7XYZ</code>
          <p>Crystal structure of cytochrome c oxidase</p>
        </div>
      </div>
    </div>
  `;
}

function renderDBQuiz() {
  const questions = [
    { q: "¿Qué base de datos contiene secuencias de nucleótidos?", options: ["UniProt", "NCBI GenBank", "PDB"], correct: 1 },
    { q: "¿Qué operador une términos en NCBI?", options: ["AND", "PLUS", "JOIN"], correct: 0 },
    { q: "¿Cuál es la base de datos de estructuras proteicas?", options: ["UniProt", "PDB", "ENA"], correct: 1 },
    { q: "¿Qué significa el filtro [Organism]?", options: ["Filtrar por organismo", "Filtrar por fecha", "Filtrar por tamaño"], correct: 0 },
    { q: "¿Cuál API permite acceso programático a UniProt?", options: ["BLAST", "REST API", "FTP"], correct: 1 },
    { q: "¿Qué base de datos contiene datos de expresión génica?", options: ["PDB", "GEO", "ENA"], correct: 1 },
    { q: "¿Qué significa el operador NOT en una búsqueda?", options: ["Incluir ambos términos", "Excluir un término", "Buscar cualquiera"], correct: 1 },
    { q: "¿Cuál es el TaxID para Homo sapiens?", options: ["9606", "9605", "9700"], correct: 0 },
    { q: "¿Qué base de datos es mejor para buscar genomas de referencia?", options: ["PDB", "UCSC Genome Browser", "PubMed"], correct: 1 },
    { q: "¿Qué operador buscas para buscar una frase exacta?", options: ["OR", "\"\" (comillas)", "AND"], correct: 1 }
  ];
  
  return `
    <div class="cli-quiz">
      ${questions.map((q, i) => `
        <div class="quiz-q">
          <p><strong>Pregunta ${i+1}:</strong> ${q.q}</p>
          <div class="quiz-opts">
            ${q.options.map((opt, j) => `
              <button class="quiz-opt" data-q="${i}" data-correct="${j === q.correct}">${opt}</button>
            `).join('')}
          </div>
          <div id="dbQuizFb-${i}" class="quiz-feedback hidden"></div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderDBModule() {
  const isCompleted = state.completed.db;
  return `
    <div class="cli-module-enhanced">
      <div class="cli-header">
        <h2>🔍 ${moduleData.db.title}</h2>
        <p class="cli-description">${moduleData.db.description}</p>
        <div class="header-buttons">
          <button class="back-btn" onclick="renderModulesList()">← Volver a módulos</button>
          <button class="complete-module-btn ${isCompleted ? 'completed' : ''}" onclick="completeModule('db')">
            ${isCompleted ? '✅ Completado' : '🎯 Completar Módulo'}
          </button>
        </div>
      </div>
      
      <div class="cli-tabs">
        <button class="cli-tab active" data-tab="conceptos">📚 Conceptos</button>
        <button class="cli-tab" data-tab="ejercicios">✏️ Ejercicios</button>
        <button class="cli-tab" data-tab="practica">🌐 Práctica</button>
        <button class="cli-tab" data-tab="quiz">❓ Quiz</button>
      </div>
      
      <div class="cli-tab-content" id="dbTabConceptos">
        ${renderDBLesson()}
      </div>
      
      <div class="cli-tab-content hidden" id="dbTabEjercicios">
        ${renderDBInteractive()}
      </div>
      
      <div class="cli-tab-content hidden" id="dbTabPractica">
        ${renderDBInteractive()}
      </div>
      
      <div class="cli-tab-content hidden" id="dbTabQuiz">
        ${renderDBQuiz()}
      </div>
    </div>
  `;
}

// ---------- MÓDULO 3: GENÓMICA ----------

function renderGenomicsLesson() {
  return `
    <div class="lesson genomics-intro">
      <h3>🧬 El flujo de análisis genómico</h3>
      <p>El análisis genómico moderno sigue un pipeline estructurado donde cada etapa transforma los datos para obtener información biológica significativa.</p>
      
      <div class="pipeline-flow enhanced">
        <div class="pipeline-step">
          <span class="step-num">1</span>
          <div class="step-content">
            <h5>📥 Recepción de datos</h5>
            <p>Obtener lecturas crudas (FASTQ) del secuenciador o repositorio (SRA, ENA, GEO).</p>
            <code>wget https://example.com/sample_R1.fastq.gz</code>
            <div class="step-tools">SRA Toolkit, Aspera, FTP</div>
          </div>
        </div>
        <div class="pipeline-step">
          <span class="step-num">2</span>
          <div class="step-content">
            <h5>📊 QC (Control de Calidad)</h5>
            <p>Evaluar calidad con FastQC. Identificar adaptadores, baja calidad, contaminación.</p>
            <code>fastqc raw/*.fastq.gz -o qc_results/</code>
            <div class="step-tools">FastQC, MultiQC, NanoPlot</div>
          </div>
        </div>
        <div class="pipeline-step">
          <span class="step-num">3</span>
          <div class="step-content">
            <h5>✂️ Preprocesamiento</h5>
            <p>Recortar adaptadores, eliminar низкое calidad, filtrar por longitud.</p>
            <code>trimmomatic PE input_R1.fq input_R2.fq out_R1.fq out_R2.fq ILLUMINACLIP:adapters.fa:2:30:10</code>
            <div class="step-tools">Trimmomatic, fastp, Cutadapt, fastp</div>
          </div>
        </div>
        <div class="pipeline-step">
          <span class="step-num">4</span>
          <div class="step-content">
            <h5>🗺️ Alineamiento</h5>
            <p>Mapear lecturas contra genoma de referencia. Crear archivos SAM/BAM.</p>
            <code>bwa mem -t 8 ref.fa sample_R1.fq sample_R2.fq | samtools sort -o aligned.bam</code>
            <div class="step-tools">BWA, Bowtie2, HISAT2, minimap2</div>
          </div>
        </div>
        <div class="pipeline-step">
          <span class="step-num">5</span>
          <div class="step-content">
            <h5>🧪 Variant Calling</h5>
            <p>Identificar SNPs, indels y variantes estructurales comparando con referencia.</p>
            <code>bcftools call -v -o variants.vcf aligned.bam</code>
            <div class="step-tools">GATK, FreeBayes, DeepVariant, bcftools</div>
          </div>
        </div>
        <div class="pipeline-step">
          <span class="step-num">6</span>
          <div class="step-content">
            <h5>🔍 Filtrado de variantes</h5>
            <p>Aplicar umbrales de calidad, profundidad,QD,FS. VQSR o hard filtering.</p>
            <code>bcftools view -i 'QUAL>30 && DP>10' variants.vcf > filtered.vcf</code>
            <div class="step-tools">GATK VQSR, bcftools filter</div>
          </div>
        </div>
        <div class="pipeline-step">
          <span class="step-num">7</span>
          <div class="step-content">
            <h5>📝 Anotación</h5>
            <p>Determinar efecto de variantes en genes (sinónimo, missense, nonsense).</p>
            <code>snpEff ann -v hg38 filtered.vcf > annotated.vcf</code>
            <div class="step-tools">SnpEff, ANNOVAR, VEP</div>
          </div>
        </div>
        <div class="pipeline-step">
          <span class="step-num">8</span>
          <div class="step-content">
            <h5>📈 Interpretación</h5>
            <p>Análisis funcional, búsqueda en bases de datos, prioritize variants.</p>
            <code># Anotación funcional, filtrado por impacto</code>
            <div class="step-tools">PROVEAN, PolyPhen, CADD, dbNSFP</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tipos de Secuenciación -->
    <div class="lesson">
      <h3>🔬 Tipos de Secuenciación NGS</h3>
      <div class="seq-types-grid">
        <div class="seq-type-card">
          <div class="seq-type-header wgs">🌐 WGS</div>
          <h4>Whole Genome Sequencing</h4>
          <p>Secuencia todo el genoma. Cobertura típica: 30x-60x.</p>
          <ul>
            <li><strong>Profundidad:</strong> 30-60x</li>
            <li><strong>Costoso</strong></li>
            <li><strong>Detecta variantes en todo el genoma</strong></li>
            <li><strong>Variantes estructurales</strong></li>
          </ul>
          <code>WGS → Genoma completo → 3.2 Gb humano</code>
        </div>
        
        <div class="seq-type-card">
          <div class="seq-type-header wes">🎯 WES</div>
          <h4>Whole Exome Sequencing</h4>
          <p>Secuencia solo exones (~1% del genoma). Cobertura: 50x-100x.</p>
          <ul>
            <li><strong>Profundidad:</strong> 50-100x</li>
            <li><strong>Más económico</strong></li>
            <li><strong>Enfoque en regiones codificantes</strong></li>
            <li><strong>Enfermedades mendelianas</strong></li>
          </ul>
          <code>WES → Exoma (~30 Mb) → Regiones codificantes</code>
        </div>
        
        <div class="seq-type-card">
          <div class="seq-type-header rnaseq">🧬 RNA-seq</div>
          <h4>RNA Sequencing</h4>
          <p>Secuencia transcripciones. Expresión génica y splicing.</p>
          <ul>
            <li><strong>Mide expresión</strong></li>
            <li><strong>Detectaisoformas</strong></li>
            <li><strong>Enfermedades complejas</strong></li>
            <li><strong>Cancer transcriptoma</strong></li>
          </ul>
          <code>RNA-seq → Expresión → Diferencial</code>
        </div>
        
        <div class="seq-type-card">
          <div class="seq-type-header panel">📋 Panels</div>
          <h4>Targeted Panels</h4>
          <p>Secuencia regiones específicas. Alta cobertura.</p>
          <ul>
            <li><strong>Profundidad:</strong> 500-1000x</li>
            <li><strong>Muy económico</strong></li>
            <li><strong>Genes específicos</strong></li>
            <li><strong>Diagnóstico clínico</strong></li>
          </ul>
          <code>Panels → Genes seleccionados → Clínico</code>
        </div>
      </div>
    </div>

    <!-- Tipos de Variantes -->
    <div class="lesson">
      <h3>🧪 Tipos de Variantes Genéticas</h3>
      <div class="variant-types">
        <div class="variant-card snp">
          <h4>🟢 SNP (Single Nucleotide Polymorphism)</h4>
          <p>Cambio de una sola base. El tipo más común.</p>
          <div class="variant-example">
            <code>REF: A → ALT: G</code>
            <span>Posición: chr1:12345</span>
          </div>
          <ul>
            <li>Frecuencia: ~1 cada 1000 bases</li>
            <li>~3-5 millones por genoma</li>
          </ul>
        </div>
        
        <div class="variant-card indel">
          <h4>🟡 Indel (Insertion/Deletion)</h4>
          <p>Inserciones o delecciones de pocas bases.</p>
          <div class="variant-example">
            <code>REF: AGT → ALT: A (deletion)</code>
            <span>Posición: chr1:12346</span>
          </div>
          <ul>
            <li>Inserciones: bases añadidas</li>
            <li>Delecciones: bases eliminadas</li>
          </ul>
        </div>
        
        <div class="variant-card sv">
          <h4>🔴 SV (Structural Variant)</h4>
          <p>Cambios grandes >50bp. Incluye translocaciones, inversiones.</p>
          <div class="variant-example">
            <code>Tipo: DEL, DUP, INV, TRA</code>
            <span>Tamaño: 1kb - varios Mb</span>
          </div>
          <ul>
            <li>Duplicaciones</li>
            <li>Delecciones</li>
            <li>Inversiones</li>
            <li>Translocaciones</li>
          </ul>
        </div>
        
        <div class="variant-card cnv">
          <h4>🟣 CNV (Copy Number Variant)</h4>
          <p>Cambios en el número de copias de secciones del genoma.</p>
          <div class="variant-example">
            <code>CN: 0 (nulo), 1 (hemicigoto), 2 (diploide), 3 (duplicado)</code>
            <span>CNV delecionado o amplificado</span>
          </div>
          <ul>
            <li>Amplificaciones</li>
            <li>Delecciones</li>
            <li>En enfermedades genéticas</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Clasificación de Impacto de Variantes -->
    <div class="lesson">
      <h3>⚠️ Clasificación de Impacto de Variantes</h3>
      <div class="impact-table">
        <table>
          <thead>
            <tr>
              <th>Impacto</th>
              <th>Descripción</th>
              <th>Ejemplo</th>
            </tr>
          </thead>
          <tbody>
            <tr class="impact-high">
              <td><strong>🔴 HIGH</strong></td>
              <td>Produce proteína truncada o pérdida de función</td>
              <td>Nonsense, frameshift, splice-site</td>
            </tr>
            <tr class="impact-moderate">
              <td><strong>🟡 MODERATE</strong></td>
              <td>Puede afectar función pero no sicher</td>
              <td>Missense conservativo</td>
            </tr>
            <tr class="impact-low">
              <td><strong>🟢 LOW</strong></td>
              <td>Probablemente no afecta función</td>
              <td>Sinónimo, intrónico-lejana</td>
            </tr>
            <tr class="impact-modifier">
              <td><strong>⚪ MODIFIER</strong></td>
              <td>Impacto difícil de evaluar</td>
              <td>Upstream, intergénica</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- GATK Best Practices -->
    <div class="lesson">
      <h3>📋 GATK Best Practices</h3>
      <p>El Gold Standard para análisis de variantes germline y somatic.</p>
      
      <div class="gatk-steps">
        <div class="gatk-step">
          <span class="gatk-num">1</span>
          <div class="gatk-content">
            <h4>Preprocesamiento de reads</h4>
            <code>gatk MarkDuplicates -I input.bam -O marked.bam -M metrics.txt</code>
            <code>gatk BaseRecalibrator -I marked.bam -R ref.fa -O recal.table</code>
            <code>gatk ApplyBQSR -I marked.bam -R ref.fa --bqsr-recal-file recal.table -O recalibrated.bam</code>
          </div>
        </div>
        
        <div class="gatk-step">
          <span class="gatk-num">2</span>
          <div class="gatk-content">
            <h4>HaplotypeCaller (GVCF mode)</h4>
            <code>gatk HaplotypeCaller -R ref.fa -I sample.bam -O sample.g.vcf -ERC GVCF</code>
          </div>
        </div>
        
        <div class="gatk-step">
          <span class="gatk-num">3</span>
          <div class="gatk-content">
            <h4>Joint Genotyping</h4>
            <code>gatk CombineGVCFs -R ref.fa -V sample1.g.vcf -V sample2.g.vcf -O cohort.g.vcf</code>
            <code>gatk GenotypeGVCFs -R ref.fa -V cohort.g.vcf -O raw_variants.vcf</code>
          </div>
        </div>
        
        <div class="gatk-step">
          <span class="gatk-num">4</span>
          <div class="gatk-content">
            <h4>Variant Quality Score Recalibration (VQSR)</h4>
            <code>gatk VariantRecalibrator -V raw.vcf -R ref.fa -resource:hapmap,known=false,training=true,truth=true,prior=15.0:hapmap_3.3.vcf -an QD -an MQ -an MQRankSum -an ReadPosRankSum -an FS -an SOR -mode SNP -O recalibrate_SNP.recal</code>
            <code>gatk ApplyVQSR -V input.vcf --recal-file recalibrate_SNP.recal --tranches-file recalibrate_SNP.tranches -O output.vcf</code>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtrado: VQSR vs Hard Filtering -->
    <div class="lesson">
      <h3>🎯 Filtrado de Variantes: VQSR vs Hard Filtering</h3>
      
      <div class="filter-comparison">
        <div class="filter-method vqsr">
          <h4>📊 VQSR (Variant Quality Score Recalibration)</h4>
          <p>Método статистический que usa machine learning.</p>
          <ul>
            <li>✅ Más preciso</li>
            <li>✅ Aprende de datos de entrenamiento</li>
            <li>✅ Mejor para WGS/WES grandes</li>
            <li>❌ Requiere sitios de verdad conocidos</li>
            <li>❌ Requiere suficientes variantes</li>
          </ul>
          <code>gatk VariantRecalibrator -resource:omni,known=false,training=true,truth=true,prior=12.0:1000G_omni2.5.vcf</code>
        </div>
        
        <div class="filter-method hard">
          <h4>🔧 Hard Filtering</h4>
          <p>Método manual con umbrales fijos.</p>
          <ul>
            <li>✅ Simple y directo</li>
            <li>✅ No requiere truth sites</li>
            <li>✅ Funciona con pocas variantes</li>
            <li>❌ Menos preciso</li>
            <li>❌ Requiere conocimiento de parámetros</li>
          </ul>
          <code>bcftools view -i 'QUAL>30 && DP>10 && QD>15 && MQ>40 && FS<30'</code>
        </div>
      </div>
    </div>

    <!-- Guía de Formatos -->
    <div class="lesson">
      <h3>📋 Guía de Formatos de Archivos</h3>
      
      <div class="format-cards">
        <div class="format-card">
          <div class="format-header fastq">📄 FASTQ</div>
          <p class="format-desc">Formato crudos de secuenciación. 4 líneas por read:</p>
          <div class="format-example">
            <code>@SEQ_ID</code>
            <code>GATTTGGGGTTCAAAGCAGTATCGATCAAATAGTAAATCCATTTGTTCAACTCACAGTTT</code>
            <code>+</code>
            <code>!''*((((***+))%%%++)(%%%%).1***-+*''))**55CCF>>>>>>CCCCCCC65</code>
          </div>
          <ul class="format-info">
            <li>Línea 1: ID del read (@)</li>
            <li>Línea 2: Secuencia (ATCG)</li>
            <li>Línea 3: Separador (+)</li>
            <li>Línea 4: Scores de calidad (Phred)</li>
          </ul>
        </div>

        <div class="format-card">
          <div class="format-header sam">📄 SAM/BAM</div>
          <p class="format-desc">Sequence Alignment Map. Texto (SAM) o binario (BAM):</p>
          <div class="format-example">
            <code>read001 99 chr1 1000 60 50M = 1200 250 GATACA... * NM:i:0 MD:Z:50</code>
          </div>
          <ul class="format-info">
            <li>QNAME: Nombre del read</li>
            <li>FLAG: Estado del mapeo</li>
            <li>RNAME: Cromosoma</li>
            <li>POS: Posición inicio</li>
            <li>MAPQ: Calidad mapeo</li>
            <li>CIGAR: Operadores alineamiento</li>
          </ul>
        </div>

        <div class="format-card">
          <div class="format-header vcf">📄 VCF</div>
          <p class="format-desc">Variant Call Format. Información de variantes:</p>
          <div class="format-example">
            <code>#CHROM POS ID REF ALT QUAL FILTER INFO</code>
            <code>chr1 12345 rs123 G A 50 PASS DP=25;QD=15;FS=2.5</code>
            <code>chr1 23456 . C T 30 PASS DP=10;QD=8</code>
          </div>
          <ul class="format-info">
            <li>CHROM: Cromosoma</li>
            <li>POS: Posición</li>
            <li>ID: Identificador (rsID)</li>
            <li>REF/ALT: Nucleótidos</li>
            <li>QUAL: Phred quality</li>
            <li>INFO: Anotaciones (DP, QD, FS...)</li>
          </ul>
        </div>

        <div class="format-card">
          <div class="format-header bed">📄 BED</div>
          <p class="format-desc">Browser Extensible Data. Regiones genómicas:</p>
          <div class="format-example">
            <code>chr1 1000 2000 GeneA 0 +</code>
            <code>chr1 2500 3000 Exon1 0 +</code>
          </div>
          <ul class="format-info">
            <li>Columna 1: Cromosoma</li>
            <li>Columna 2: Inicio</li>
            <li>Columna 3: Fin</li>
            <li>Columna 4: Nombre</li>
            <li>Columna 5: Score</li>
            <li>Columna 6: Strand</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Herramientas por Categoría -->
    <div class="lesson">
      <h3>🛠️ Herramientas por Categoría</h3>
      
      <div class="tools-by-category">
        <div class="tool-category">
          <h4>📊 Control de Calidad</h4>
          <div class="tool-list">
            <div class="tool-item">
              <strong>FastQC</strong>
              <span>El estándar para QC de reads</span>
              <code>fastqc sample.fastq.gz</code>
            </div>
            <div class="tool-item">
              <strong>MultiQC</strong>
              <span>Agregar múltiples reportes FastQC</span>
              <code>multiqc .</code>
            </div>
            <div class="tool-item">
              <strong>fastp</strong>
              <span>QC + trimming todo-en-uno</span>
              <code>fastp -i R1.fq -o R1_clean.fq</code>
            </div>
            <div class="tool-item">
              <strong>NanoPlot</strong>
              <span>QC para long reads (Nanopore)</span>
              <code>NanoPlot --fastq reads.fastq</code>
            </div>
          </div>
        </div>

        <div class="tool-category">
          <h4>✂️ Preprocesamiento</h4>
          <div class="tool-list">
            <div class="tool-item">
              <strong>Trimmomatic</strong>
              <span>Recorte de adaptadores y calidad</span>
              <code>trimmomatic PE input.fq output.fq ILLUMINACLIP:adapters.fa</code>
            </div>
            <div class="tool-item">
              <strong>Cutadapt</strong>
              <span>Eliminar adaptadores específicos</span>
              <code>cutadapt -a AGATCGGAAGAGC -o output.fq input.fq</code>
            </div>
            <div class="tool-item">
              <strong>PRINSEQ</strong>
              <span>Filtrado y recorte de reads</span>
              <code>prinseq -fastq input.fq -good_out clean.fq</code>
            </div>
          </div>
        </div>

        <div class="tool-category">
          <h4>🗺️ Alineamiento</h4>
          <div class="tool-list">
            <div class="tool-item">
              <strong>BWA-MEM</strong>
              <span>Short reads (Illumina)</span>
              <code>bwa mem ref.fa reads.fq > align.sam</code>
            </div>
            <div class="tool-item">
              <strong> Bowtie2</strong>
              <span>Short reads, buen para SNPs</span>
              <code>bowtie2 -x index -U reads.fq -S align.sam</code>
            </div>
            <div class="tool-item">
              <strong>HISAT2</strong>
              <span>RNA-seq, splice-aware</span>
              <code>hisat2 -x index -U reads.fq -S align.sam</code>
            </div>
            <div class="tool-item">
              <strong>minimap2</strong>
              <span>Long reads (Nanopore, PacBio)</span>
              <code>minimap2 -ax map-ont ref.fa reads.fq > align.sam</code>
            </div>
            <div class="tool-item">
              <strong>STAR</strong>
              <span>RNA-seq de alta precisión</span>
              <code>STAR --genomeDir index --readFilesIn R1.fq --outFileNamePrefix sample_</code>
            </div>
          </div>
        </div>

        <div class="tool-category">
          <h4>🧪 Variant Calling</h4>
          <div class="tool-list">
            <div class="tool-item">
              <strong>GATK HaplotypeCaller</strong>
              <span>Gold standard para SNPs/indels</span>
              <code>gatk HaplotypeCaller -R ref.fa -I bam.bam -O variants.vcf</code>
            </div>
            <div class="tool-item">
              <strong>FreeBayes</strong>
              <span>Variantes bayesianas</span>
              <code>freebayes -f ref.fa bam.bam > variants.vcf</code>
            </div>
            <div class="tool-item">
              <strong>DeepVariant</strong>
              <span>Variant calling con deep learning</span>
              <code>deepvariant --model_type=WGS --ref=ref.fa --reads=bam.bam --output=variants.vcf</code>
            </div>
            <div class="tool-item">
              <strong>Strelka</strong>
              <span>Somatic variant calling</span>
              <code>configureStrelkaGermlineWorkflow.py --bam sample.bam --ref ref.fa --runDir .</code>
            </div>
          </div>
        </div>

        <div class="tool-category">
          <h4>📝 Anotación</h4>
          <div class="tool-list">
            <div class="tool-item">
              <strong>SnpEff</strong>
              <span>Anotación funcional de variantes</span>
              <code>snpEff ann -v hg38 variants.vcf > annotated.vcf</code>
            </div>
            <div class="tool-item">
              <strong>ANNOVAR</strong>
              <span>Anotación comprehensiva</span>
              <code>table_annovar.pl variants.pl --buildver hg38</code>
            </div>
            <div class="tool-item">
              <strong>VEP</strong>
              <span>Variant Effect Predictor</span>
              <code>vep -i variants.vcf -o output.txt --species human</code>
            </div>
          </div>
        </div>
        
        <div class="tool-category">
          <h4>📊 RNA-seq Expresión</h4>
          <div class="tool-list">
            <div class="tool-item">
              <strong>STAR</strong>
              <span>Alineamiento RNA-seq</span>
              <code>STAR --genomeDir index --readFilesIn R1.fq</code>
            </div>
            <div class="tool-item">
              <strong>featureCounts</strong>
              <span>Cuantificación de reads</span>
              <code>featureCounts -a annotation.gtf -o counts.txt alignments.bam</code>
            </div>
            <div class="tool-item">
              <strong>DESeq2</strong>
              <span>Análisis de expresión diferencial</span>
              <code>dds <- DESeqDataSetFromMatrix(countData, colData, design=~condition)</code>
            </div>
            <div class="tool-item">
              <strong>edgeR</strong>
              <span>Expresión diferencial</span>
              <code>y <- DGEList(counts=counts); y <- calcNormFactors(y)</code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Parámetros de Filtrado -->
    <div class="lesson">
      <h3>🎯 Parámetros Importantes de Filtrado</h3>
      <div class="params-grid">
        <div class="param-card">
          <code>QUAL</code>
          <p>Phred quality score. >30 = alta confianza.</p>
          <span class="param-example">bcftools view -i 'QUAL>30'</span>
        </div>
        <div class="param-card">
          <code>DP</code>
          <p>Profundidad de lectura (Coverage). >10x mínimo recomendado.</p>
          <span class="param-example">bcftools view -i 'DP>10'</span>
        </div>
        <div class="param-card">
          <code>QD</code>
          <p>Qualidad por profundidad. >15 sugiere variante real.</p>
          <span class="param-example">bcftools view -i 'QD>15'</span>
        </div>
        <div class="param-card">
          <code>FS</code>
          <p>Fisher's exact test for strand bias. <30 para SNPs.</p>
          <span class="param-example">bcftools view -i 'FS<30'</span>
        </div>
        <div class="param-card">
          <code>MQ</code>
          <p>Mapping Quality. >40 indica buen mapeo.</p>
          <span class="param-example">bcftools view -i 'MQ>40'</span>
        </div>
        <div class="param-card">
          <code>SOR</code>
          <p>Symmetric Odds Ratio. <3 para SNPs.</p>
          <span class="param-example">bcftools view -i 'SOR<3'</span>
        </div>
        <div class="param-card">
          <code>MQRankSum</code>
          <p>Mapping Quality Rank Sum Test. >-12.5.</p>
          <span class="param-example">bcftools view -i 'MQRankSum>-12.5'</span>
        </div>
        <div class="param-card">
          <code>ReadPosRankSum</code>
          <p>Read Position Rank Sum Test. >-8.</p>
          <span class="param-example">bcftools view -i 'ReadPosRankSum>-8'</span>
        </div>
      </div>
    </div>

    <!-- Bases de Datos de Variantes -->
    <div class="lesson">
      <h3>🗄️ Bases de Datos de Variantes</h3>
      <div class="db-list">
        <div class="db-item">
          <h4>📚 dbSNP</h4>
          <p>Base de datos de polimorfismos de nucleótido único.</p>
          <code>https://www.ncbi.nlm.nih.gov/snp/</code>
        </div>
        <div class="db-item">
          <h4>🧬 ClinVar</h4>
          <p>Variantes clínicas y su relación con enfermedades.</p>
          <code>https://www.ncbi.nlm.nih.gov/clinvar/</code>
        </div>
        <div class="db-item">
          <h4>🌍 gnomAD</h4>
          <p>Frecuencias de variantes en poblaciones humanas.</p>
          <code>https://gnomad.broadinstitute.org/</code>
        </div>
        <div class="db-item">
          <h4>🔬 COSMIC</h4>
          <p>Mutaciones somáticas en cáncer.</p>
          <code>https://cancer.sanger.ac.uk/cosmic</code>
        </div>
        <div class="db-item">
          <h4>🧪 1000 Genomes</h4>
          <p>Variantes de 1KG poblaciones humanas.</p>
          <code>https://www.internationalgenome.org/</code>
        </div>
      </div>
    </div>

    <!-- Pipeline Completos -->
    <div class="lesson">
      <h3>🔄 Pipelines Completos (nf-core)</h3>
      <p>nf-core ofrece pipelines optimizados y probados por la comunidad:</p>
      
      <div class="pipeline-list">
        <div class="pipeline-item">
          <h4>📦 nf-core/sarek</h4>
          <p>Pipeline para germline y somatic variant calling. WGS/WES.</p>
          <code>nextflow run nf-core/sarek -profile docker</code>
        </div>
        <div class="pipeline-item">
          <h4>📦 nf-core/rnaseq</h4>
          <p>RNA-seq desde reads hasta expresión diferencial.</p>
          <code>nextflow run nf-core/rnaseq -profile docker</code>
        </div>
        <div class="pipeline-item">
          <h4>📦 nf-core/epitopeprediction</h4>
          <p>Predicción de epítopos de MHC.</p>
          <code>nextflow run nf-core/epitopeprediction</code>
        </div>
        <div class="pipeline-item">
          <h4>📦 nf-core/viralrecon</h4>
          <p>Análisis de virus (incluyendo SARS-CoV-2).</p>
          <code>nextflow run nf-core/viralrecon</code>
        </div>
      </div>
    </div>
  `;
}

function renderGenomicsInteractive() {
  return `
    <!-- Ejercicio 1: Ordenar Pipeline -->
    <div class="interactive">
      <h4>🧩 Ordena el pipeline genómico</h4>
      <p>Ordena los pasos del 1 al 8 (escribe los números separados por coma):</p>
      <div class="lab-commands">
        <div class="lab-cmd"><span class="num">_</span> QC (FastQC) - Evaluar calidad</div>
        <div class="lab-cmd"><span class="num">_</span> Preprocesamiento (Trimming)</div>
        <div class="lab-cmd"><span class="num">_</span> Alineamiento (BWA)</div>
        <div class="lab-cmd"><span class="num">_</span> Variant Calling (GATK)</div>
        <div class="lab-cmd"><span class="num">_</span> Filtrado de variantes</div>
        <div class="lab-cmd"><span class="num">_</span> Anotación (SnpEff)</div>
        <div class="lab-cmd"><span class="num">_</span> Interpretación funcional</div>
        <div class="lab-cmd"><span class="num">_</span> Recepción de datos</div>
      </div>
      <input type="text" id="pipelineOrderInput" placeholder="Orden: 8,1,2,3,4,5,6,7">
      <button onclick="checkPipelineOrder()">Verificar</button>
      <div id="genPipelineFeedback" class="feedback hidden"></div>
    </div>

    <!-- Ejercicios de Comandos -->
    <div class="lesson">
      <h4>✏️ Ejercicios de Comandos</h4>
      
      <div class="exercise-card">
        <h5>✏️ Ejercicio 1: QC de lecturas</h5>
        <p>Escribe el comando para hacer QC de archivos FASTQ:</p>
        <input type="text" id="exGen1" placeholder="fastqc archivos.fastq.gz">
        <button onclick="checkGenEx1()">Verificar</button>
        <div id="genEx1Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 2: Alineamiento</h5>
        <p>Escribe el comando para alinear con BWA:</p>
        <input type="text" id="exGen2" placeholder="bwa mem ref.fa reads.fq > aligned.sam">
        <button onclick="checkGenEx2()">Verificar</button>
        <div id="genEx2Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 3: Variant Calling</h5>
        <p>Usa bcftools para identificar variantes:</p>
        <input type="text" id="exGen3" placeholder="bcftools call -v -o variants.vcf aligned.bam">
        <button onclick="checkGenEx3()">Verificar</button>
        <div id="genEx3Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 4: Filtrado por calidad</h5>
        <p>Filtra variantes con QUAL > 30 y DP > 10:</p>
        <input type="text" id="exGen4" placeholder="bcftools view -i 'QUAL>30 && DP>10' variants.vcf">
        <button onclick="checkGenEx4()">Verificar</button>
        <div id="genEx4Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 5: Anotación</h5>
        <p>Usa SnpEff para anotar variantes:</p>
        <input type="text" id="exGen5" placeholder="snpEff ann hg38 variants.vcf">
        <button onclick="checkGenEx5()">Verificar</button>
        <div id="genEx5Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 6: Formato FASTQ</h5>
        <p>¿Cuántas líneas tiene cada read en FASTQ?</p>
        <input type="text" id="exGen6" placeholder="4">
        <button onclick="checkGenEx6()">Verificar</button>
        <div id="genEx6Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 7: SAM vs BAM</h5>
        <p>¿Cuál es la versión comprimida de SAM?</p>
        <input type="text" id="exGen7" placeholder="BAM">
        <button onclick="checkGenEx7()">Verificar</button>
        <div id="genEx7Feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h5>✏️ Ejercicio 8: Parámetro QD</h5>
        <p>¿Qué significa QD en el filtrado de variantes?</p>
        <input type="text" id="exGen8" placeholder="Quality by depth">
        <button onclick="checkGenEx8()">Verificar</button>
        <div id="genEx8Feedback" class="feedback hidden"></div>
      </div>
    </div>

    <!-- Simulador de Análisis -->
    <div class="lesson simulator-section">
      <h4>🧬 Simulador de Análisis Genómico</h4>
      <p>Sigue los pasos del pipeline:</p>
      
      <div class="sim-pipeline">
        <div class="sim-step-item" data-step="1">
          <span class="sim-num">1</span>
          <div class="sim-step-content">
            <strong>📥 Datos crudos</strong>
            <code>wget https://example.com/sample.fastq.gz</code>
            <button class="sim-btn" onclick="runGenSim(1)">Completar</button>
            <div class="sim-output hidden" id="genSim1">✓ 12,345,678 reads descargados</div>
          </div>
        </div>
        
        <div class="sim-step-item" data-step="2">
          <span class="sim-num">2</span>
          <div class="sim-step-content">
            <strong>📊 FastQC</strong>
            <code>fastqc sample.fastq.gz</code>
            <button class="sim-btn" onclick="runGenSim(2)">Completar</button>
            <div class="sim-output hidden" id="genSim2">✓ QC: Pass 95% | GC: 42% | Adapters: 1.2%</div>
          </div>
        </div>
        
        <div class="sim-step-item" data-step="3">
          <span class="sim-num">3</span>
          <div class="sim-step-content">
            <strong>✂️ Trimming</strong>
            <code>trimmomatic PE input.fq -o clean.fq</code>
            <button class="sim-btn" onclick="runGenSim(3)">Completar</button>
            <div class="sim-output hidden" id="genSim3">✓ Reads retain: 11,890,123 (96.3%)</div>
          </div>
        </div>
        
        <div class="sim-step-item" data-step="4">
          <span class="sim-num">4</span>
          <div class="sim-step-content">
            <strong>🗺️ Alineamiento</strong>
            <code>bwa mem ref.fa clean.fq | samtools sort -o aligned.bam</code>
            <button class="sim-btn" onclick="runGenSim(4)">Completar</button>
            <div class="sim-output hidden" id="genSim4">✓ Mapeo: 98.5% | Duplicados: 4.2%</div>
          </div>
        </div>
        
        <div class="sim-step-item" data-step="5">
          <span class="sim-num">5</span>
          <div class="sim-step-content">
            <strong>🧪 Variant Calling</strong>
            <code>bcftools call -v aligned.bam > variants.vcf</code>
            <button class="sim-btn" onclick="runGenSim(5)">Completar</button>
            <div class="sim-output hidden" id="genSim5">✓ SNPs: 15,234 | Indels: 2,567</div>
          </div>
        </div>
        
        <div class="sim-step-item" data-step="6">
          <span class="sim-num">6</span>
          <div class="sim-step-content">
            <strong>🔍 Filtrado</strong>
            <code>bcftools view -i 'QUAL>30 && DP>10' variants.vcf</code>
            <button class="sim-btn" onclick="runGenSim(6)">Completar</button>
            <div class="sim-output hidden" id="genSim6">✓ Variantes de alta calidad: 8,456</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Explorador de Formatos -->
    <div class="lesson">
      <h4>📋 Ejemplos de Formatos</h4>
      
      <div class="format-example-box">
        <h5>📄 FASTQ</h5>
        <div class="code">@READ001
GATTTGGGGTTCAAAGCAGTATCGATCAAATAGTAAATCCATTTGTTCAACTCACAGTTT
+
!''*((((***+))%%%++)(%%%%).1***-+*''))**55CCF>>>>>>CCCCCCC65
        
@READ002
CGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGA
+
IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII</div>
      </div>
      
      <div class="format-example-box">
        <h5>📄 VCF</h5>
        <div class="code">#CHROM  POS     ID        REF     ALT     QUAL    FILTER  INFO
chr1    12345   rs123     G       A       63      PASS    DP=45;AF=0.5;QD=15
chr1    23456   .         CTGT     C       45      PASS    DP=23;AF=0.3;QD=10
chr2    56789   rs456     A       T       120     PASS    DP=89;AF=0.7;QD=25</div>
      </div>
    </div>
  `;
}

// ---------- EMULADORES DE GENÓMICA ----------
function renderGenomicsEmulators() {
  return `
    <div class="emulators-container">
      <p class="emulators-intro">🎮 <strong>Emuladores interactivos</strong> - Experimenta con procesos bioinformáticos en tiempo real</p>
      
      <!-- Emulador 1: FASTQ Generator -->
      <div class="emulator-card" id="emulator-fastq">
        <div class="emulator-header">
          <h4>🧬 FASTQ Generator Emulator</h4>
          <span class="emulator-badge">Generador de reads</span>
        </div>
        <div class="emulator-body">
          <div class="emulator-controls">
            <label>Secuencia de referencia:</label>
            <input type="text" id="fastq-ref" value="ATGCGATCGATCGATCGATCG" placeholder="Secuencia de referencia (20+ bp)">
            <label>Número de reads:</label>
            <select id="fastq-count">
              <option value="5">5 reads</option>
              <option value="10" selected>10 reads</option>
              <option value="20">20 reads</option>
            </select>
            <label>Error rate (%):</label>
            <input type="range" id="fastq-error" min="0" max="10" value="1">
            <span id="fastq-error-val">1%</span>
            <button class="emulator-run-btn" onclick="runFastqEmulator()">Generar FASTQ</button>
          </div>
          <div class="emulator-output" id="fastq-output">
            <div class="output-label">📄 Salida FASTQ:</div>
            <pre class="fastq-preview">Presiona "Generar FASTQ" para crear reads simulados...</pre>
          </div>
        </div>
      </div>

      <!-- Emulador 2: QC Emulator -->
      <div class="emulator-card" id="emulator-qc">
        <div class="emulator-header">
          <h4>📊 QC Emulator (FastQC)</h4>
          <span class="emulator-badge">Control de Calidad</span>
        </div>
        <div class="emulator-body">
          <div class="emulator-controls">
            <label>Tipo de datos:</label>
            <select id="qc-type">
              <option value="good">Datos de buena calidad</option>
              <option value="medium">Datos de calidad media</option>
              <option value="poor">Datos de baja calidad</option>
              <option value="adapter">Con adaptadores</option>
            </select>
            <label>Contenido GC (%):</label>
            <input type="range" id="qc-gc" min="20" max="80" value="45">
            <span id="qc-gc-val">45%</span>
            <button class="emulator-run-btn" onclick="runQcEmulator()">Ejecutar FastQC</button>
          </div>
          <div class="emulator-output qc-results" id="qc-output">
            <div class="qc-summary">
              <div class="qc-module pass">✅ Basic Statistics</div>
              <div class="qc-module pass">✅ Per Base Sequence Quality</div>
              <div class="qc-module pass">✅ Per Tile Sequence Quality</div>
              <div class="qc-module pass">✅ Per Sequence Quality Scores</div>
              <div class="qc-module pass">✅ Per Base N Content</div>
              <div class="qc-module pass">✅ Sequence Length Distribution</div>
              <div class="qc-module pass">✅ Duplicate Sequences</div>
              <div class="qc-module pass">✅ Overrepresented Sequences</div>
              <div class="qc-module pass">✅ Adapter Content</div>
            </div>
            <div class="qc-charts">
              <div class="qc-chart" id="qc-per-base">
                <div class="chart-title">Per Base Sequence Quality</div>
                <div class="fake-chart quality-chart"></div>
              </div>
              <div class="qc-chart" id="qc-gc-content">
                <div class="chart-title">GC Content</div>
                <div class="fake-chart gc-chart"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Emulador 3: Alignment Emulator -->
      <div class="emulator-card" id="emulator-align">
        <div class="emulator-header">
          <h4>🗺️ Alignment Emulator</h4>
          <span class="emulator-badge">Visualizador de Alineamiento</span>
        </div>
        <div class="emulator-body">
          <div class="emulator-controls">
            <label>Genoma de referencia:</label>
            <input type="text" id="align-ref" value="ATGCGATCGATCGATCGATCGTAGCTAGCTAG" readonly>
            <label>Read a alinear:</label>
            <input type="text" id="align-read" value="ATGCGATCGATCGATCGATCGTAGCT">
            <button class="emulator-run-btn" onclick="runAlignEmulator()">Alinear Read</button>
          </div>
          <div class="emulator-output alignment-viewer" id="align-output">
            <div class="alignment-label">🧬 Visualizador de alineamiento:</div>
            <pre class="alignment-display">Presiona "Alinear Read" para ver el resultado...</pre>
          </div>
          <div class="alignment-legend">
            <span class="legend-item match">| = Match</span>
            <span class="legend-item mismatch">✗ = Mismatch</span>
            <span class="legend-item indel">- = Indel</span>
          </div>
        </div>
      </div>

      <!-- Emulador 4: Variant Calling Emulator -->
      <div class="emulator-card" id="emulator-vc">
        <div class="emulator-header">
          <h4>🧪 Variant Calling Emulator</h4>
          <span class="emulator-badge">Detección de Variantes</span>
        </div>
        <div class="emulator-body">
          <div class="emulator-controls">
            <label>Archivo BAM (simulado):</label>
            <select id="vc-bam">
              <option value="normal">Muestra Normal</option>
              <option value="tumor">Muestra Tumor</option>
              <option value="family">Familia (Trio)</option>
            </select>
            <label>Herramienta:</label>
            <select id="vc-tool">
              <option value="gatk">GATK HaplotypeCaller</option>
              <option value="freebayes">FreeBayes</option>
              <option value="deepvariant">DeepVariant</option>
            </select>
            <button class="emulator-run-btn" onclick="runVariantCallerEmulator()">Ejecutar Variant Calling</button>
          </div>
          <div class="emulator-output vc-results" id="vc-output">
            <div class="vc-stats">
              <div class="vc-stat">
                <span class="stat-label">Total variants:</span>
                <span class="stat-value" id="vc-total">-</span>
              </div>
              <div class="vc-stat">
                <span class="stat-label">SNPs:</span>
                <span class="stat-value snp" id="vc-snp">-</span>
              </div>
              <div class="vc-stat">
                <span class="stat-label">Indels:</span>
                <span class="stat-value indel" id="vc-indel">-</span>
              </div>
            </div>
            <div class="vc-variants" id="vc-variants-list">
              <div class="vcf-header">#CHROM  POS     ID       REF  ALT  QUAL  FILTER  INFO</div>
              <div class="vcf-placeholder">Ejecuta el variant calling para ver variantes...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Emulador 5: Filter Emulator -->
      <div class="emulator-card" id="emulator-filter">
        <div class="emulator-header">
          <h4>🔍 Filter Emulator</h4>
          <span class="emulator-badge">Filtrado de Variantes</span>
        </div>
        <div class="emulator-body">
          <div class="emulator-controls filter-controls">
            <div class="filter-param">
              <label>QUAL ></label>
              <input type="number" id="filter-qual" value="30" min="0" max="100">
            </div>
            <div class="filter-param">
              <label>DP ></label>
              <input type="number" id="filter-dp" value="10" min="0" max="1000">
            </div>
            <div class="filter-param">
              <label>QD ></label>
              <input type="number" id="filter-qd" value="15" min="0" max="100">
            </div>
            <div class="filter-param">
              <label>MQ ></label>
              <input type="number" id="filter-mq" value="40" min="0" max="100">
            </div>
            <div class="filter-param">
              <label>FS <</label>
              <input type="number" id="filter-fs" value="30" min="0" max="100">
            </div>
            <button class="emulator-run-btn" onclick="runFilterEmulator()">Aplicar Filtros</button>
          </div>
          <div class="emulator-output filter-results" id="filter-output">
            <div class="filter-summary">
              <span class="filter-total">Variantes iniciales: <strong id="filter-initial">0</strong></span>
              <span class="filter-passed">Pasaron filtros: <strong id="filter-passed">0</strong></span>
              <span class="filter-removed">Eliminadas: <strong id="filter-removed">0</strong></span>
            </div>
            <div class="filter-variants" id="filter-variants-list">
              <!-- Variantes se muestran aquí -->
            </div>
          </div>
        </div>
      </div>

      <!-- Emulador 6: Annotation Emulator -->
      <div class="emulator-card" id="emulator-annot">
        <div class="emulator-header">
          <h4>📝 Annotation Emulator</h4>
          <span class="emulator-badge">Anotación de Variantes</span>
        </div>
        <div class="emulator-body">
          <div class="emulator-controls">
            <label>Variante a anotar:</label>
            <input type="text" id="annot-variant" value="chr1:12345:G>A" placeholder="chr:pos:ref>alt">
            <label>Anotador:</label>
            <select id="annot-tool">
              <option value="snpeff">SnpEff</option>
              <option value="vep">VEP</option>
              <option value="annovar">ANNOVAR</option>
            </select>
            <button class="emulator-run-btn" onclick="runAnnotationEmulator()">Anotar Variante</button>
          </div>
          <div class="emulator-output annot-results" id="annot-output">
            <div class="annot-gene">
              <span class="annot-label">Gen:</span>
              <span class="annot-value gene-name" id="annot-gene">BRCA1</span>
            </div>
            <div class="annot-impact">
              <span class="annot-label">Impacto:</span>
              <span class="annot-value impact-badge high" id="annot-impact">HIGH</span>
            </div>
            <div class="annot-consequence">
              <span class="annot-label">Consecuencia:</span>
              <span class="annot-value consequence" id="annot-consequence">missense_variant</span>
            </div>
            <div class="annot-details" id="annot-details">
              <div class="detail-row">
                <span>Codón:</span>
                <span>c.5242G>A</span>
              </div>
              <div class="detail-row">
                <span>Proteína:</span>
                <span>p.Gly1748Arg</span>
              </div>
              <div class="detail-row">
                <span>Exón:</span>
                <span>11/24</span>
              </div>
              <div class="detail-row">
                <span>ClinVar:</span>
                <span class="clinvar pathogenic">Pathogenic</span>
              </div>
              <div class="detail-row">
                <span>gnomAD:</span>
                <span>0.0001 (raro)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Emulador 7: Pipeline Runner Emulator -->
      <div class="emulator-card" id="emulator-pipeline">
        <div class="emulator-header">
          <h4>⚙️ Pipeline Runner Emulator</h4>
          <span class="emulator-badge">Ejecutor de Pipeline Completo</span>
        </div>
        <div class="emulator-body">
          <div class="emulator-controls pipeline-controls">
            <label>Selecciona pasos del pipeline:</label>
            <div class="pipeline-checkboxes">
              <label><input type="checkbox" id="pipe-qc" checked> QC (FastQC)</label>
              <label><input type="checkbox" id="pipe-trim" checked> Trimming (fastp)</label>
              <label><input type="checkbox" id="pipe-align" checked> Alineamiento (BWA)</label>
              <label><input type="checkbox" id="pipe-dedup" checked> Deduplicación</label>
              <label><input type="checkbox" id="pipe-vc" checked> Variant Calling (GATK)</label>
              <label><input type="checkbox" id="pipe-filter" checked> Filtrado</label>
              <label><input type="checkbox" id="pipe-annot" checked> Anotación (SnpEff)</label>
            </div>
            <label>Perfil:</label>
            <select id="pipe-profile">
              <option value="test">Test (datos pequeños)</option>
              <option value="normal">Normal</option>
              <option value="hpc">High Performance</option>
            </select>
            <button class="emulator-run-btn pipeline-run" onclick="runPipelineEmulator()">▶️ Ejecutar Pipeline</button>
          </div>
          <div class="emulator-output pipeline-terminal" id="pipe-output">
            <div class="terminal-header">
              <span class="terminal-title">🖥️ Terminal - nf-core/sarek</span>
              <span class="terminal-status" id="pipe-status">Listo</span>
            </div>
            <pre class="terminal-content" id="pipe-terminal">Selecciona los pasos y ejecuta el pipeline...</pre>
          </div>
          <div class="pipeline-progress" id="pipe-progress">
            <div class="progress-bar"><div class="progress-fill" id="pipe-progress-fill"></div></div>
            <span class="progress-text" id="pipe-progress-text">0%</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Funciones de los emuladores
function runFastqEmulator() {
  const ref = document.getElementById('fastq-ref').value.toUpperCase();
  const count = parseInt(document.getElementById('fastq-count').value);
  const errorRate = parseInt(document.getElementById('fastq-error').value);
  const bases = ['A', 'T', 'G', 'C'];
  
  let output = '';
  const readLength = Math.min(ref.length, 100);
  
  for (let i = 0; i < count; i++) {
    const startPos = Math.floor(Math.random() * (ref.length - readLength));
    let readSeq = '';
    let qualScores = '';
    
    for (let j = 0; j < readLength; j++) {
      const refBase = ref[startPos + j];
      // Simular error
      if (Math.random() * 100 < errorRate) {
        const errorBases = bases.filter(b => b !== refBase);
        readSeq += errorBases[Math.floor(Math.random() * errorBases.length)];
        // Baja calidad para errores
        qualScores += String.fromCharCode(20 + Math.floor(Math.random() * 15));
      } else {
        readSeq += refBase;
        // Buena calidad para matches
        qualScores += String.fromCharCode(30 + Math.floor(Math.random() * 10));
      }
    }
    
    output += `@READ_${String(i+1).padStart(4, '0')} length=${readLength}\n`;
    output += `${readSeq}\n`;
    output += `+\n`;
    output += `${qualScores}\n`;
  }
  
  document.querySelector('#fastq-output pre').textContent = output;
  document.getElementById('fastq-output').classList.add('active');
}

function runQcEmulator() {
  const type = document.getElementById('qc-type').value;
  const gc = document.getElementById('qc-gc').value;
  
  document.getElementById('qc-gc-val').textContent = gc + '%';
  
  const modules = document.querySelectorAll('.qc-module');
  const charts = document.querySelectorAll('.qc-chart');
  
  modules.forEach(m => {
    m.className = 'qc-module';
    if (type === 'good') {
      m.classList.add('pass');
    } else if (type === 'medium') {
      m.classList.add('warn');
    } else {
      m.classList.add('fail');
    }
  });
  
  // Actualizar gráficos simulados
  charts.forEach(chart => {
    chart.querySelector('.fake-chart').style.setProperty('--quality', type === 'good' ? '90%' : type === 'medium' ? '60%' : '30%');
  });
  
  const qcOutput = document.getElementById('qc-output');
  qcOutput.classList.add('active');
}

function runAlignEmulator() {
  const ref = document.getElementById('align-ref').value;
  const read = document.getElementById('align-read').value.toUpperCase();
  
  // Encontrar mejor posición
  let bestPos = -1;
  let bestMatches = 0;
  
  for (let i = 0; i <= ref.length - read.length; i++) {
    let matches = 0;
    for (let j = 0; j < read.length; j++) {
      if (read[j] === ref[i + j]) matches++;
    }
    if (matches > bestMatches) {
      bestMatches = matches;
      bestPos = i;
    }
  }
  
  let display = '';
  // Línea de referencia
  display += 'REF: ';
  for (let i = 0; i < ref.length; i++) {
    if (i >= bestPos && i < bestPos + read.length) {
      display += ref[i];
    } else {
      display += ' ';
    }
  }
  display += '\n';
  
  // Línea de matches
  display += '     ';
  for (let i = 0; i < ref.length; i++) {
    if (i >= bestPos && i < bestPos + read.length) {
      if (read[i - bestPos] === ref[i]) {
        display += '|';
      } else {
        display += '✗';
      }
    } else {
      display += ' ';
    }
  }
  display += '\n';
  
  // Línea de read
  display += 'READ:';
  display += ' '.repeat(bestPos) + read;
  display += '\n\n';
  
  // Stats
  const mismatches = read.length - bestMatches;
  const identity = ((bestMatches / read.length) * 100).toFixed(1);
  display += `📊 Estadísticas:\n`;
  display += `   Posición: ${bestPos + 1}\n`;
  display += `   Matches: ${bestMatches}/${read.length}\n`;
  display += `   Mismatches: ${mismatches}\n`;
  display += `   Identidad: ${identity}%`;
  
  document.querySelector('#align-output pre').textContent = display;
  document.getElementById('align-output').classList.add('active');
}

function runVariantCallerEmulator() {
  const bamType = document.getElementById('vc-bam').value;
  const tool = document.getElementById('vc-tool').value;
  
  // Generar variantes simuladas
  const variants = [];
  const chroms = ['chr1', 'chr2', 'chr3', 'chr4', 'chr5', 'chr6', 'chr7', 'chr8', 'chr9', 'chr10', 'chr11', 'chr12', 'chr17'];
  const genes = ['BRCA1', 'BRCA2', 'TP53', 'EGFR', 'KRAS', 'PIK3CA', 'APC', 'MYC', 'PTEN', 'RB1', 'VHL', 'CDH1', 'CDKN2A'];
  const refAlt = [['A','G'], ['C','T'], ['G','A'], ['T','C'], ['CTGT','C'], ['C','CT'], ['A','AT'], ['G','GT']];
  
  let numVariants = bamType === 'normal' ? 15 : bamType === 'tumor' ? 25 : 20;
  
  for (let i = 0; i < numVariants; i++) {
    const chrom = chroms[Math.floor(Math.random() * chroms.length)];
    const pos = Math.floor(Math.random() * 10000000) + 100000;
    const ra = refAlt[Math.floor(Math.random() * refAlt.length)];
    const qual = Math.floor(Math.random() * 80) + 20;
    const dp = Math.floor(Math.random() * 100) + 5;
    const qd = (qual / (dp / 10)).toFixed(1);
    const isSnp = ra[0].length === 1 && ra[1].length === 1;
    
    variants.push({
      chrom,
      pos,
      id: Math.random() > 0.7 ? `rs${Math.floor(Math.random() * 10000000)}` : '.',
      ref: ra[0],
      alt: ra[1],
      qual,
      dp,
      qd,
      isSnp
    });
  }
  
  // Ordenar por posición
  variants.sort((a, b) => {
    if (a.chrom !== b.chrom) return a.chrom.localeCompare(b.chrom);
    return a.pos - b.pos;
  });
  
  const snpCount = variants.filter(v => v.isSnp).length;
  const indelCount = variants.filter(v => !v.isSnp).length;
  
  document.getElementById('vc-total').textContent = variants.length;
  document.getElementById('vc-snp').textContent = snpCount;
  document.getElementById('vc-indel').textContent = indelCount;
  
  let vcfOutput = '<div class="vcf-header">#CHROM  POS       ID          REF   ALT   QUAL  FILTER  INFO</div>';
  variants.forEach(v => {
    vcfOutput += `<div class="vcf-line ${v.isSnp ? 'snp' : 'indel'}">`;
    vcfOutput += `${v.chrom.padEnd(7)}  ${String(v.pos).padStart(9)}  ${String(v.id).padEnd(11)}  ${v.ref.padEnd(5)}  ${v.alt.padEnd(5)}  ${String(v.qual).padEnd(5)}  PASS    DP=${v.dp};QD=${v.qd}`;
    vcfOutput += '</div>';
  });
  
  document.getElementById('vc-variants-list').innerHTML = vcfOutput;
  document.getElementById('vc-output').classList.add('active');
}

function runFilterEmulator() {
  // Generar variantes de prueba
  const variants = [];
  const chroms = ['chr1', 'chr2', 'chr3', 'chr17'];
  
  for (let i = 0; i < 50; i++) {
    variants.push({
      chrom: chroms[Math.floor(Math.random() * chroms.length)],
      pos: Math.floor(Math.random() * 1000000) + 100000,
      qual: Math.floor(Math.random() * 100),
      dp: Math.floor(Math.random() * 50) + 2,
      qd: Math.floor(Math.random() * 30) + 2,
      mq: Math.floor(Math.random() * 60) + 10,
      fs: Math.floor(Math.random() * 60),
      isSnp: Math.random() > 0.2
    });
  }
  
  const qualThresh = parseInt(document.getElementById('filter-qual').value);
  const dpThresh = parseInt(document.getElementById('filter-dp').value);
  const qdThresh = parseInt(document.getElementById('filter-qd').value);
  const mqThresh = parseInt(document.getElementById('filter-mq').value);
  const fsThresh = parseInt(document.getElementById('filter-fs').value);
  
  const filtered = variants.filter(v => 
    v.qual >= qualThresh &&
    v.dp >= dpThresh &&
    v.qd >= qdThresh &&
    v.mq >= mqThresh &&
    v.fs <= fsThresh
  );
  
  document.getElementById('filter-initial').textContent = variants.length;
  document.getElementById('filter-passed').textContent = filtered.length;
  document.getElementById('filter-removed').textContent = variants.length - filtered.length;
  
  let filterOutput = '';
  filtered.forEach(v => {
    filterOutput += `<div class="filter-variant ${v.isSnp ? 'snp' : 'indel'}">`;
    filterOutput += `<span class="f-chrom">${v.chrom}</span>`;
    filterOutput += `<span class="f-pos">${v.pos}</span>`;
    filterOutput += `<span class="f-qual">Q=${v.qual}</span>`;
    filterOutput += `<span class="f-dp">DP=${v.dp}</span>`;
    filterOutput += `<span class="f-qd">QD=${v.qd}</span>`;
    filterOutput += `<span class="f-mq">MQ=${v.mq}</span>`;
    filterOutput += `<span class="f-fs">FS=${v.fs}</span>`;
    filterOutput += '</div>';
  });
  
  document.getElementById('filter-variants-list').innerHTML = filterOutput || '<div class="no-variants">Ninguna variante pasó los filtros</div>';
  document.getElementById('filter-output').classList.add('active');
}

function runAnnotationEmulator() {
  const gene = ['BRCA1', 'BRCA2', 'TP53', 'EGFR', 'KRAS', 'PTEN', 'VHL', 'CDH1'][Math.floor(Math.random() * 8)];
  const impacts = ['HIGH', 'MODERATE', 'LOW', 'MODIFIER'];
  const impactWeights = [0.1, 0.25, 0.35, 0.3];
  const rand = Math.random();
  let impact = 'MODIFIER';
  let cumulative = 0;
  for (let i = 0; i < impacts.length; i++) {
    cumulative += impactWeights[i];
    if (rand < cumulative) {
      impact = impacts[i];
      break;
    }
  }
  
  const consequences = {
    'HIGH': ['stop_gained', 'frameshift_variant', 'splice_donor_variant', 'stop_lost'],
    'MODERATE': ['missense_variant', 'inframe_deletion', 'inframe_insertion'],
    'LOW': ['synonymous_variant', '5_prime_UTR_variant', '3_prime_UTR_variant'],
    'MODIFIER': ['intron_variant', 'upstream_gene_variant', 'intergenic_region']
  };
  
  const consequence = consequences[impact][Math.floor(Math.random() * consequences[impact].length)];
  
  document.getElementById('annot-gene').textContent = gene;
  
  const impactEl = document.getElementById('annot-impact');
  impactEl.textContent = impact;
  impactEl.className = 'annot-value impact-badge ' + impact.toLowerCase();
  
  document.getElementById('annot-consequence').textContent = consequence.replace('_', ' ');
  
  // Actualizar detalles
  const details = document.getElementById('annot-details');
  details.innerHTML = `
    <div class="detail-row"><span>Codón:</span><span>c.${Math.floor(Math.random() * 5000) + 1000}${['G>A', 'C>T', 'A>G', 'T>C'][Math.floor(Math.random() * 4)]}</span></div>
    <div class="detail-row"><span>Proteína:</span><span>p.${['Arg', 'His', 'Leu', 'Pro', 'Gln'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 2000) + 100}${['', 'Val', 'Ile', 'Met', 'Thr'][Math.floor(Math.random() * 5)]}</span></div>
    <div class="detail-row"><span>Exón:</span><span>${Math.floor(Math.random() * 20) + 1}/24</span></div>
    <div class="detail-row"><span>ClinVar:</span><span class="clinvar ${['pathogenic', 'likely_pathogenic', 'benign', 'uncertain'][Math.floor(Math.random() * 4)]}">${['Pathogenic', 'Likely Pathogenic', 'Benign', 'Uncertain'][Math.floor(Math.random() * 4)]}</span></div>
    <div class="detail-row"><span>gnomAD:</span><span>${(Math.random() * 0.05).toFixed(4)} (${Math.random() > 0.5 ? 'raro' : 'común'})</span></div>
    <div class="detail-row"><span>CADD:</span><span>${(Math.random() * 20 + 10).toFixed(1)}</span></div>
    <div class="detail-row"><span>PolyPhen:</span><span>${['probably_damaging', 'possibly_damaging', 'benign'][Math.floor(Math.random() * 3)]}</span></div>
  `;
  
  document.getElementById('annot-output').classList.add('active');
}

function runPipelineEmulator() {
  const terminal = document.getElementById('pipe-terminal');
  const status = document.getElementById('pipe-status');
  const progressFill = document.getElementById('pipe-progress-fill');
  const progressText = document.getElementById('pipe-progress-text');
  
  const steps = [];
  if (document.getElementById('pipe-qc').checked) steps.push({name: 'FastQC', cmd: 'fastqc *.fastq.gz'});
  if (document.getElementById('pipe-trim').checked) steps.push({name: 'fastp', cmd: 'fastp -i R1.fq -o clean_R1.fq'});
  if (document.getElementById('pipe-align').checked) steps.push({name: 'BWA', cmd: 'bwa mem ref.fa R1.fq R2.fq'});
  if (document.getElementById('pipe-dedup').checked) steps.push({name: 'MarkDuplicates', cmd: 'gatk MarkDuplicates'});
  if (document.getElementById('pipe-vc').checked) steps.push({name: 'HaplotypeCaller', cmd: 'gatk HaplotypeCaller'});
  if (document.getElementById('pipe-filter').checked) steps.push({name: 'VariantFiltration', cmd: 'gatk VariantFiltration'});
  if (document.getElementById('pipe-annot').checked) steps.push({name: 'SnpEff', cmd: 'snpEff ann hg38 variants.vcf'});
  
  if (steps.length === 0) {
    terminal.textContent = '❌ Selecciona al menos un paso del pipeline';
    return;
  }
  
  status.textContent = 'Ejecutando...';
  terminal.textContent = '';
  
  let currentStep = 0;
  const totalSteps = steps.length;
  
  function runStep() {
    if (currentStep >= totalSteps) {
      status.textContent = '✅ Completado';
      terminal.textContent += '\n\n🎉 Pipeline completado exitosamente!';
      return;
    }
    
    const step = steps[currentStep];
    terminal.textContent += `$ ${step.cmd}\n`;
    terminal.textContent += `[${currentStep + 1}/${totalSteps}] Executing ${step.name}...\n`;
    
    // Simular output
    const outputs = {
      'FastQC': '✓ 12,345,678 reads - Quality: Pass\n',
      'fastp': '✓ Reads after filtering: 11,890,123 (96.3%)\n✓ Adapter trimmed: 1.2%\n',
      'BWA': '✓ Mapped: 98.5% | Properly paired: 96.2%\n',
      'MarkDuplicates': '✓ Duplicates marked: 4.2%\n',
      'HaplotypeCaller': '✓ SNPs: 15,234 | Indels: 2,567\n',
      'VariantFiltration': '✓ Variants filtered: 8,456 high-quality\n',
      'SnpEff': '✓ HIGH: 234 | MODERATE: 1,234 | LOW: 3,456\n'
    };
    
    terminal.textContent += outputs[step.name] || '';
    
    currentStep++;
    const progress = Math.round((currentStep / totalSteps) * 100);
    progressFill.style.width = progress + '%';
    progressText.textContent = progress + '%';
    
    if (terminal.scrollTop) {
      terminal.scrollTop = terminal.scrollHeight;
    }
    
    setTimeout(runStep, 800);
  }
  
  runStep();
}

// Quiz de Genomics
function renderGenomicsQuiz() {
  const questions = [
    { q: "¿Qué herramienta realiza control de calidad?", options: ["FastQC", "BWA", "SnpEff"], correct: 0 },
    { q: "¿Qué formato se usa para almacenar lecturas alineadas?", options: ["FASTA", "BAM", "VCF"], correct: 1 },
    { q: "¿Qué etapa identifica SNPs e indels?", options: ["QC", "Variant Calling", "Trimming"], correct: 1 },
    { q: "¿Qué herramienta anota el efecto de variantes?", options: ["IGV", "SnpEff", "FreeBayes"], correct: 1 },
    { q: "¿Qué significa QC en bioinformática?", options: ["Quantum Computing", "Quality Control", "Query Complex"], correct: 1 },
    { q: "¿Cuántas líneas tiene cada read en formato FASTQ?", options: ["2", "4", "8"], correct: 1 },
    { q: "¿Qué herramienta es mejor para long reads (Nanopore)?", options: ["BWA", "minimap2", "Bowtie2"], correct: 1 },
    { q: "¿Qué formato es la versión comprimida de SAM?", options: ["BAM", "VCF", "FASTA"], correct: 0 },
    { q: "¿Qué parámetro indica profundidad de lectura?", options: ["QUAL", "DP", "FS"], correct: 1 },
    { q: "¿Qué herramienta usa deep learning para variant calling?", options: ["GATK", "FreeBayes", "DeepVariant"], correct: 2 }
  ];
  
  return `
    <div class="cli-quiz">
      ${questions.map((q, i) => `
        <div class="quiz-q">
          <p><strong>Pregunta ${i+1}:</strong> ${q.q}</p>
          <div class="quiz-opts">
            ${q.options.map((opt, j) => `
              <button class="quiz-opt" data-q="${i}" data-correct="${j === q.correct}">${opt}</button>
            `).join('')}
          </div>
          <div id="genQuizFb-${i}" class="quiz-feedback hidden"></div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderGenomicsModule() {
  const isCompleted = state.completed.genomics;
  return `
    <div class="cli-module-enhanced">
      <div class="cli-header">
        <h2>🧬 ${moduleData.genomics.title}</h2>
        <p class="cli-description">${moduleData.genomics.description}</p>
        <div class="header-buttons">
          <button class="back-btn" onclick="renderModulesList()">← Volver a módulos</button>
          <button class="complete-module-btn ${isCompleted ? 'completed' : ''}" onclick="completeModule('genomics')">
            ${isCompleted ? '✅ Completado' : '🎯 Completar Módulo'}
          </button>
        </div>
      </div>
      
      <div class="cli-tabs">
        <button class="cli-tab active" data-tab="pipeline">🔄 Pipeline</button>
        <button class="cli-tab" data-tab="emuladores">🧪 Emuladores</button>
        <button class="cli-tab" data-tab="herramientas">🛠️ Herramientas</button>
        <button class="cli-tab" data-tab="ejercicios">✏️ Ejercicios</button>
        <button class="cli-tab" data-tab="quiz">❓ Quiz</button>
      </div>
      
      <div class="cli-tab-content" id="genTabPipeline">
        ${renderGenomicsLesson()}
      </div>
      
      <div class="cli-tab-content hidden" id="genTabEmuladores">
        ${renderGenomicsEmulators()}
      </div>
      
      <div class="cli-tab-content hidden" id="genTabHerramientas">
        ${renderGenomicsLesson()}
      </div>
      
      <div class="cli-tab-content hidden" id="genTabEjercicios">
        ${renderGenomicsInteractive()}
      </div>
      
      <div class="cli-tab-content hidden" id="genTabQuiz">
        ${renderGenomicsQuiz()}
      </div>
    </div>
  `;
}

// ---------- MÓDULO 4: FILOGENÉTICA ----------

function renderPhyloLesson() {
  return `
    <div class="lesson phylo-intro">
      <h3>🌳 Fundamentos de Filogenética</h3>
      <p>La filogenética reconstruye la historia evolutiva de los organismos mediante el análisis comparativo de secuencias moleculares.</p>
      
      <div class="phylo-concepts">
        <div class="concept-card">
          <h5>📐 Alineamiento Múltiple (MSA)</h5>
          <p>Alinear múltiples secuencias para identificar regiones conservadas.</p>
          <p><strong>Herramientas:</strong> MAFFT, Clustal Omega, MUSCLE</p>
        </div>
        <div class="concept-card">
          <h5>📊 Selección de Modelo</h5>
          <p>Elegir el modelo evolutivo que mejor describe las sustituciones.</p>
          <p><strong>Modelos:</strong> JTT, GTR, HKLY85</p>
        </div>
        <div class="concept-card">
          <h5>🌲 Inferencia Filogenética</h5>
          <p>Construir árboles que representan relaciones evolutivas.</p>
          <p><strong>Métodos:</strong> NJ, ML, Bayesiano</p>
        </div>
        <div class="concept-card">
          <h5>📈 Bootstrap</h5>
          <p>Evaluar la robustez statistical de cada nodo en el árbol.</p>
          <p><strong>Interpretación:</strong> >70% soporte moderate, >90% fuerte</p>
        </div>
      </div>
    </div>

    <div class="lesson">
      <h3>🧬 Interpretación de árboles</h3>
      <div class="code">Ejemplo de árbol Newick:
((SpeciesA:0.1,SpeciesB:0.1):0.5,(SpeciesC:0.2,SpeciesD:0.2):0.3);

- Las ramas cortas = evolución rápida
- Las ramas largas = evolución lenta  
- Bootstrap alto = nodo bien soportado
- outgroup = grupo externo para rooting</div>
    </div>

    <div class="lesson">
      <h3>🛠️ Herramientas de Filogenética</h3>
      <ul>
        <li><strong>MAFFT:</strong> Alineamiento múltiple rápido</li>
        <li><strong>IQ-TREE:</strong> Máxima verosimilitud + ultrafast bootstrap</li>
        <li><strong>RAxML:</strong> Filogenias de máxima verosimilitud</li>
        <li><strong>MrBayes:</strong> Inferencia bayesiana</li>
        <li><strong>FigTree:</strong> Visualización de árboles</li>
      </ul>
    </div>
  `;
}

function renderPhyloInteractive() {
  return `
    <div class="interactive">
      <h4>🌳 Identifica el tipo de árbol</h4>
      <div class="exercise-card">
        <p>¿Qué método de inferencia es más usado para árboles filogenéticos grandes?</p>
        <select id="phyloEx1">
          <option value="">Selecciona...</option>
          <option value="nj">Neighbor Joining</option>
          <option value="ml">Maximum Likelihood</option>
          <option value="bayes">Bayesiano</option>
        </select>
        <button onclick="checkPhyloEx1()">Verificar</button>
        <div id="phyloEx1Feedback" class="feedback hidden"></div>
      </div>
      
      <div class="exercise-card">
        <p>Si un nodo tiene bootstrap 95%, ¿cómo lo interpretas?</p>
        <input type="text" id="phyloEx2" placeholder="Alto soporte estadístico">
        <button onclick="checkPhyloEx2()">Verificar</button>
        <div id="phyloEx2Feedback" class="feedback hidden"></div>
      </div>
    </div>

    <div class="interactive">
      <h4>🧪 Laboratorio: Construye un alineamiento</h4>
      <p>Ordena los pasos para crear un árbol filogenético:</p>
      <div class="phylo-steps">
        <div class="phylo-step">1. Obtener secuencias</div>
        <div class="phylo-step">2. Alineamiento múltiple (MAFFT)</div>
        <div class="phylo-step">3. Seleccionar modelo (ModelFinder)</div>
        <div class="phylo-step">4. Inferir árbol (IQ-TREE)</div>
        <div class="phylo-step">5. Visualizar (FigTree)</div>
      </div>
      <input type="text" id="phyloLabInput" placeholder="Escribe el orden: 1,2,3,4,5">
      <button onclick="checkPhyloLab()">Verificar</button>
      <div id="phyloLabFeedback" class="feedback hidden"></div>
    </div>
  `;
}

function renderPhyloQuiz() {
  const questions = [
    { q: "¿Qué herramienta para alineamiento múltiple es más rápida?", options: ["MAFFT", "Clustal", "T-Coffee"] },
    { q: "¿Qué significa bootstrap en filogenética?", options: ["Un programa", "Soporte estadístico", "Un modelo"] },
    { q: "¿Qué formato se usa para representar árboles?", options: ["FASTA", "Newick", "VCF"] },
    { q: "¿Cuál método usa máxima verosimilitud?", options: ["NJ", "ML", "Parsimony"] },
    { q: "¿Qué valor de bootstrap indica alto soporte?", options: ["50%", "95%", "10%"] }
  ];
  const answers = [0, 1, 1, 1, 1];
  
  return `
    <div class="cli-quiz">
      ${questions.map((q, i) => `
        <div class="quiz-q">
          <p><strong>Pregunta ${i+1}:</strong> ${q.q}</p>
          <div class="quiz-opts">
            ${q.options.map((opt, j) => `
              <button class="quiz-opt" data-q="${i}" data-correct="${j === answers[i]}">${opt}</button>
            `).join('')}
          </div>
          <div id="phyloQuizFb-${i}" class="quiz-feedback hidden"></div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPhyloModule() {
  const isCompleted = state.completed.phylo;
  return `
    <div class="cli-module-enhanced">
      <div class="cli-header">
        <h2>🌳 ${moduleData.phylo.title}</h2>
        <p class="cli-description">${moduleData.phylo.description}</p>
        <div class="header-buttons">
          <button class="back-btn" onclick="renderModulesList()">← Volver a módulos</button>
          <button class="complete-module-btn ${isCompleted ? 'completed' : ''}" onclick="completeModule('phylo')">
            ${isCompleted ? '✅ Completado' : '🎯 Completar Módulo'}
          </button>
        </div>
      </div>
      
      <div class="cli-tabs">
        <button class="cli-tab active" data-tab="conceptos">📚 Conceptos</button>
        <button class="cli-tab" data-tab="herramientas">🛠️ Herramientas</button>
        <button class="cli-tab" data-tab="ejercicios">✏️ Ejercicios</button>
        <button class="cli-tab" data-tab="quiz">❓ Quiz</button>
      </div>
      
      <div class="cli-tab-content" id="phyloTabConceptos">
        ${renderPhyloLesson()}
      </div>
      
      <div class="cli-tab-content hidden" id="phyloTabHerramientas">
        ${renderPhyloLesson()}
      </div>
      
      <div class="cli-tab-content hidden" id="phyloTabEjercicios">
        ${renderPhyloInteractive()}
      </div>
      
      <div class="cli-tab-content hidden" id="phyloTabQuiz">
        ${renderPhyloQuiz()}
      </div>
    </div>
  `;
}

// Función para renderizar módulos con tabs
function renderModule(moduleKey) {
  const module = moduleData[moduleKey];
  const container = document.getElementById("moduleContent");
  
  if (moduleKey === 'cli') {
    // WSL Section - se muestra ANTES del título del módulo
    const wslSection = `
      <div class="cli-wsl-section">
        <h3>🪟 Instalar Ubuntu en Windows con WSL</h3>
        <p>Antes de usar la línea de comando, necesitas Ubuntu en tu Windows:</p>
        
        <div class="wsl-steps">
          <div class="wsl-step">
            <div class="wsl-step-number">1</div>
            <div class="wsl-step-content">
              <h4>Abre PowerShell como Administrador</h4>
              <p>Menú Inicio → "Windows PowerShell (Administrador)"</p>
              <div class="wsl-capture">
                <img src="assets/captures/wsl-install-1.svg" alt="Paso 1: PowerShell">
              </div>
              <code class="wsl-command">wsl --install</code>
            </div>
          </div>
          
          <div class="wsl-step">
            <div class="wsl-step-number">2</div>
            <div class="wsl-step-content">
              <h4>Reinicia tu PC</h4>
              <p>Después del reinicio, Ubuntu se configurará automáticamente.</p>
              <div class="wsl-capture">
                <img src="assets/captures/wsl-install-2.svg" alt="Paso 2: Configuración">
              </div>
              <p class="wsl-note">📝 Crea tu usuario y contraseña cuando se te pida.</p>
            </div>
          </div>
          
          <div class="wsl-step">
            <div class="wsl-step-number">3</div>
            <div class="wsl-step-content">
              <h4>✅ Verifica la instalación</h4>
              <code class="wsl-command">wsl -l -v</code>
              <div class="wsl-capture">
                <img src="assets/captures/wsl-install-3.svg" alt="Paso 3: Verificación">
              </div>
            </div>
          </div>
        </div>
        
        <div class="wsl-alternatives">
          <h4>💡 Alternativas:</h4>
          <ul>
            <li><strong>Microsoft Store:</strong> Busca "Ubuntu" e instala</li>
            <li><strong>CMD:</strong> <code>wsl --install -d Ubuntu</code></li>
          </ul>
        </div>
      </div>
    `;
    
    // Usar el nuevo renderizado con tabs para CLI
    const isCliCompleted = state.completed.cli;
    container.classList.remove("hidden");
    container.innerHTML = `
      ${wslSection}
      <div class="cli-module-enhanced">
        <div class="cli-header">
          <h2>🖥️ ${module.title}</h2>
          <p class="cli-description">${module.description}</p>
          <div class="header-buttons">
            <button class="back-btn" onclick="renderModulesList()">← Volver a módulos</button>
            <button class="complete-module-btn ${isCliCompleted ? 'completed' : ''}" onclick="completeModule('cli')">
              ${isCliCompleted ? '✅ Completado' : '🎯 Completar Módulo'}
            </button>
          </div>
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
  } else if (moduleKey === 'db') {
    container.innerHTML = renderDBModule();
  } else if (moduleKey === 'genomics') {
    container.innerHTML = renderGenomicsModule();
  } else if (moduleKey === 'phylo') {
    container.innerHTML = renderPhyloModule();
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
  attachTabHandlers();
  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Función para manejar tabs
function attachTabHandlers() {
  document.querySelectorAll('.cli-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const module = tab.closest('.cli-module-enhanced');
      module.querySelectorAll('.cli-tab').forEach(t => t.classList.remove('active'));
      module.querySelectorAll('.cli-tab-content').forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      
      const contentId = tab.dataset.tab;
      const moduleKey = module.querySelector('.cli-header h2').textContent.includes('Línea') ? 'cli' : 
                        module.querySelector('.cli-header h2').textContent.includes('bases') ? 'db' :
                        module.querySelector('.cli-header h2').textContent.includes('Genómica') ? 'gen' : 'phylo';
      
      const prefix = moduleKey === 'cli' ? 'cli' : 
                     moduleKey === 'db' ? 'db' :
                     moduleKey === 'gen' ? 'gen' : 'phylo';
      
      const contentEl = document.getElementById(prefix + 'Tab' + contentId.charAt(0).toUpperCase() + contentId.slice(1));
      if (contentEl) contentEl.classList.remove('hidden');
    });
  });
  
  // Handlers para quiz de cada módulo
  document.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const q = e.target.closest('.quiz-q');
      const fb = q.querySelector('.quiz-feedback');
      const isCorrect = e.target.dataset.correct === 'true';
      
      q.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
      
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

// Renderizar Biblioteca
function renderCLIBiblioteca() {
  // Sección WSL al inicio
  const wslSection = `
    <div class="cli-wsl-section">
      <h3>🪟 Instalar Ubuntu en Windows con WSL</h3>
      <p>Antes de usar la línea de comando, necesitas Ubuntu en tu Windows:</p>
      
      <div class="wsl-steps">
        <div class="wsl-step">
          <div class="wsl-step-number">1</div>
          <div class="wsl-step-content">
            <h4>Abre PowerShell como Administrador</h4>
            <p>Menú Inicio → "Windows PowerShell (Administrador)"</p>
            <div class="wsl-capture">
              <img src="assets/captures/wsl-install-1.svg" alt="Paso 1: PowerShell">
            </div>
            <code class="wsl-command">wsl --install</code>
          </div>
        </div>
        
        <div class="wsl-step">
          <div class="wsl-step-number">2</div>
          <div class="wsl-step-content">
            <h4>Reinicia tu PC</h4>
            <p>Después del reinicio, Ubuntu se configurará automáticamente.</p>
            <div class="wsl-capture">
              <img src="assets/captures/wsl-install-2.svg" alt="Paso 2: Configuración">
            </div>
            <p class="wsl-note">📝 Crea tu usuario y contraseña cuando se te pida.</p>
          </div>
        </div>
        
        <div class="wsl-step">
          <div class="wsl-step-number">3</div>
          <div class="wsl-step-content">
            <h4>✅ Verifica la instalación</h4>
            <code class="wsl-command">wsl -l -v</code>
            <div class="wsl-capture">
              <img src="assets/captures/wsl-install-3.svg" alt="Paso 3: Verificación">
            </div>
          </div>
        </div>
      </div>
      
      <div class="wsl-alternatives">
        <h4>💡 Alternativas:</h4>
        <ul>
          <li><strong>Microsoft Store:</strong> Busca "Ubuntu" e instala</li>
          <li><strong>CMD:</strong> <code>wsl --install -d Ubuntu</code></li>
        </ul>
      </div>
    </div>
  `;

  const categories = {};
  cliCommandCatalog.forEach(cmd => {
    if (!categories[cmd.category]) categories[cmd.category] = [];
    categories[cmd.category].push(cmd);
  });

  return `
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
              const isFavorite = favorites.includes(c.cmd);
              return `
                <div class="cli-cmd-item" data-cmd="${c.cmd}">
                  <div class="cmd-header-row">
                    <code class="cmd-name">${c.cmd}</code>
                    <code class="cmd-syntax">${c.syntax}</code>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite('${c.cmd}')" 
                            title="${isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
                      ${isFavorite ? '⭐' : '☆'}
                    </button>
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
    'Genómica': '🧬'
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

      <div class="exercise-card">
        <h4>✏️ Ejercicio 7: Ver calidad con FastQC</h4>
        <p>Escribe el comando para ejecutar FastQC en un archivo FASTQ:</p>
        <input type="text" id="ex7-input" placeholder="fastqc archivo.fastq.gz">
        <button onclick="checkEx7()">Verificar</button>
        <div id="ex7-feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h4>✏️ Ejercicio 8: Comprimir archivo</h4>
        <p>Escribe el comando para comprimir un archivo TSV:</p>
        <input type="text" id="ex8-input" placeholder="gzip archivo.tsv">
        <button onclick="checkEx8()">Verificar</button>
        <div id="ex8-feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h4>✏️ Ejercicio 9: Ver estadísticas de mapeo</h4>
        <p>Escribe el comando para ver estadísticas de un archivo BAM:</p>
        <input type="text" id="ex9-input" placeholder="samtools flagstat archivo.bam">
        <button onclick="checkEx9()">Verificar</button>
        <div id="ex9-feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h4>✏️ Ejercicio 10: Filtrar variantes por calidad</h4>
        <p>Usa bcftools para filtrar variantes con QUAL >= 30:</p>
        <input type="text" id="ex10-input" placeholder="bcftools view -i 'QUAL>=30' variantes.vcf">
        <button onclick="checkEx10()">Verificar</button>
        <div id="ex10-feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h4>✏️ Ejercicio 11: Crear estructura de proyecto</h4>
        <p>Crea directorios para un proyecto bioinfo:</p>
        <input type="text" id="ex11-input" placeholder="mkdir -p proyecto/{data,results,scripts}">
        <button onclick="checkEx11()">Verificar</button>
        <div id="ex11-feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card">
        <h4>✏️ Ejercicio 12: Descargar genoma de referencia</h4>
        <p>Usa wget para descargar un archivo del NCBI:</p>
        <input type="text" id="ex12-input" placeholder="wget https://example.org/genome.fa.gz">
        <button onclick="checkEx12()">Verificar</button>
        <div id="ex12-feedback" class="feedback hidden"></div>
      </div>

      <!-- EJERCICIOS FINALES: Usar --help para Genómica -->
      <div class="exercise-card is-help-exercise">
        <h4>🏆 Ejercicio Final: Descubrir herramientas con --help</h4>
        <div class="ejercicio-help-intro">
          <p><strong>Escenario:</strong> Tienes un archivo <code>mapped.bam</code> y necesitas saber cuántas lecturas se mapean correctamente y el porcentaje de cobertura.</p>
          <p><strong>Tu misión:</strong> Usa <code>--help</code> para descubrir qué herramienta y opción usar.</p>
          <div class="pasos-investigacion">
            <span class="step-badge">1</span> Escribe <code>samtools --help</code> para ver los subcomandos disponibles<br>
            <span class="step-badge">2</span> Elige el subcomando apropiado y usa <code>--help</code> para ver sus opciones<br>
            <span class="step-badge">3</span> Escribe el comando final que muestre las estadísticas de mapeo
          </div>
        </div>
        <input type="text" id="ex13-input" placeholder="Escribe tu comando aquí...">
        <button onclick="checkEx13()">💡 Ver pista</button>
        <button onclick="checkEx13(true)">Verificar</button>
        <div id="ex13-feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card is-help-exercise">
        <h4>🔬 Ejercicio: Filtrar variantes con bcftools</h4>
        <div class="ejercicio-help-intro">
          <p><strong>Escenario:</strong> Tienes un archivo <code>variants.vcf</code> con variantes y quieres filtrar solo aquellas con calidad (QUAL) mayor o igual a 30 Y profundidad de lectura (DP) mayor o igual a 10.</p>
          <p><strong>Tu misión:</strong> Usa <code>bcftools --help</code> para descubrir cómo filtrar variantes.</p>
          <div class="pasos-investigacion">
            <span class="step-badge">1</span> Escribe <code>bcftools --help</code> para ver los comandos disponibles<br>
            <span class="step-badge">2</span> Identifica el subcomando para filtrar VCFs<br>
            <span class="step-badge">3</span> Escribe el comando con la condición de filtro
          </div>
        </div>
        <input type="text" id="ex14-input" placeholder="Escribe tu comando aquí...">
        <button onclick="checkEx14()">💡 Ver pista</button>
        <button onclick="checkEx14(true)">Verificar</button>
        <div id="ex14-feedback" class="feedback hidden"></div>
      </div>

      <div class="exercise-card is-help-exercise">
        <h4>📊 Ejercicio: Control de calidad con FastQC</h4>
        <div class="ejercicio-help-intro">
          <p><strong>Escenario:</strong> Tienes archivos FASTQ comprimidos (<code>sample_R1.fastq.gz</code> y <code>sample_R2.fastq.gz</code>) y quieres hacer control de calidad.</p>
          <p><strong>Tu misión:</strong> Investiga con <code>fastqc --help</code> para:</p>
          <div class="pasos-investigacion">
            <span class="step-badge">1</span> Ver cómo especificar múltiples archivos<br>
            <span class="step-badge">2</span> Descubrir cómo especificar directorio de salida (-o)<br>
            <span class="step-badge">3</span> Escribe el comando completo
          </div>
        </div>
        <input type="text" id="ex15-input" placeholder="Escribe tu comando aquí...">
        <button onclick="checkEx15()">💡 Ver pista</button>
        <button onclick="checkEx15(true)">Verificar</button>
        <div id="ex15-feedback" class="feedback hidden"></div>
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
  // Generar challenge del día
  const today = new Date().getDate();
  const challenges = [
    {
      title: "🎯 Challenge del Día: Contar Genes",
      desc: "Tienes un archivo FASTA con genes. ¿Cuántos genes tiene?",
      hint: "Usa grep para buscar los encabezados (^>) y wc para contar",
      answer: "grep '^>' genes.fasta | wc -l"
    },
    {
      title: "🎯 Challenge del Día: Filtrar Reads de Calidad",
      desc: "Un archivo FASTQ tiene reads con calidad baja en las últimas 10 bases. ¿Cómo las recorta?",
      hint: "Usa fastp o trimmomatic",
      answer: "fastp -i reads.fq -o reads_clean.fq --cut_tail"
    },
    {
      title: "🎯 Challenge del Día: Encontrar SNPs",
      desc: "Tienes un VCF y quieres solo variantes con calidad >= 50",
      hint: "Usa bcftools con filtro de QUAL",
      answer: "bcftools view -i 'QUAL>=50' variantes.vcf"
    },
    {
      title: "🎯 Challenge del Día: Extraer Exones",
      desc: "Tienes un BED con exones y quieres saber cuántos覆盖率 tiene un BAM",
      hint: "Usa bedtools coverage",
      answer: "bedtools coverage -a exones.bed -b mapeo.bam"
    }
  ];
  const dailyChallenge = challenges[today % challenges.length];

  return `
    <div class="cli-lab">
      <!-- Daily Challenge -->
      <div class="lab-section daily-challenge">
        <h4>${dailyChallenge.title}</h4>
        <p>${dailyChallenge.desc}</p>
        <p class="hint">💡 Pista: ${dailyChallenge.hint}</p>
        <input type="text" id="challenge-input" placeholder="Escribe el comando completo...">
        <button onclick="checkDailyChallenge()">Verificar</button>
        <div id="challenge-feedback" class="feedback hidden"></div>
      </div>

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

      <!-- Simulador de Análisis Completo -->
      <div class="lab-section simulation-lab">
        <h4>🧬 Simulador: Análisis de Variantes</h4>
        <p>Sigue los pasos para completar un análisis de variantes:</p>
        
        <div class="simulation-steps">
          <div class="sim-step" data-step="1">
            <span class="step-num">1</span>
            <div class="step-content">
              <strong>QC de lecturas</strong>
              <code>fastqc muestras/*.fastq.gz</code>
              <button class="sim-btn" onclick="runSimStep(1)">Simular</button>
              <div class="sim-output hidden" id="sim-out-1">✓ FastQC completado: 24 archivos procesados</div>
            </div>
          </div>
          
          <div class="sim-step" data-step="2">
            <span class="step-num">2</span>
            <div class="step-content">
              <strong>Alineamiento</strong>
              <code>bwa mem ref.fa R1.fq R2.fq > alineamiento.sam</code>
              <button class="sim-btn" onclick="runSimStep(2)">Simular</button>
              <div class="sim-output hidden" id="sim-out-2">✓ Alineamiento: 98.5% mapeo</div>
            </div>
          </div>
          
          <div class="sim-step" data-step="3">
            <span class="step-num">3</span>
            <div class="step-content">
              <strong>Variant Calling</strong>
              <code>bcftools call -v variantes.bcf > variantes.vcf</code>
              <button class="sim-btn" onclick="runSimStep(3)">Simular</button>
              <div class="sim-output hidden" id="sim-out-3">✓ 15,234 variantes detectadas</div>
            </div>
          </div>
          
          <div class="sim-step" data-step="4">
            <span class="step-num">4</span>
            <div class="step-content">
              <strong>Filtrado</strong>
              <code>bcftools view -i 'QUAL>=30' variantes.vcf > variantes_filt.vcf</code>
              <button class="sim-btn" onclick="runSimStep(4)">Simular</button>
              <div class="sim-output hidden" id="sim-out-4">✓ 8,456 variantes de alta calidad</div>
            </div>
          </div>
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
      options: ["wc -l archivo", "count archivo", "lines archivo"],
      correct: 0
    },
    {
      q: "¿Para qué sirve el flag -h en ls?",
      options: ["Muestra tamaños legibles", "Muestra archivos ocultos", "Ordena por fecha"],
      correct: 0
    },
    {
      q: "¿Cómo visualizas un archivo .gz sin descomprimirlo?",
      options: ["zcat archivo.gz | head", "cat archivo.gz", "unzip archivo.gz"],
      correct: 0
    },
    {
      q: "¿Qué comando filtra columnas específicas de un TSV?",
      options: ["cut -f1,3 archivo.tsv", "filter -c archivo.tsv", "select -col archivo.tsv"],
      correct: 0
    },
    {
      q: "¿Cuál es el propósito de samtools flagstat?",
      options: ["Mostrar estadísticas de mapeo", "Convertir BAM a SAM", "Indexar archivos"],
      correct: 0
    },
    {
      q: "¿Qué significa el formato FASTA?",
      options: ["Fast All - texto con encabezados y secuencias", "File Archive Text", "Formatted Amino Acid Sequence"],
      correct: 0
    },
    {
      q: "¿Cuántas líneas tiene cada read en formato FASTQ?",
      options: ["4 líneas (ID, seq, +, quality)", "2 líneas", "1 línea"],
      correct: 0
    },
    {
      q: "¿Qué comando usas para ver las últimas líneas de un archivo?",
      options: ["tail", "last", "end"],
      correct: 0
    },
    {
      q: "¿Para qué sirve bcftools?",
      options: ["Análisis de variantes (SNPs/indels)", "Alineamiento de secuencias", "Ensamblaje de genomas"],
      correct: 0
    },
    {
      q: "¿Qué formato se usa para variantes genéticas?",
      options: ["VCF (Variant Call Format)", "JSON", "XML"],
      correct: 0
    }
  ];

  return `
    <div class="cli-quiz">
      ${questions.map((q, i) => `
        <div class="quiz-q">
          <p><strong>Pregunta ${i+1}:</strong> ${q.q}</p>
          <div class="quiz-opts">
            ${q.options.map((opt, j) => `
              <button class="quiz-opt" data-q="${i}" data-a="${j}" data-correct="${j === q.correct}">${opt}</button>
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

// ============================================
   // HANDLERS PARA MÓDULOS DB, GENOMICS Y PHYLO
// ============================================

// ---------- Handlers Módulo DB ----------
window.buildDBQuery = function() {
  const gene = document.getElementById('dbGene').value.trim();
  const organism = document.getElementById('dbOrganism').value.trim();
  const db = document.getElementById('dbSelect').value;
  const result = document.getElementById('dbQueryResult');
  
  if (!gene || !organism) {
    result.textContent = '⚠️ Completa todos los campos';
    return;
  }
  
  result.textContent = `Consulta generada para ${db}:\n"${gene}"[All Fields] AND "${organism}"[Organism]`;
};

window.checkDBEx1 = function() {
  const input = document.getElementById('exDB1').value.toLowerCase();
  const fb = document.getElementById('dbEx1Feedback');
  const ok = input.includes('cytochrome') && input.includes('homo sapiens') && input.includes('gene');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: usa "cytochrome c"[Gene] AND Homo sapiens[Organism]'; fb.className = 'feedback err'; }
};

window.checkDBEx2 = function() {
  const input = document.getElementById('exDB2').value.toLowerCase();
  const fb = document.getElementById('dbEx2Feedback');
  const ok = input.includes('dna repair') && input.includes('yeast');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: "DNA repair"[Keyword] AND yeast[Organism]'; fb.className = 'feedback err'; }
};

window.checkDBEx3 = function() {
  const input = document.getElementById('exDB3').value.toLowerCase();
  const fb = document.getElementById('dbEx3Feedback');
  const ok = (input.includes('brca1') || input.includes('brca2')) && input.includes('homo sapiens');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: (BRCA1 OR BRCA2) AND Homo sapiens[Organism]'; fb.className = 'feedback err'; }
};

window.checkDBEx4 = function() {
  const input = document.getElementById('exDB4').value.toLowerCase();
  const fb = document.getElementById('dbEx4Feedback');
  const ok = input.includes('covid') && input.includes('title');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: COVID-19[Title]'; fb.className = 'feedback err'; }
};

window.checkDBEx5 = function() {
  const input = document.getElementById('exDB5').value.toLowerCase();
  const fb = document.getElementById('dbEx5Feedback');
  const ok = input.includes('sars-cov-2') && input.includes('2020') && input.includes('2023');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: SARS-CoV-2[Title/Abstract] AND ("2020/01/01"[PDAT] : "2023/12/31"[PDAT])'; fb.className = 'feedback err'; }
};

window.checkDBEx6 = function() {
  const input = document.getElementById('exDB6').value.toLowerCase();
  const fb = document.getElementById('dbEx6Feedback');
  const ok = input.includes('txid9606') || (input.includes('9606') && input.includes('organism'));
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! TaxID 9606 = Homo sapiens'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: txid9606[Organism:exp]'; fb.className = 'feedback err'; }
};

window.checkDBEx7 = function() {
  const input = document.getElementById('exDB7').value.toLowerCase();
  const fb = document.getElementById('dbEx7Feedback');
  const ok = input.includes('arabidopsis') && input.includes('photosynthesis');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: organism:"Arabidopsis thaliana" AND photosynthesis'; fb.className = 'feedback err'; }
};

window.checkDBEx8 = function() {
  const input = document.getElementById('exDB8').value.toLowerCase();
  const fb = document.getElementById('dbEx8Feedback');
  const ok = input.includes('hemoglobin') || input.includes('haemoglobin');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: hemoglobin[Title]'; fb.className = 'feedback err'; }
};

window.buildDBQuery = function() {
  const gene = document.getElementById('dbGene').value.trim();
  const organism = document.getElementById('dbOrganism').value.trim();
  const db = document.getElementById('dbSelect').value;
  const reviewed = document.getElementById('filterReviewed').checked;
  const result = document.getElementById('dbQueryResult');
  const preview = document.getElementById('queryPreviewText');
  
  let query = '';
  
  if (gene && organism) {
    query = `"${gene}"[All Fields] AND ${organism}[Organism]`;
  } else if (gene) {
    query = `"${gene}"[All Fields]`;
  } else if (organism) {
    query = `${organism}[Organism]`;
  } else {
    result.textContent = '⚠️ Ingresa al menos un término de búsqueda';
    return;
  }
  
  if (reviewed) {
    query += ' AND reviewed[Properties]';
  }
  
  const urls = {
    nucleotide: `https://www.ncbi.nlm.nih.gov/nuccore/?term=${encodeURIComponent(query)}`,
    protein: `https://www.ncbi.nlm.nih.gov/protein/?term=${encodeURIComponent(query)}`,
    pubmed: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`,
    structure: `https://www.ncbi.nlm.nih.gov/structure/?term=${encodeURIComponent(query)}`,
    gene: `https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(query)}`,
    geo: `https://www.ncbi.nlm.nih.gov/geo/browse/?term=${encodeURIComponent(query)}`
  };
  
  preview.textContent = query;
  result.innerHTML = `
🔗 Enlace a ${db}:
<a href="${urls[db]}" target="_blank">${urls[db]}</a>

📝 Consulta generada: ${query}

💡 Copia esta consulta y úsala en la base de datos seleccionada
  `;
};

window.simulateDBSearch = function() {
  const query = document.getElementById('dbSimInput').value.trim();
  const result = document.getElementById('dbSimResult');
  
  if (!query) {
    result.textContent = '⚠️ Ingresa un término de búsqueda';
    return;
  }
  
  result.textContent = `Simulando búsqueda de "${query}"...
  
Resultados encontrados: 1,234 secuencias
- Seq_001: ${query} - Organism: Homo sapiens
- Seq_002: ${query} variant - Organism: Pan troglodytes
- Seq_003: ${query} related - Organism: Gorilla gorilla

Total: 1,234 secuencias en 15.2 segundos`;
};

// ---------- Handlers Módulo Genomics ----------
// Pipeline order handler - usado tanto en CLI como Genómica
window.checkPipelineOrder = function() {
  const inputEl = document.getElementById('pipelineOrderInput');
  if (!inputEl) {
    console.error('Elemento pipelineOrderInput no encontrado');
    return;
  }
  const input = inputEl.value.replace(/\s/g, '');
  
  // Determinar qué respuesta es correcta según el contexto
  // CLI: 1,2,3,4,5 | Genómica: 8,1,2,3,4,5,6,7
  const cliCorrect = '12345';
  const genCorrect = '81234567';
  
  const fb = document.getElementById('genPipelineFeedback') || document.getElementById('pipelineOrderFeedback');
  if (!fb) {
    console.error('Elemento de feedback no encontrado');
    return;
  }
  
  fb.classList.remove('hidden');
  
  if (input === genCorrect) { 
    fb.textContent = '✅ ¡Correcto! Pipeline: Datos → QC → Trim → Alineamiento → Variant Calling → Filtrado → Anotación → Interpretación'; 
    fb.className = 'feedback ok'; 
  }
  else if (input === cliCorrect) {
    fb.textContent = '✅ ¡Correcto! Pipeline en orden'; 
    fb.className = 'feedback ok';
  }
  else { 
    fb.textContent = '❌ Orden: 8,1,2,3,4,5,6,7 (Datos→QC→Trim→Alineamiento→VariantCalling→Filtrado→Anotación→Interpretación)'; 
    fb.className = 'feedback err'; 
  }
};

window.checkGenEx1 = function() {
  const input = document.getElementById('exGen1').value.toLowerCase().trim();
  const fb = document.getElementById('genEx1Feedback');
  const ok = input.includes('freebayes') || input.includes('gatk') || input.includes('variant calling');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: FreeBayes o GATK'; fb.className = 'feedback err'; }
};

window.checkGenEx2 = function() {
  const input = document.getElementById('exGen2').value.toLowerCase().trim();
  const fb = document.getElementById('genEx2Feedback');
  const ok = input.includes('sam') || input.includes('bam');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! SAM/BAM'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: SAM o BAM'; fb.className = 'feedback err'; }
};

window.checkGenEx3 = function() {
  const input = document.getElementById('exGen3').value.toLowerCase();
  const fb = document.getElementById('genEx3Feedback');
  const ok = input.includes('bcftools') || input.includes('freebayes') || input.includes('gatk');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: bcftools call, freebayes, o gatk'; fb.className = 'feedback err'; }
};

window.checkGenEx4 = function() {
  const input = document.getElementById('exGen4').value.toLowerCase();
  const fb = document.getElementById('genEx4Feedback');
  const ok = (input.includes('qual') || input.includes('>30')) && (input.includes('dp') || input.includes('>10'));
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! Filtro: QUAL>30 Y DP>10'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: bcftools view -i \'QUAL>30 && DP>10\''; fb.className = 'feedback err'; }
};

window.checkGenEx5 = function() {
  const input = document.getElementById('exGen5').value.toLowerCase();
  const fb = document.getElementById('genEx5Feedback');
  const ok = input.includes('snpeff') || input.includes('snpEff');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! SnpEff anota variantes'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: snpEff ann hg38 variants.vcf'; fb.className = 'feedback err'; }
};

window.checkGenEx6 = function() {
  const input = document.getElementById('exGen6').value.trim();
  const fb = document.getElementById('genEx6Feedback');
  const ok = input === '4';
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! FASTQ tiene 4 líneas: ID, secuencia, +, calidad'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: 4 líneas'; fb.className = 'feedback err'; }
};

window.checkGenEx7 = function() {
  const input = document.getElementById('exGen7').value.toLowerCase().trim();
  const fb = document.getElementById('genEx7Feedback');
  const ok = input === 'bam';
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! BAM es la versión comprimida de SAM'; fb.className = 'feedback ok'; }
  else { fb.className = 'feedback err'; fb.textContent = '❌ Pista: BAM'; }
};

window.checkGenEx8 = function() {
  const input = document.getElementById('exGen8').value.toLowerCase();
  const fb = document.getElementById('genEx8Feedback');
  const ok = input.includes('quality') && input.includes('depth');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! QD = Quality por Depth'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: Quality by Depth'; fb.className = 'feedback err'; }
};

// Simulador de Genómica
window.runGenSim = function(step) {
  const output = document.getElementById('genSim' + step);
  if (output) {
    output.classList.remove('hidden');
    const stepEl = output.closest('.sim-step-item');
    stepEl.classList.add('completed');
    
    // Verificar si todos completados
    const allSteps = document.querySelectorAll('.sim-step-item');
    const completed = document.querySelectorAll('.sim-step-item.completed');
    if (allSteps.length === completed.length) {
      setTimeout(() => {
        alert('🎊 ¡Análisis genómico completado! Has practicado todo el pipeline');
      }, 500);
    }
  }
};

// ---------- Handlers Módulo Phylo ----------
window.checkPhyloEx1 = function() {
  const input = document.getElementById('phyloEx1').value;
  const fb = document.getElementById('phyloEx1Feedback');
  const ok = input === 'ml';
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! ML es popular para árboles grandes'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: Maximum Likelihood (ML)'; fb.className = 'feedback err'; }
};

window.checkPhyloEx2 = function() {
  const input = document.getElementById('phyloEx2').value.toLowerCase();
  const fb = document.getElementById('phyloEx2Feedback');
  const ok = input.includes('alto') || input.includes('soporte') || input.includes('confiable') || input.includes('95');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! Bootstrap 95% = alto soporte estadístico'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: Alto soporte estadístico'; fb.className = 'feedback err'; }
};

window.checkPhyloLab = function() {
  const input = document.getElementById('phyloLabInput').value.replace(/\s/g, '');
  const fb = document.getElementById('phyloLabFeedback');
  const ok = input === '1,2,3,4,5';
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Orden: Obtener secuencias → MAFFT → Modelo → IQ-TREE → FigTree'; fb.className = 'feedback err'; }
};

// Daily Challenge - verificar respuesta
window.checkDailyChallenge = function() {
  const input = document.getElementById('challenge-input').value.toLowerCase().replace(/\s/g, '');
  const fb = document.getElementById('challenge-feedback');
  
  // Los challenges tienen respuestas que pueden variar, verificamos componentes clave
  const challenges = [
    { answer: "grep^>genes.fasta|wc-l", hints: ['grep', 'wc', '^>', 'genes'] },
    { answer: "fastp", hints: ['fastp', 'cut_tail'] },
    { answer: "bcftoolsview-i'qual>=50'", hints: ['bcftools', 'qual>=50'] },
    { answer: "bedtoolscoverage", hints: ['bedtools', 'coverage'] }
  ];
  const today = new Date().getDate();
  const challenge = challenges[today % challenges.length];
  
  const hasKeyParts = challenge.hints.every(hint => input.includes(hint));
  
  fb.classList.remove('hidden');
  if (hasKeyParts) { 
    fb.textContent = '✅ ¡Correcto! Challenge completado 🎉'; 
    fb.className = 'feedback ok';
    // Guardar progreso
    localStorage.setItem('biointeractiva_challenge_' + today, 'completed');
  }
  else { fb.textContent = '❌ Revisa la pista e intenta de nuevo'; fb.className = 'feedback err'; }
};

// Simulador de análisis - ejecutar paso
window.runSimStep = function(stepNum) {
  const output = document.getElementById('sim-out-' + stepNum);
  if (output) {
    output.classList.remove('hidden');
    // Marcar paso como completado
    const stepEl = output.closest('.sim-step');
    stepEl.classList.add('completed');
    
    // Verificar si todos los pasos están completados
    const allSteps = document.querySelectorAll('.sim-step');
    const completed = document.querySelectorAll('.sim-step.completed');
    if (allSteps.length === completed.length) {
      setTimeout(() => {
        alert('🎊 ¡Análisis completado! Has practicado un pipeline completo de variantes');
      }, 500);
    }
  }
};

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

window.checkEx7 = function() {
  const input = document.getElementById('ex7-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex7-feedback');
  const ok = input === 'fastqc archivo.fastq.gz' || input.includes('fastqc');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! FastQC analiza la calidad de lecturas'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: fastqc archivo.fastq.gz'; fb.className = 'feedback err'; }
};

window.checkEx8 = function() {
  const input = document.getElementById('ex8-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex8-feedback');
  const ok = input === 'gzip archivo.tsv' || input.includes('gzip');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! gzip comprime y crea .gz'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: gzip archivo.tsv'; fb.className = 'feedback err'; }
};

window.checkEx9 = function() {
  const input = document.getElementById('ex9-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex9-feedback');
  const ok = input.includes('samtools flagstat') || input.includes('samtools');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! Muestra % mapeo, duplicados, coverage'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: samtools flagstat archivo.bam'; fb.className = 'feedback err'; }
};

window.checkEx10 = function() {
  const input = document.getElementById('ex10-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex10-feedback');
  const ok = input.includes('bcftools') && input.includes('qual>=30');
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! Filtra variantes de alta calidad'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: bcftools view -i \'QUAL>=30\''; fb.className = 'feedback err'; }
};

window.checkEx11 = function() {
  const input = document.getElementById('ex11-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex11-feedback');
  const ok = input.includes('mkdir -p') || (input.includes('mkdir') && input.includes('data'));
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! Estructura de proyecto organizada'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: mkdir -p proyecto/{data,results,scripts}'; fb.className = 'feedback err'; }
};

window.checkEx12 = function() {
  const input = document.getElementById('ex12-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex12-feedback');
  const ok = input.includes('wget') && (input.includes('http') || input.includes('.fa') || input.includes('.fasta'));
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto! Descarga genomas de referencia'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Pista: wget https://.../genome.fa.gz'; fb.className = 'feedback err'; }
};

// Ejercicio 13: samtools con --help
window.checkEx13 = function(verify = false) {
  const input = document.getElementById('ex13-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex13-feedback');
  
  // Mostrar hint si no es verificación
  if (!verify) {
    fb.classList.remove('hidden');
    fb.textContent = '💡 Pista: Escribe "samtools --help" en tu terminal para ver los subcomandos. Luego usa "samtools flagstat --help" para ver las opciones. El comando es: samtools flagstat mapped.bam';
    fb.className = 'feedback hint';
    return;
  }
  
  const ok = input.includes('samtools') && input.includes('flagstat') && input.includes('.bam');
  fb.classList.remove('hidden');
  if (ok) { 
    fb.textContent = '✅ ¡Excelente! Usaste --help para descubrir samtools flagstat. Este comando muestra estadísticas de mapeo (reads totales, % mapeo, duplicados).'; 
    fb.className = 'feedback ok'; 
  }
  else { fb.textContent = '❌ Pista: samtools --help → samtools flagstat --help → samtools flagstat mapped.bam'; fb.className = 'feedback err'; }
};

// Ejercicio 14: bcftools filter con --help
window.checkEx14 = function(verify = false) {
  const input = document.getElementById('ex14-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex14-feedback');
  
  if (!verify) {
    fb.classList.remove('hidden');
    fb.textContent = '💡 Pista: Escribe "bcftools --help" para ver los comandos. El subcomando "view" filtra VCFs. Usa: bcftools view -i "QUAL>=30 && DP>=10" variants.vcf';
    fb.className = 'feedback hint';
    return;
  }
  
  const ok = input.includes('bcftools') && 
             input.includes('view') && 
             (input.includes('qual>=30') || input.includes('qual > 30') || input.includes('qual >= 30')) &&
             (input.includes('dp>=10') || input.includes('dp > 10') || input.includes('dp >= 10'));
  fb.classList.remove('hidden');
  if (ok) { 
    fb.textContent = '✅ ¡Perfecto! filtraste variantes por calidad (QUAL) y profundidad (DP).'; 
    fb.className = 'feedback ok'; 
  }
  else { fb.textContent = '❌ Pista: bcftools view -i "QUAL>=30 && DP>=10" variants.vcf'; fb.className = 'feedback err'; }
};

// Ejercicio 15: FastQC con --help
window.checkEx15 = function(verify = false) {
  const input = document.getElementById('ex15-input').value.toLowerCase().trim();
  const fb = document.getElementById('ex15-feedback');
  
  if (!verify) {
    fb.classList.remove('hidden');
    fb.textContent = '💡 Pista: Escribe "fastqc --help" para ver las opciones. Puedes pasar múltiples archivos y usar -o para especificar directorio de salida: fastqc sample_R1.fastq.gz sample_R2.fastq.gz -o qc_results/';
    fb.className = 'feedback hint';
    return;
  }
  
  const ok = input.includes('fastqc') && input.includes('.fastq.gz') && input.includes('-o');
  fb.classList.remove('hidden');
  if (ok) { 
    fb.textContent = '✅ ¡Genial! FastQC generará informes HTML con estadísticas de calidad.'; 
    fb.className = 'feedback ok'; 
  }
  else { fb.textContent = '❌ Pista: fastqc archivo1.fastq.gz archivo2.fastq.gz -o directorio_salida/'; fb.className = 'feedback err'; }
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
  'samtools sort': '(ordena archivos BAM por posición)',
  'samtools index': '(crea índice .bai para BAM)',
  'bcftools': 'Usage: bcftools <command> [options]',
  "bcftools view -i 'QUAL>=20'": 'chr1\t10583\t.\tG\tA\t45\tPASS\nchr1\t234567\trs123\tT\tC\t28\tPASS',
  "bcftools view -i 'QUAL>=30 && DP>=10'": 'chr1\t12345\trs001\tG\tA\t45\tPASS\tDP=25',
  'bcftools view': '(filtra variantes por calidad/profundidad)',
  'bcftools call': '(variant calling - detecta SNPs/indels)',
  'bcftools consensus': '(genera secuencia consenso)',
  'fastqc': 'Started analysis of PAC001_R1.fastq.gz\nApproximate read length: 150bp\nTotal Sequences: 12345678\nGC: 42%',
  'fastp': 'Reads: 12345678 | Passed: 12000000 | Failed: 345678\nAdapter: 1.2% | Q30: 95.2%',
  'trimmomatic': 'Input: 12345678 reads\nOutput: 11890123 reads (96.3%)\nDropped: 345655 reads (3.7%)',
  
  // Alineamiento
  'bwa mem': '[Alignment] - paired-end alignment',
  'bwa index': '(crea índice del genoma de referencia)',
  'bowtie2': 'Usage: bowtie2 [options]* -x <bt2-idx> -U <reads> -S <output>',
  'bowtie2-build': '(construir índice Bowtie2)',
  'hisat2': 'Usage: hisat2 [options]* -x <ht2-idx> -U <reads> -S <output>',
  'hisat2-build': '(construir índice HISAT2)',
  'minimap2': 'Usage: minimap2 [options] <ref.fa> <query.fa>',
  
  // Variant calling
  'freebayes': 'Usage: freebayes -f <reference.fa> <alignment.bam>',
  'gatk haplotypecaller': 'VCF with GATK best practices',
  'gatk': 'Usage: gatk <toolname> [java options]',
  
  // Ensamblaje
  'spades': '(assembler de-novo para genomas)',
  'megahit': '(ensamblaje de metagenomas)',
  'canu': '(ensamblaje de lecturas largas)',
  
  // Anotación
  'snpEff': 'Annotating variants... done.',
  'annovar': 'ANNOVAR pipeline',
  
  // Permisos
  'chmod': '(cambia permisos: chmod +x script.sh)',
  'chmod +x': '(hace ejecutable un script)',
  'chown': '(cambia propietario: chown user:group file)',
  'chgrp': 'laboratorio\tcompartido/vcf/',
  
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

// ============================================
// INICIALIZACIÓN
// ============================================

function bindGlobalEvents() {
  // Permitir ENTER en terminal
  const termInput = document.getElementById('terminalInput');
  if (termInput) {
    termInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        window.runTerminalCommand();
      }
    });
  }

  // Botón explorar módulos
  const goToModulesBtn = document.getElementById("goToModulesBtn");
  if (goToModulesBtn) {
    goToModulesBtn.addEventListener("click", () => {
      document.getElementById("modules").scrollIntoView({ behavior: "smooth" });
    });
  }

  // Botón reiniciar progreso
  const resetProgressBtn = document.getElementById("resetProgressBtn");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", () => {
      state.completed = { cli: false, db: false, genomics: false, phylo: false };
      state.score = 0;
      saveState();
      updateProgressUI();
      alert("Progreso reiniciado.");
    });
  }

  // Botones de abrir módulo
  document.querySelectorAll(".openModuleBtn").forEach((btn) => {
    const module = btn.dataset.module;
    if (module) {
      btn.onclick = function() {
        renderModule(module);
      };
    }
  });
}

function renderModulesList() {
  const container = document.getElementById("moduleContent");
  container.classList.add("hidden");
  container.innerHTML = "";
  container.style.display = "";
}

window.renderModulesList = renderModulesList;
window.renderModule = renderModule;

function init() {
  loadState();
  updateProgressUI();
  bindGlobalEvents();
  console.log("BioInteractiva v2 - CLI Module Enhanced");
}

// Inicialización completa
document.addEventListener('DOMContentLoaded', function() {
  // Inicializaciones básicas
  init();
  
  // Inicializaciones de nuevas features
  initAchievements();
  initFabMenu();
  initOfflineMode();
  
  // Agregar botón de multiplayer en el menú
  const moduleGrid = document.querySelector('.module-grid');
  if (moduleGrid) {
    const multiBtn = document.createElement('article');
    multiBtn.className = 'module-card';
    multiBtn.innerHTML = `
      <h3>👥 Multijugador</h3>
      <p>Compite contra un amigo en preguntas de bioinformática.</p>
      <button class="openModuleBtn" data-module="multiplayer">Iniciar partida</button>
    `;
    moduleGrid.appendChild(multiBtn);
    
    // Re-bindear eventos para el nuevo botón
    document.querySelectorAll(".openModuleBtn").forEach((btn) => {
      const module = btn.dataset.module;
      if (module) {
        btn.onclick = function() {
          if (module === 'multiplayer') {
            startMultiplayer();
          } else {
            renderModule(module);
          }
        };
      }
    });
  }
  
  // Agregar botón Speed Run en el header
  const heroButtons = document.querySelector('.hero__buttons');
  if (heroButtons) {
    const speedrunBtn = document.createElement('button');
    speedrunBtn.className = 'ghost';
    speedrunBtn.textContent = '⚡ Speed Run';
    speedrunBtn.onclick = startSpeedRun;
    speedrunBtn.style.marginTop = '0.5rem';
    heroButtons.appendChild(speedrunBtn);
  }
  
  console.log('BioInteractiva fully initialized');
});
const achievements = [
  { id: 'first_cmd', name: 'Primer Comando', desc: 'Completa tu primer ejercicio', icon: '🎯', requirement: 1, type: 'exercises' },
  { id: 'explorer', name: 'Explorador', desc: 'Explora 10 comandos diferentes', icon: '🔍', requirement: 10, type: 'commands' },
  { id: 'genomist', name: 'Genomista', desc: 'Completa todos los ejercicios de genómica', icon: '🧬', requirement: 12, type: 'exercises' },
  { id: 'speedster', name: 'Velocista', desc: 'Gana una partida en Speed Run', icon: '⚡', requirement: 1, type: 'speedrun' },
  { id: 'streak_3', name: 'Racha de 3', desc: '3 días seguidos practicando', icon: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak_7', name: 'Semana Bio', desc: '7 días seguidos practicando', icon: '🌟', requirement: 7, type: 'streak' },
  { id: 'bookworm', name: 'Bibliotecario', desc: 'Guarda 5 comandos en favoritos', icon: '📚', requirement: 5, type: 'favorites' },
  { id: 'quiz_master', name: 'Quiz Master', desc: 'Responde 10 quizzes correctamente', icon: '🧠', requirement: 10, type: 'quiz' },
  { id: 'terminal_pro', name: 'Terminal Pro', desc: 'Usa 20 comandos en el terminal', icon: '💻', requirement: 20, type: 'terminal' },
  { id: 'multiplayer', name: 'Competitivo', desc: 'Gana un partido multiplayer', icon: '🏆', requirement: 1, type: 'multiplayer' }
];

// Estado de achievements
let achievementsState = JSON.parse(localStorage.getItem('biointeractiva_achievements') || '{}');

// Inicializar achievements
function initAchievements() {
  // Crear panel de achievements
  const panel = document.createElement('div');
  panel.className = 'achievements-panel';
  panel.id = 'achievementsPanel';
  panel.innerHTML = `
    <h3>🏆 Logros</h3>
    <button onclick="toggleAchievements()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer">✕</button>
    <div id="achievementsList"></div>
  `;
  document.body.appendChild(panel);
  
  // Botón flotante
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'achievements-toggle';
  toggleBtn.innerHTML = '🏆';
  toggleBtn.onclick = toggleAchievements;
  document.body.appendChild(toggleBtn);
  
  renderAchievements();
}

window.toggleAchievements = function() {
  const panel = document.getElementById('achievementsPanel');
  panel.classList.toggle('open');
};

function renderAchievements() {
  const list = document.getElementById('achievementsList');
  const stats = getStats();
  
  list.innerHTML = achievements.map(ach => {
    const unlocked = achievementsState[ach.id] || false;
    let progress = 0;
    
    if (ach.type === 'exercises') progress = Math.min(100, (stats.exercisesCompleted / ach.requirement) * 100);
    else if (ach.type === 'commands') progress = Math.min(100, (stats.commandsViewed / ach.requirement) * 100);
    else if (ach.type === 'streak') progress = Math.min(100, (stats.streak / ach.requirement) * 100);
    else if (ach.type === 'favorites') progress = Math.min(100, (stats.favorites / ach.requirement) * 100);
    else if (ach.type === 'quiz') progress = Math.min(100, (stats.quizCorrect / ach.requirement) * 100);
    else if (ach.type === 'terminal') progress = Math.min(100, (stats.terminalCommands / ach.requirement) * 100);
    else if (ach.type === 'speedrun') progress = stats.speedrunWon ? 100 : 0;
    else if (ach.type === 'multiplayer') progress = stats.multiplayerWon ? 100 : 0;
    
    return `
      <div class="achievement-card ${unlocked ? 'unlocked' : ''}">
        <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
        <div class="achievement-info">
          <h4>${ach.name}</h4>
          <p>${ach.desc}</p>
          ${!unlocked ? `
            <div class="achievement-progress">
              <div class="achievement-progress-bar" style="width:${progress}%"></div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Desbloquear achievement
function unlockAchievement(id) {
  if (!achievementsState[id]) {
    achievementsState[id] = true;
    localStorage.setItem('biointeractiva_achievements', JSON.stringify(achievementsState));
    
    // Mostrar notificación
    const ach = achievements.find(a => a.id === id);
    if (ach) {
      showNotification(`🏆 Desbloqueaste: ${ach.name}!`);
    }
    
    renderAchievements();
  }
}

// Notificación toast
function showNotification(message) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position:fixed;top:20px;left:50%;transform:translateX(-50%);
    background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#000;
    padding:1rem 2rem;border-radius:10px;font-weight:700;z-index:9999;
    animation:slideDown 0.3s ease-out;
  `;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

/* ========================================
   📊 STATISTICS DASHBOARD
   ======================================== */
function getStats() {
  const stats = JSON.parse(localStorage.getItem('biointeractiva_stats') || '{}');
  return {
    exercisesCompleted: stats.exercisesCompleted || 0,
    commandsViewed: stats.commandsViewed || 0,
    streak: stats.streak || 0,
    lastPractice: stats.lastPractice || null,
    favorites: stats.favorites || 0,
    quizCorrect: stats.quizCorrect || 0,
    terminalCommands: stats.terminalCommands || 0,
    speedrunWon: stats.speedrunWon || false,
    multiplayerWon: stats.multiplayerWon || false,
    totalTime: stats.totalTime || 0
  };
}

function updateStats(action) {
  const stats = getStats();
  const today = new Date().toDateString();
  
  if (action === 'exercise') stats.exercisesCompleted++;
  if (action === 'command') stats.commandsViewed++;
  if (action === 'quiz') stats.quizCorrect++;
  if (action === 'terminal') stats.terminalCommands++;
  if (action === 'favorite') stats.favorites++;
  if (action === 'speedrun') stats.speedrunWon = true;
  if (action === 'multiplayer') stats.multiplayerWon = true;
  
  // Calcular racha
  if (stats.lastPractice !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (stats.lastPractice === yesterday.toDateString()) {
      stats.streak++;
    } else if (stats.lastPractice !== today) {
      stats.streak = 1;
    }
    stats.lastPractice = today;
  }
  
  localStorage.setItem('biointeractiva_stats', JSON.stringify(stats));
  
  // Verificar achievements
  const ach = achievements.find(a => {
    if (a.type === 'exercises' && stats.exercisesCompleted >= a.requirement) return true;
    if (a.type === 'commands' && stats.commandsViewed >= a.requirement) return true;
    if (a.type === 'streak' && stats.streak >= 3 && !achievementsState['streak_3']) unlockAchievement('streak_3');
    if (a.type === 'streak' && stats.streak >= 7 && !achievementsState['streak_7']) unlockAchievement('streak_7');
    if (a.type === 'favorites' && stats.favorites >= a.requirement) return true;
    if (a.type === 'quiz' && stats.quizCorrect >= a.requirement) return true;
    if (a.type === 'terminal' && stats.terminalCommands >= a.requirement) return true;
    if (a.type === 'speedrun' && stats.speedrunWon && !achievementsState['speedster']) unlockAchievement('speedster');
    if (a.type === 'multiplayer' && stats.multiplayerWon && !achievementsState['multiplayer']) unlockAchievement('multiplayer');
    return false;
  });
  
  if (ach && !achievementsState[ach.id]) unlockAchievement(ach.id);
  
  return stats;
}

function renderStatsPanel() {
  const stats = getStats();
  return `
    <div class="stats-panel">
      <h3>📊 Tus Estadísticas</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.exercisesCompleted}</div>
          <div class="stat-label">Ejercicios</div>
        </div>
        <div class="stat-card streak">
          <div class="stat-value">${stats.streak}</div>
          <div class="stat-label">Días seguidos</div>
        </div>
        <div class="stat-card commands">
          <div class="stat-value">${stats.commandsViewed}</div>
          <div class="stat-label">Comandos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.quizCorrect}</div>
          <div class="stat-label">Quiz correctos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.favorites}</div>
          <div class="stat-label">Favoritos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.terminalCommands}</div>
          <div class="stat-label">Terminal</div>
        </div>
      </div>
    </div>
  `;
}

/* ========================================
   💾 FAVORITES / BOOKMARKS
   ======================================== */
let favorites = JSON.parse(localStorage.getItem('biointeractiva_favorites') || '[]');

function addFavorite(cmd) {
  if (!favorites.includes(cmd)) {
    favorites.push(cmd);
    localStorage.setItem('biointeractiva_favorites', JSON.stringify(favorites));
    updateStats('favorite');
    showNotification(`⭐ ${cmd} añadido a favoritos`);
    renderFavorites();
  }
}

function removeFavorite(cmd) {
  favorites = favorites.filter(f => f !== cmd);
  localStorage.setItem('biointeractiva_favorites', JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  if (favorites.length === 0) {
    return `
      <div class="favorites-section">
        <h3>⭐ Comandos Favoritos</h3>
        <p style="color:#94a3b8">No hay favoritos aún. ¡Guarda comandos desde la biblioteca!</p>
      </div>
    `;
  }
  
  return `
    <div class="favorites-section">
      <h3>⭐ Comandos Favoritos</h3>
      <div class="favorites-grid">
        ${favorites.map(cmd => `
          <div class="favorite-cmd">
            <code>${cmd}</code>
            <button class="favorite-remove" onclick="removeFavorite('${cmd}')">✕</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

window.addFavorite = addFavorite;
window.removeFavorite = removeFavorite;

function toggleFavorite(cmd) {
  if (favorites.includes(cmd)) {
    removeFavorite(cmd);
  } else {
    addFavorite(cmd);
  }
  // Recargar la biblioteca para actualizar los botones
  if (document.getElementById('cliTabBiblioteca')) {
    document.getElementById('cliTabBiblioteca').innerHTML = renderCLIBiblioteca();
  }
}

window.toggleFavorite = toggleFavorite;

/* ========================================
   🎮 GAME MODE - SPEED RUN
   ======================================== */
let speedrunState = {
  active: false,
  score: 0,
  timeLeft: 60,
  currentQuestion: 0,
  questions: []
};

const speedrunQuestions = [
  { q: "¿Qué comando cuenta líneas?", options: ["wc -l", "count", "lines"], answer: 0 },
  { q: "Flag -h en ls significa?", options: ["legible", "ocultos", "fecha"], answer: 0 },
  { q: "¿Cómo ver .gz?", options: ["zcat", "cat", "unzip"], answer: 0 },
  { q: "¿samtools flagstat?", options: ["estadísticas mapeo", "convertir BAM", "indexar"], answer: 0 },
  { q: "¿Formato VCF?", options: ["Variant Call Format", "Video", "Vector"], answer: 0 },
  { q: "¿FastQ tiene?", options: ["4 líneas", "2 líneas", "1 línea"], answer: 0 },
  { q: "¿bcftools para?", options: ["variantes", "alineamiento", "ensamblaje"], answer: 0 },
  { q: "¿grep ^> busca?", options: ["encabezados FASTA", "secuencias", "calidad"], answer: 0 },
  { q: "¿mkdir -p?", options: ["directorios anidados", "archivos", "permisos"], answer: 0 },
  { q: "¿zcat vs gzip?", options: ["ver/comprimir", "igual", "inverso"], answer: 0 }
];

function startSpeedRun() {
  speedrunState = {
    active: true,
    score: 0,
    timeLeft: 60,
    currentQuestion: 0,
    questions: [...speedrunQuestions].sort(() => Math.random() - 0.5).slice(0, 5)
  };
  
  const modal = document.createElement('div');
  modal.className = 'speedrun-modal';
  modal.id = 'speedrunModal';
  modal.innerHTML = renderSpeedRunContent();
  document.body.appendChild(modal);
  
  speedrunState.timer = setInterval(() => {
    speedrunState.timeLeft--;
    document.getElementById('speedrunTimer').textContent = speedrunState.timeLeft;
    
    if (speedrunState.timeLeft <= 0) {
      endSpeedRun();
    }
  }, 1000);
  
  renderSpeedRunQuestion();
}

function renderSpeedRunContent() {
  return `
    <div class="speedrun-content">
      <h2>⚡ Speed Run</h2>
      <p>¡Responde 5 preguntas en 60 segundos!</p>
      <div class="speedrun-timer" id="speedrunTimer">60</div>
      <div id="speedrunQuestion"></div>
      <div class="speedrun-score">Puntaje: <span id="speedrunScore">0</span></div>
      <button class="speedrun-btn" onclick="endSpeedRun()">Terminar</button>
    </div>
  `;
}

function renderSpeedRunQuestion() {
  const q = speedrunState.questions[speedrunState.currentQuestion];
  if (!q) {
    endSpeedRun();
    return;
  }
  
  document.getElementById('speedrunQuestion').innerHTML = `
    <div class="speedrun-question">
      <p>${q.q}</p>
      <div class="speedrun-options">
        ${q.options.map((opt, i) => `
          <button class="speedrun-option" onclick="answerSpeedRun(${i})">${opt}</button>
        `).join('')}
      </div>
    </div>
  `;
}

window.answerSpeedRun = function(answerIndex) {
  const q = speedrunState.questions[speedrunState.currentQuestion];
  const isCorrect = answerIndex === q.answer;
  
  if (isCorrect) {
    speedrunState.score += 20;
    speedrunState.timeLeft += 5; // Bonus time
    document.getElementById('speedrunScore').textContent = speedrunState.score;
  }
  
  speedrunState.currentQuestion++;
  renderSpeedRunQuestion();
};

function endSpeedRun() {
  clearInterval(speedrunState.timer);
  speedrunState.active = false;
  
  if (speedrunState.score >= 60) {
    updateStats('speedrun');
    showNotification(`🎉 Speed Run completado! Puntuación: ${speedrunState.score}`);
  }
  
  const modal = document.getElementById('speedrunModal');
  if (modal) {
    modal.innerHTML = `
      <div class="speedrun-content">
        <h2>${speedrunState.score >= 60 ? '🎉 Ganaste!' : '⏰ Tiempo!'}</h2>
        <div class="speedrun-timer">${speedrunState.score}</div>
        <p>Puntuación final</p>
        <button class="speedrun-btn" onclick="document.getElementById('speedrunModal').remove()">Cerrar</button>
        <button class="speedrun-btn" onclick="document.getElementById('speedrunModal').remove();startSpeedRun()">Jugar de nuevo</button>
      </div>
    `;
  }
}

window.startSpeedRun = startSpeedRun;
window.endSpeedRun = endSpeedRun;

/* ========================================
   👥 MULTIPLAYER LOCAL
   ======================================== */
let multiplayerState = {
  player1: 0,
  player2: 0,
  currentPlayer: 1,
  rounds: 0,
  maxRounds: 5,
  questions: []
};

function startMultiplayer() {
  multiplayerState = {
    player1: 0,
    player2: 0,
    currentPlayer: 1,
    rounds: 0,
    maxRounds: 5,
    questions: [...speedrunQuestions].sort(() => Math.random() - 0.5)
  };
  
  const container = document.getElementById('moduleContent');
  container.innerHTML = renderMultiplayerContent();
}

function renderMultiplayerContent() {
  return `
    <div class="multiplayer-panel">
      <h3>👥 Multijugador Local</h3>
      <p>¡Compite contra un amigo! Cada jugador responde preguntas alternadamente.</p>
      
      <div class="player-cards">
        <div class="player-card" id="p1Card">
          <h4>Jugador 1</h4>
          <div class="score" id="p1Score">0</div>
        </div>
        <div class="player-card" id="p2Card">
          <h4>Jugador 2</h4>
          <div class="score" id="p2Score">0</div>
        </div>
      </div>
      
      <div id="multiplayerQuestion"></div>
      
      <button class="speedrun-btn" onclick="startMultiplayer()">Nueva partida</button>
    </div>
    ${renderStatsPanel()}
  `;
}

function renderMultiplayerQuestion() {
  if (multiplayerState.rounds >= multiplayerState.maxRounds) {
    endMultiplayer();
    return;
  }
  
  const q = multiplayerState.questions[multiplayerState.rounds];
  const currentCard = multiplayerState.currentPlayer === 1 ? 'p1Card' : 'p2Card';
  
  document.getElementById('p1Card').classList.remove('winner');
  document.getElementById('p2Card').classList.remove('winner');
  document.getElementById(currentCard).style.borderColor = '#22d3ee';
  
  document.getElementById('multiplayerQuestion').innerHTML = `
    <p style="text-align:center;color:#fff;margin:1rem 0">Turno: Jugador ${multiplayerState.currentPlayer}</p>
    <div class="speedrun-question">
      <p>${q.q}</p>
      <div class="speedrun-options">
        ${q.options.map((opt, i) => `
          <button class="speedrun-option" onclick="answerMultiplayer(${i})">${opt}</button>
        `).join('')}
      </div>
    </div>
  `;
}

window.answerMultiplayer = function(answerIndex) {
  const q = multiplayerState.questions[multiplayerState.rounds];
  const isCorrect = answerIndex === q.answer;
  
  if (isCorrect) {
    if (multiplayerState.currentPlayer === 1) {
      multiplayerState.player1 += 10;
      document.getElementById('p1Score').textContent = multiplayerState.player1;
    } else {
      multiplayerState.player2 += 10;
      document.getElementById('p2Score').textContent = multiplayerState.player2;
    }
  }
  
  multiplayerState.currentPlayer = multiplayerState.currentPlayer === 1 ? 2 : 1;
  multiplayerState.rounds++;
  renderMultiplayerQuestion();
};

function endMultiplayer() {
  let winner = null;
  if (multiplayerState.player1 > multiplayerState.player2) {
    winner = 'Jugador 1';
    updateStats('multiplayer');
  } else if (multiplayerState.player2 > multiplayerState.player1) {
    winner = 'Jugador 2';
    updateStats('multiplayer');
  }
  
  document.getElementById('p1Card').classList.remove('winner');
  document.getElementById('p2Card').classList.remove('winner');
  
  if (winner) {
    document.getElementById(winner === 'Jugador 1' ? 'p1Card' : 'p2Card').classList.add('winner');
  }
  
  document.getElementById('multiplayerQuestion').innerHTML = `
    <div style="text-align:center;margin:2rem 0">
      <h3 style="color:#fbbf24">${winner ? '🎉 ' + winner + ' gana!' : '🤝 Empate!'}</h3>
      <p style="color:#fff">Puntuación final: ${multiplayerState.player1} - ${multiplayerState.player2})</p>
    </div>
  `;
}

window.startMultiplayer = startMultiplayer;

/* ========================================
   🔄 FAB MENU FOR MOBILE
   ======================================== */
function initFabMenu() {
  const fab = document.createElement('div');
  fab.className = 'fab-menu';
  fab.innerHTML = `
    <button class="fab-game" onclick="startSpeedRun()" title="Speed Run">⚡</button>
    <button class="fab-stats" onclick="showStatsPanel()" title="Estadísticas">📊</button>
    <button class="fab-favorites" onclick="showFavoritesPanel()" title="Favoritos">⭐</button>
  `;
  document.body.appendChild(fab);
}

window.showStatsPanel = function() {
  const container = document.getElementById('moduleContent');
  container.classList.remove('hidden');
  container.innerHTML = `
    <button class="back-btn" onclick="renderModulesList()" style="margin-bottom:1rem">← Volver</button>
    ${renderStatsPanel()}
  `;
};

window.showFavoritesPanel = function() {
  const container = document.getElementById('moduleContent');
  container.classList.remove('hidden');
  container.innerHTML = `
    <button class="back-btn" onclick="renderModulesList()" style="margin-bottom:1rem">← Volver</button>
    ${renderFavorites()}
  `;
};

/* ========================================
   🔄 OFFLINE MODE
   ======================================== */
function initOfflineMode() {
  // Registrar service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
      console.log('SW no disponible');
    });
  }
  
  // Indicador online/offline
  const indicator = document.createElement('div');
  indicator.className = 'offline-indicator online-indicator';
  indicator.id = 'offlineIndicator';
  indicator.innerHTML = '🌐 Online';
  document.body.appendChild(indicator);
  
  window.addEventListener('online', () => {
    indicator.className = 'offline-indicator online-indicator';
    indicator.innerHTML = '🌐 Online';
  });
  
  window.addEventListener('offline', () => {
    indicator.className = 'offline-indicator show';
    indicator.innerHTML = '📴 Modo offline';
  });
}

/* ========================================
   NOTAS DE VERSIÓN
   ======================================== */
// v2.1 - Consolidado DOMContentLoaded, fix bugs varios
// v2.0 - Módulos CLI/DB/Genómica/Filogenética completos
