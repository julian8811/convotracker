/**
 * BioInteractiva - Módulo CLI (OBSOLETO/DEPRECATED)
 * ===============================================
 * Este archivo ya NO se utiliza activamente.
 * El código CLI fue migrado completamente a app.js.
 * 
 * Este archivo se mantiene por compatibilidad histórica.
 * No se incluye en el cache del Service Worker.
 * 
 * Fecha de deprecación: 2026-03-28
 * 
 * @deprecated Use app.js en su lugar
 */

/* 
import { state, STORAGE_KEY, saveState, loadState } from './core.js';
// El código debajo ya no se ejecuta
*/

// ============================================
// BIBLIOTECA DE COMANDOS ORGANIZADA POR CATEGORÍA
// ============================================

export const cliLibrary = {
  // Categoría 1: Navegación del sistema
  navegacion: {
    title: "Navegación del Sistema",
    icon: "📁",
    commands: [
      {
        cmd: "pwd",
        syntax: "pwd",
        description: "Muestra la ruta absoluta del directorio actual de trabajo.",
        bio relevance: "Esencial para no ejecutar comandos en la carpeta equivocada. Siempre verifica con pwd antes de correr un pipeline.",
        example: "pwd  # /home/bioinfo/proyectos/microbioma_2026",
        output: "/home/bioinfo/proyectos/microbioma_2026"
      },
      {
        cmd: "ls",
        syntax: "ls [-lah]",
        description: "Lista archivos y directorios. -l detalles, -a ocultos, -h tamaño legible.",
        bio relevance: "Verifica que tus archivos FASTQ/FASTA lleguen completos al directorio.",
        example: "ls -lah raw_data/",
        output: "drwxr-xr-x 1 bioinfo bioinfo  128 Jan 15 10:30 .\ndrwxr-xr-x 1 bioinfo bioinfo  128 Jan 15 10:30 ..\n-rw-r--r-- 1 bioinfo bioinfo  2.1G Jan 15 10:25 PAC001_R1.fastq.gz\n-rw-r--r-- 1 bioinfo bioinfo  2.3G Jan 15 10:25 PAC001_R2.fastq.gz\n-rw-r--r-- 1 bioinfo bioinfo  156K Jan 15 10:26 metadata.tsv"
      },
      {
        cmd: "cd",
        syntax: "cd [ruta]",
        description: "Cambia el directorio actual. Usa rutas absolutas o relativas.",
        bio relevance: "Navega rápidamente entre carpetas de resultados, análisis, logs, etc.",
        example: "cd results/01_qc",
        output: "(sin salida - cambia al directorio)"
      },
      {
        cmd: "tree",
        syntax: "tree [-L n]",
        description: "Muestra estructura de directorios en formato de árbol.",
        bio relevance: "Visualiza la jerarquía completa de tu proyecto de análisis.",
        example: "tree -L 3 proyecto/",
        output: "proyecto/\n├── raw_data/\n│   ├── PAC001_R1.fastq.gz\n│   └── PAC001_R2.fastq.gz\n├── results/\n│   ├── 01_qc/\n│   ├── 02_trimming/\n│   └── 03_alignment/\n└── scripts/"
      }
    ]
  },
  
  // Categoría 2: Archivos y directorios
  archivos: {
    title: "Archivos y Directorios",
    icon: "📄",
    commands: [
      {
        cmd: "mkdir",
        syntax: "mkdir [-p] directorio",
        description: "Crea directorios. -p crea la jerarquía completa.",
        bio relevance: "Estandariza tu estructura de proyecto para reproducibilidad.",
        example: "mkdir -p proyecto/{raw_data,results/{qc,alignment,variants},logs,scripts}",
        output: "(sin salida si es exitoso)"
      },
      {
        cmd: "cp",
        syntax: "cp [-r] origen destino",
        description: "Copia archivos o directorios. -r para copiar recursivamente.",
        bio relevance: "Crea respaldos de genomas de referencia o datos crudos.",
        example: "cp -r reference/hg38.fa backup/",
        output: "(sin salida si es exitoso)"
      },
      {
        cmd: "mv",
        syntax: "mv origen destino",
        description: "Mueve o renombra archivos y directorios.",
        bio relevance: "Normaliza nombres de muestras (PAC001_R1.fastq.gz).",
        example: "mv muestra1.fastq.gz PAC001_R1.fastq.gz",
        output: "(sin salida si es exitoso)"
      },
      {
        cmd: "rm",
        syntax: "rm [-rf] archivo/directorio",
        description: "Elimina archivos o directorios. -r recursivo, -f forzar.",
        bio relevance: "CUIDADO: Nunca borres datos crudos. Úsalo solo en archivos temporales.",
        example: "rm temp/*_tmp.fastq",
        output: "(sin salida si es exitoso)"
      },
      {
        cmd: "ln -s",
        syntax: "ln -s origen enlace",
        description: "Crea enlaces simbólicos (accesos directos).",
        bio relevance: "Organiza pipelines sin duplicar archivos grandes (genomas, etc).",
        example: "ln -s /data/reference/genome.fa ./reference/genome.fa",
        output: "(crea el enlace)"
      },
      {
        cmd: "touch",
        syntax: "touch archivo",
        description: "Crea un archivo vacío o actualiza timestamp.",
        bio relevance: "Crea archivos placeholders para pipelines.",
        example: "touch results/pipeline_done.txt",
        output: "(sin salida si es exitoso)"
      }
    ]
  },
  
  // Categoría 3: Inspección de archivos
  inspeccion: {
    title: "Inspección de Archivos",
    icon: "👁️",
    commands: [
      {
        cmd: "cat",
        syntax: "cat archivo",
        description: "Muestra el contenido completo de un archivo.",
        bio relevance: "Útil para archivos pequeños como metadata.tsv, samples.txt.",
        example: "cat metadata.tsv",
        output: "sample_id\tpatient\tcondition\nPAC001\ttumor\tcontrol\nPAC002\twildtype\ttreatment"
      },
      {
        cmd: "head",
        syntax: "head [-n N] archivo",
        description: "Muestra las primeras N líneas (por defecto 10).",
        bio relevance: "Inspecciona rápidamente archivos FASTA, FASTQ, VCF.",
        example: "head -n 8 PAC001_R1.fastq",
        output: "@NB551068:H3MH5BGX3:1:11101:1987:1987:0 1:N:0:ATGCTTCA\nNTGCTGATCGATCGATCGATCGATCGATCGATCGATCG+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII\n+ABBBFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
      },
      {
        cmd: "tail",
        syntax: "tail [-n N] archivo",
        description: "Muestra las últimas N líneas.",
        bio relevance: "Revisa logs al final de ejecuciones largas.",
        example: "tail -n 30 pipeline.log",
        output: "[INFO] 2024-01-15 14:30:22 - Alineamiento completado\n[INFO] 2024-01-15 14:30:25 - Variant calling iniciado\n[INFO] 2024-01-15 14:35:10 - Pipeline terminado exitosamente"
      },
      {
        cmd: "less",
        syntax: "less archivo",
        description: "Navega archivo página por página (ideal para archivos grandes).",
        bio relevance: "Explora archivos GFF3, VCF, anotaciones sin cargar todo en memoria.",
        example: "less genes_anotados.gff3",
        output: "(abre el visor interactivo)"
      },
      {
        cmd: "wc",
        syntax: "wc [-l] archivo",
        description: "Cuenta líneas, palabras y bytes. -l solo líneas.",
        bio relevance: "Cuenta secuencias en FASTA (líneas/2), reads en FASTQ (líneas/4).",
        example: "wc -l secuencias.fasta",
        output: "490 secuencias.fasta"
      },
      {
        cmd: "file",
        syntax: "file archivo",
        description: "Determina el tipo de archivo.",
        bio relevance: "Verifica formato antes de procesar (ASCII, gzip, etc).",
        example: "file PAC001_R1.fastq.gz",
        output: "PAC001_R1.fastq.gz: gzip compressed data"
      }
    ]
  },
  
  // Categoría 4: Búsqueda y filtrado
  busqueda: {
    title: "Búsqueda y Filtrado",
    icon: "🔍",
    commands: [
      {
        cmd: "grep",
        syntax: "grep [-r] 'patrón' archivo",
        description: "Busca patrones usando expresiones regulares.",
        bio relevance: "Filtra secuencias por headers, genes por ID, variantes por cromosoma.",
        example: "grep '^>' secuencias.fasta | wc -l",
        output: "245"
      },
      {
        cmd: "find",
        syntax: "find ruta -name 'patrón'",
        description: "Busca archivos por nombre, tamaño, fecha.",
        bio relevance: "Localiza FASTQ/BAM en carpetas profundas para procesamiento por lotes.",
        example: "find . -name '*.fastq.gz' -type f",
        output: "./raw/PAC001_R1.fastq.gz\n./raw/PAC001_R2.fastq.gz\n./raw/PAC002_R1.fastq.gz\n./raw/PAC002_R2.fastq.gz"
      },
      {
        cmd: "awk",
        syntax: "awk 'condición {acción}' archivo",
        description: "Procesa y filtra texto por columnas.",
        bio relevance: "Potente para filtrar TSV, BLAST, resultados de expresión.",
        example: "awk '$6 > 100 {print $1, $6}' blast_hits.tsv",
        output: "seq_001 478\nseq_014 301\nseq_099 210"
      },
      {
        cmd: "sed",
        syntax: "sed 's/antiguo/nuevo/g' archivo",
        description: "Editor de flujo para replacements, limpieza de texto.",
        bio relevance: "Limpia IDs, normaliza formatos, reemplaza separadores.",
        example: "sed 's/ /_/g' ids.txt > ids_limpios.txt",
        output: "(archivo con espacios reemplazados por guiones)"
      }
    ]
  },
  
  // Categoría 5: Archivos tabulares
  tabulares: {
    title: "Archivos Tabulares",
    icon: "📊",
    commands: [
      {
        cmd: "cut",
        syntax: "cut -fN,M archivo.tsv",
        description: "Extrae columnas específicas de archivos delimitados.",
        bio relevance: "Extrae columnas de resultados BLAST, VCF, tablas de expresión.",
        example: "cut -f1,6 variantes.vcf | head",
        output: "CHROM\tQUAL\nchr1\t120\nchr1\t95"
      },
      {
        cmd: "sort",
        sort: "sort [-kN,n] archivo",
        description: "Ordena líneas. -k clave, -n numérico, -r reverso.",
        bio relevance: "Ordena resultados por score, p-value, cobertura.",
        example: "sort -k6,6gr blast_hits.tsv | head -20",
        output: "seq_001\t478\t98.5\nseq_014\t301\t95.2\nseq_099\t210\t89.1"
      },
      {
        cmd: "uniq",
        syntax: "sort archivo | uniq [-c]",
        description: "Elimina líneas duplicadas. -c cuenta ocurrencias.",
        bio relevance: "Cuentas taxonómicas, genes únicos, muestras únicas.",
        example: "cut -f3 annotations.tsv | sort | uniq -c",
        output: "45 gene_A\n32 gene_B\n18 gene_C"
      }
    ]
  },
  
  // Categoría 6: Compresión
  compresion: {
    title: "Compresión y Empaquetado",
    icon: "📦",
    commands: [
      {
        cmd: "gzip",
        syntax: "gzip archivo",
        description: "Comprime archivos con gzip (extensión .gz).",
        bio relevance: "FASTQ, VCF y otros archivosbioinformáticos se almacenan comprimidos.",
        example: "gzip secuencias.fastq",
        output: "(crea secuencias.fastq.gz)"
      },
      {
        cmd: "gunzip",
        syntax: "gunzip archivo.gz",
        description: "Descomprime archivos gzip.",
        bio relevance: "Descomprime para procesamiento temporal.",
        example: "gunzip lecturas.fastq.gz",
        output: "(crea lecturas.fastq)"
      },
      {
        cmd: "zcat",
        syntax: "zcat archivo.gz | comando",
        description: "Muestra contenido de archivos comprimidos sin descomprimir.",
        bio relevance: "Inspecciona FASTQ/VCF .gz directamente.",
        example: "zcat PAC001_R1.fastq.gz | head -n 12",
        output: "@NB551068:H3MH5BGX3:1:11101:1987:1987:0 1:N:0:ATGCTTCA\nNTGCTGATCGATCGATCGATCGATCGATCGATCGATCG+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII\n+ABBBFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
      },
      {
        cmd: "tar",
        syntax: "tar [-czvf] archivo.tar.gz directorio",
        description: "Empaqueta y comprime directorios.",
        bio relevance: "Respaldos y transferencia de resultados de análisis.",
        example: "tar -czvf resultados_2024.tar.gz resultados/",
        output: "resultados/\nresultados/01_qc/\nresultados/02_alignment/"
      },
      {
        cmd: "zip/unzip",
        syntax: "zip -r archivo.zip directorio",
        description: "Comprime/descomprime en formato ZIP.",
        bio relevance: "Formato estándar para compartir con colaboradores.",
        example: "zip -r dataset.zip raw_data/*",
        output: "(crea dataset.zip)"
      }
    ]
  },
  
  // Categoría 7: Sistema y recursos
  sistema: {
    title: "Sistema y Recursos",
    icon: "⚙️",
    commands: [
      {
        cmd: "df",
        syntax: "df [-h]",
        description: "Muestra espacio en disco de sistemas montados.",
        bio relevance: "Verifica espacio antes de ensamblaje o alineamiento.",
        example: "df -h",
        output: "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda2       500G  320G  180G  64% /home/bioinfo"
      },
      {
        cmd: "du",
        syntax: "du [-sh] directorio",
        description: "Calcula uso de espacio de directorios.",
        bio relevance: "Identifica cuáles etapas de tu pipeline consumen más.",
        example: "du -sh results/*",
        output: "780M    results/01_qc\n4.2G    results/03_alignment\n120M    results/04_variants"
      },
      {
        cmd: "ps",
        syntax: "ps [-eaf]",
        description: "Lista procesos activos.",
        bio relevance: "Monitorea si tus herramientas siguen corriendo en servidor.",
        example: "ps -eaf | grep fastqc",
        output: "bioinfo  18210     1  35  14:25 ?   00:05:12 fastqc PAC001_R1.fastq.gz"
      },
      {
        cmd: "top",
        syntax: "top",
        description: "Muestra procesos en tiempo real con CPU/memoria.",
        bio relevance: "Monitorea recursos durante alineamiento o variant calling.",
        example: "top",
        output: "PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM     TIME+ COMMAND\n18210 bioinfo   20   0  1.2g 980m 112m R 95.2  6.2   5:12.45 bwa mem"
      },
      {
        cmd: "free",
        syntax: "free [-h]",
        description: "Muestra uso de memoria RAM.",
        bio relevance: "Diagnostica si hay suficiente memoria para ejecutar herramientas.",
        example: "free -h",
        output: "              total    used    free  shared  buff/cache   available\nMem:           32Gi   18Gi   12Gi   256Mi       2Gi       13Gi"
      },
      {
        cmd: "kill",
        syntax: "kill [-9] PID",
        description: "Termina procesos. -9 fuerza el cierre.",
        bio relevance: "Detén procesos colgados o que consumen recursos excesivos.",
        example: "kill -9 18210",
        output: "(termina el proceso)"
      }
    ]
  },
  
  // Categoría 8: Red
  red: {
    title: "Descarga y Red",
    icon: "🌐",
    commands: [
      {
        cmd: "wget",
        syntax: "wget [-O] URL",
        description: "Descarga archivos desde HTTP/FTP.",
        bio relevance: "Descarga genomas de referencia, bases de datos.",
        example: "wget https://ftp.ensemblgenomes.ebi.ac.uk/pub/plants/fasta/arabidopsis_thaliana/dna/Arabidopsis_thaliana.TAIR10.dna.toplevel.fa.gz",
        output: "--2024-01-15 14:30:00--  ...dna.toplevel.fa.gz\nResolving... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 158M (158M) [application/x-gzip]\nSaving to: 'Arabidopsis_thaliana.TAIR10.dna.toplevel.fa.gz'"
      },
      {
        cmd: "curl",
        syntax: "curl -L URL -o archivo",
        description: "Descarga o consulta APIs por HTTP.",
        bio relevance: "Consulta APIs de NCBI, UniProt, ENA para obtener datos.",
        example: "curl -s 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=nucleotide&term=BRCA1[Gene]+AND+Homo+sapiens[Organism]&retmax=10'",
        output: '<?xml version="1.0" encoding="UTF-8" ?>\n<eSearchResult>\n  <Count>15,432</Count>\n  <RetMax>10</RetMax>\n  <IdList>...'
      }
    ]
  },
  
  // Categoría 9: Permisos
  permisos: {
    title: "Permisos y Propietarios",
    icon: "🔐",
    commands: [
      {
        cmd: "chmod",
        syntax: "chmod +x script.sh",
        description: "Cambia permisos de archivos (ejecutable, lectura, escritura).",
        bio relevance: "Necesario para ejecutar scripts de pipeline.",
        example: "chmod +x run_pipeline.sh",
        output: "(sin salida - hace ejecutable el script)"
      },
      {
        cmd: "chown",
        syntax: "chown usuario:grupo archivo",
        description: "Cambia propietario y grupo de archivos.",
        bio relevance: "Usado en servidores multiusuario para compartir resultados.",
        example: "sudo chown bioinfo:bioinformatics resultados/*.vcf",
        output: "(sin salida)"
      }
    ]
  },
  
  // Categoría 10: Genómica CLI
  genomica: {
    title: "Genómica (samtools/bcftools)",
    icon: "🧬",
    commands: [
      {
        cmd: "samtools flagstat",
        syntax: "samtools flagstat archivo.bam",
        description: "Muestra estadísticas de mapeo de lecturas.",
        bio relevance: "Resumen rápido de calidad de alineamiento: % mapeo, reads duplicados.",
        example: "samtools flagstat mapped.bam",
        output: "2450000 + 0 in total (QC-passed reads + QC-failed reads)\n2300000 + 0 mapped (93.88% : 93.88%)\n120000 + 0 duplicate (4.90%)"
      },
      {
        cmd: "samtools view",
        syntax: "samtools view [-b] archivo.bam",
        description: "Convierte y filtra archivos BAM/SAM.",
        bio relevance: "Extrae reads de una región, filtra porflags.",
        example: "samtools view -b -h mapped.bam chr1:1000000-2000000 > region.bam",
        output: "(extrae región especificada)"
      },
      {
        cmd: "samtools index",
        syntax: "samtools index archivo.bam",
        description: "Crea índice .bai para acceso aleatorio a BAM.",
        bio relevance: "Necesario para visualización en IGV y consultas por región.",
        example: "samtools index mapped.bam",
        output: "(crea mapped.bam.bai)"
      },
      {
        cmd: "bcftools view",
        syntax: "bcftools view [-i 'condición'] archivo.vcf.gz",
        description: "Filtra variantes de archivos VCF/BCF.",
        bio relevance: "Filtra por calidad, profundidad, tipo de variante.",
        example: "bcftools view -i 'QUAL>=30 && DP>=10' variants.vcf.gz | head",
        output: "#CHROM  POS     ID      REF     ALT     QUAL    FILTER  INFO\nchr1    10583   .       G       A       63      PASS    DP=45;AF=0.5\nchr1    234567  rs123   T       C       120     PASS    DP=89;AF=0.3"
      },
      {
        cmd: "fastqc",
        syntax: "fastqc archivo.fastq.gz",
        description: "Control de calidad de lecturas de secuenciación.",
        bio relevance: "Análisis de calidad inicial (Phred score, contenido GC, adaptadores).",
        example: "fastqc PAC001_R1.fastq.gz PAC001_R2.fastq.gz",
        output: "Started analysis of PAC001_R1.fastq.gz\nApproximate read length: 150bp\nTotal Sequences: 12,345,678\nGC: 42%"
      }
    ]
  }
};

// ============================================
// EJERCICIOS INTERACTIVOS POR CATEGORÍA
// ============================================

export const cliExercises = {
  // Ejercicio 1: Contar secuencias en FASTA
  contar_fasta: {
    title: "Ejercicio: Contar secuencias en FASTA",
    description: "Escribe el comando para contar cuántas secuencias hay en un archivo FASTA.",
    hint: "Usa grep para buscar las líneas que empiezan por '>' (headers) y wc para contarlas.",
    solution: "grep '^>' archivo.fasta | wc -l",
    test: (input) => {
      const cleaned = input.trim().toLowerCase().replace(/\s+/g, ' ');
      return cleaned === "grep '^>' archivo.fasta | wc -l" || 
             cleaned === "grep \"^>\" archivo.fasta | wc -l" ||
             cleaned.includes('grep') && cleaned.includes('^>') && cleaned.includes('wc -l');
    }
  },
  
  // Ejercicio 2: Ver FASTQ comprimido
  ver_fastq_comprimido: {
    title: "Ejercicio: Ver FASTQ comprimido",
    description: "Escribe el comando para ver las primeras 12 líneas de un archivo FASTQ comprimido sin descomprimirlo primero.",
    hint: "Usa zcat para ver el contenido comprimido y head para limitar las líneas.",
    solution: "zcat archivo.fastq.gz | head -n 12",
    test: (input) => {
      const cleaned = input.trim().toLowerCase().replace(/\s+/g, ' ');
      return cleaned.includes('zcat') && cleaned.includes('head');
    }
  },
  
  // Ejercicio 3: Buscar archivos FASTQ
  buscar_fastq: {
    title: "Ejercicio: Buscar archivos FASTQ",
    description: "Escribe el comando para encontrar todos los archivos .fastq.gz en el directorio actual y subdirectorios.",
    hint: "Usa find con la opción -name y el patrón *.fastq.gz",
    solution: "find . -name '*.fastq.gz'",
    test: (input) => {
      const cleaned = input.trim().toLowerCase().replace(/\s+/g, ' ');
      return cleaned.includes('find') && cleaned.includes('.fastq.gz');
    }
  },
  
  // Ejercicio 4: Filtrar por score
  filtrar_score: {
    title: "Ejercicio: Filtrar por score",
    description: "Usa awk para filtrar solo las líneas donde la columna 6 sea mayor a 100.",
    hint: "Usa awk '$6 > 100 {print ...}' archivo",
    solution: "awk '$6 > 100 {print}' archivo",
    test: (input) => {
      const cleaned = input.trim().toLowerCase().replace(/\s+/g, ' ');
      return cleaned.includes('awk') && cleaned.includes('$6') && cleaned.includes('100');
    }
  },
  
  // Ejercicio 5: Ver espacio en disco
  espacio_disco: {
    title: "Ejercicio: Ver espacio en disco",
    description: "Escribe el comando para ver el espacio en disco en formato legible (GB/MB).",
    hint: "Usa df con la opción -h",
    solution: "df -h",
    test: (input) => {
      const cleaned = input.trim().toLowerCase().replace(/\s+/g, ' ');
      return cleaned === 'df -h';
    }
  },
  
  // EJERCICIO FINAL: Usar --help para Genómica
  ejercicio_help_genomica: {
    title: "🏆 Ejercicio Final: Descubrir herramientas con --help",
    description: `
      <div class="ejercicio-help-intro">
        <p><strong>Escenario:</strong> Tienes un archivo <code>mapped.bam</code> y necesitas saber cuántas lecturas se mapean correctamente y el porcentaje de cobertura.</p>
        <p><strong>Tu misión:</strong> Usa <code>--help</code> para descubrir qué herramienta y opción usar.</p>
        <div class="pasos-investigacion">
          <span class="step-badge">1</span> Escribe <code>samtools --help</code> para ver los subcomandos disponibles<br>
          <span class="step-badge">2</span> Elige el subcomando apropiado y usa <code>--help</code> para ver sus opciones<br>
          <span class="step-badge">3</span> Escribe el comando final que muestre las estadísticas de mapeo
        </div>
      </div>
    `,
    hint: "Usa 'samtools flagstat' para ver estadísticas de mapeo. Escribe: samtools --help para descubrir los subcomandos.",
    solution: "samtools flagstat mapped.bam",
    test: (input) => {
      const cleaned = input.trim().toLowerCase().replace(/\s+/g, ' ');
      // Aceptar samtools + flagstat + archivo.bam
      return cleaned.includes('samtools') && 
             cleaned.includes('flagstat') && 
             cleaned.includes('.bam');
    },
    isHelpExercise: true // Flag para identificar ejercicio especial
  },
  
  // Ejercicio extra: Filtrar variantes con --help
  ejercicio_bcftools_help: {
    title: "🔬 Ejercicio: Filtrar variantes con bcftools",
    description: `
      <div class="ejercicio-help-intro">
        <p><strong>Escenario:</strong> Tienes un archivo <code>variants.vcf</code> con variantes y quieres filtrar solo aquellas con calidad (QUAL) mayor o igual a 30 Y profundidad de lectura (DP) mayor o igual a 10.</p>
        <p><strong>Tu misión:</strong> Usa <code>bcftools --help</code> para descubrir cómo filtrar variantes.</p>
        <div class="pasos-investigacion">
          <span class="step-badge">1</span> Escribe <code>bcftools --help</code> para ver los comandos disponibles<br>
          <span class="step-badge">2</span> Identifica el subcomando para filtrar VCFs<br>
          <span class="step-badge">3</span> Escribe el comando con la condición de filtro
        </div>
      </div>
    `,
    hint: "Usa 'bcftools view' con la opción -i para filtrar. Sintaxis: bcftools view -i 'QUAL>=30 && DP>=10' variants.vcf",
    solution: "bcftools view -i 'QUAL>=30 && DP>=10' variants.vcf",
    test: (input) => {
      const cleaned = input.trim().toLowerCase().replace(/\s+/g, ' ');
      return cleaned.includes('bcftools') && 
             cleaned.includes('view') && 
             (cleaned.includes('qual>=30') || cleaned.includes('qual > 30') || cleaned.includes('qual >= 30')) &&
             (cleaned.includes('dp>=10') || cleaned.includes('dp > 10') || cleaned.includes('dp >= 10'));
    },
    isHelpExercise: true
  },
  
  // Ejercicio extra: FastQC con --help
  ejercicio_fastqc_help: {
    title: "📊 Ejercicio: Control de calidad con FastQC",
    description: `
      <div class="ejercicio-help-intro">
        <p><strong>Escenario:</strong> Tienes archivos FASTQ comprimidos (<code>sample_R1.fastq.gz</code> y <code>sample_R2.fastq.gz</code>) y quieres hacer control de calidad.</p>
        <p><strong>Tu misión:</strong> Investiga con <code>fastqc --help</code> para:</p>
        <div class="pasos-investigacion">
          <span class="step-badge">1</span> Ver cómo especificar múltiples archivos<br>
          <span class="step-badge">2</span> Descubrir cómo especificar directorio de salida (-o)<br>
          <span class="step-badge">3</span> Escribe el comando completo
        </div>
      </div>
    `,
    hint: "FastQC puede tomar múltiples archivos y -o para especificar directorio de salida: fastqc sample_R1.fastq.gz sample_R2.fastq.gz -o qc_results/",
    solution: "fastqc sample_R1.fastq.gz sample_R2.fastq.gz -o qc_results/",
    test: (input) => {
      const cleaned = input.trim().toLowerCase().replace(/\s+/g, ' ');
      return cleaned.includes('fastqc') && 
             cleaned.includes('.fastq.gz') &&
             cleaned.includes('-o');
    },
    isHelpExercise: true
  }
};

// ============================================
// LABORATORIOS INTERACTIVOS
// ============================================

export const cliLabs = {
  // Laboratorio 1: Armar pipeline
  pipeline: {
    title: "Laboratorio: Arma el Pipeline",
    description: "Ordena los comandos para crear un pipeline de análisis básico. Arrastra y suelta.",
    steps: [
      { order: 1, cmd: "mkdir -p proyecto/{raw,results,logs}", desc: "Crear estructura de directorios" },
      { order: 2, cmd: "fastqc raw_data/*.fastq.gz -o results/qc/", desc: "Control de calidad" },
      { order: 3, cmd: "bwa mem ref.fa raw/PAC001_R1.fastq.gz raw/PAC001_R2.fastq.gz > results/alignment.sam", desc: "Alineamiento" },
      { order: 4, cmd: "samtools sort results/alignment.sam -o results/alignment.bam", desc: "Ordenar BAM" },
      { order: 5, cmd: "bcftools call -v -o variants.vcf results/alignment.bam", desc: "Variant calling" }
    ]
  },
  
  // Laboratorio 2: Encontrar errores
  errores: {
    title: "Laboratorio: Encuentra el Error",
    description: "Cada comando tiene un error. Identifica y corrige.",
    problems: [
      {
        incorrect: "gzip -d archivo.fastq.gz > archivo.fastq",
        correct: "gunzip archivo.fastq.gz",
        hint: "Para descomprimir gzip, el comando correcto es gunzip"
      },
      {
        incorrect: "ls -I *.fastq",
        correct: "ls -l *.fastq",
        hint: "La opción para formato largo es -l, no -I"
      },
      {
        incorrect: "head - archivo.txt",
        correct: "head -n 10 archivo.txt",
        hint: "head requiere -n para especificar número de líneas"
      },
      {
        incorrect: "grep > secuencias.fasta",
        correct: "grep '^>' secuencias.fasta",
        hint: "Falta el patrón de búsqueda entre comillas"
      }
    ]
  },
  
  // Laboratorio 3: Terminal simulada
  terminal: {
    title: "Laboratorio: Terminal Simulada",
    description: "Practica comandos en un entorno simulado. Escribe el comando y observa el resultado.",
    scenarios: [
      {
        task: "Verifica en qué directorio estás",
        expected: "pwd",
        output: "/home/bioinfo/proyectos/analisis_microbioma"
      },
      {
        task: "Lista todos los archivos incluyendo ocultos",
        expected: "ls -la",
        output: "total 48\ndrwxr-xr-x 1 bioinfo bioinfo  4096 Jan 15 10:30 .\ndrwxr-xr-x 1 bioinfo bioinfo  4096 Jan 15 10:30 ..\n-rw-r--r-- 1 bioinfo bioinfo  156 Jan 15 10:25 .hidden_config\ndrwxr-xr-x 1 bioinfo bioinfo  128 Jan 15 10:30 raw_data\ndrwxr-xr-x 1 bioinfo bioinfo  256 Jan 15 10:28 results"
      },
      {
        task: "Muestra las primeras 5 líneas de metadata.tsv",
        expected: "head -n 5 metadata.tsv",
        output: "sample_id\tpatient\tcondition\tdate\nPAC001\ttumor\tcontrol\t2024-01-10\nPAC002\twildtype\ttreatment\t2024-01-11\nPAC003\ttumor\ttreatment\t2024-01-12"
      }
    ]
  }
};

// ============================================
// RENDERIZADO DEL MÓDULO CLI
// ============================================

export function renderCLIModule() {
  const container = document.getElementById('moduleContent');
  container.classList.remove('hidden');
  
  container.innerHTML = `
    <div class="cli-module">
      <div class="cli-header">
        <h2>🖥️ Línea de Comando para Bioinformática</h2>
        <button class="back-btn" onclick="renderModulesList()">← Volver a módulos</button>
      </div>
      
      <div class="cli-tabs">
        <button class="cli-tab active" data-tab="biblioteca">📚 Biblioteca</button>
        <button class="cli-tab" data-tab="ejercicios">✏️ Ejercicios</button>
        <button class="cli-tab" data-tab="laboratorios">🔬 Laboratorios</button>
        <button class="cli-tab" data-tab="quiz">❓ Quiz</button>
      </div>
      
      <div class="cli-content" id="cliTabBiblioteca">
        ${renderBibliotecaTab()}
      </div>
      
      <div class="cli-content hidden" id="cliTabEjercicios">
        ${renderEjerciciosTab()}
      </div>
      
      <div class="cli-content hidden" id="cliTabLaboratorios">
        ${renderLaboratoriosTab()}
      </div>
      
      <div class="cli-content hidden" id="cliTabQuiz">
        ${renderQuizTab()}
      </div>
    </div>
  `;
  
  attachCLITabHandlers();
}

// Renderizado de cada pestaña
function renderBibliotecaTab() {
  const categories = Object.entries(cliLibrary);
  
  return `
    <div class="cli-categories">
      ${categories.map(([key, cat]) => `
        <details class="cli-category">
          <summary class="category-header">
            <span class="category-icon">${cat.icon}</span>
            <span class="category-title">${cat.title}</span>
            <span class="category-count">${cat.commands.length} comandos</span>
          </summary>
          <div class="category-commands">
            ${cat.commands.map(cmd => renderCommandCard(cmd)).join('')}
          </div>
        </details>
      `).join('')}
    </div>
  `;
}

function renderCommandCard(cmd) {
  return `
    <div class="command-card">
      <div class="command-header">
        <code class="command-name">${cmd.cmd}</code>
        <code class="command-syntax">${cmd.syntax}</code>
      </div>
      <p class="command-description">${cmd.description}</p>
      <div class="command-bio">
        <strong>🐸 Relevancia bioinformática:</strong> ${cmd.bio relevance}
      </div>
      <div class="command-example">
        <strong>💻 Ejemplo:</strong>
        <code>${cmd.example}</code>
      </div>
      <div class="command-output">
        <strong>📤 Salida:</strong>
        <pre>${cmd.output}</pre>
      </div>
    </div>
  `;
}

function renderEjerciciosTab() {
  const exercises = Object.entries(cliExercises);
  
  return `
    <div class="cli-exercises">
      <p class="exercises-intro">Practica escribiendo los comandos correctos. Cada ejercicio te ayudará a dominar un comando esencial para bioinformática.</p>
      ${exercises.map(([key, ex], idx) => {
        // Determinar clase adicional para ejercicios especiales
        const extraClass = ex.isHelpExercise ? 'is-help-exercise' : '';
        // Determinar si mostrar número de ejercicio (no para ejercicios con título completo)
        const showNumber = !ex.title.match(/^(🏆|🔬|📊|✅)/);
        const titleNumber = showNumber ? `Ejercicio ${idx + 1}: ` : '';
        
        return `
        <div class="exercise-card ${extraClass}" data-exercise="${key}">
          <h4>${titleNumber}${ex.title}</h4>
          <div class="exercise-description">${ex.description}</div>
          <div class="exercise-hint">
            <button class="hint-btn" onclick="showHint('${key}')">💡 Ver pista</button>
            <p class="hint-text hidden">${ex.hint}</p>
          </div>
          <input type="text" class="exercise-input" placeholder="Escribe tu comando aquí..." data-exercise="${key}">
          <button class="check-btn" onclick="checkExercise('${key}')">✓ Verificar</button>
          <div class="exercise-feedback hidden"></div>
        </div>
      `}).join('')}
    </div>
  `;
}

function renderLaboratoriosTab() {
  const labs = Object.entries(cliLabs);
  
  return `
    <div class="cli-labs">
      <p class="labs-intro">Los laboratorios te permiten practicar en escenarios reales de bioinformática. ¡Ponte a prueba!</p>
      ${labs.map(([key, lab], idx) => `
        <div class="lab-card">
          <h4>🔬 Laboratorio ${idx + 1}: ${lab.title}</h4>
          <p>${lab.description}</p>
          ${renderLabContent(key, lab)}
        </div>
      `).join('')}
    </div>
  `;
}

function renderLabContent(key, lab) {
  switch(key) {
    case 'pipeline':
      return `
        <div class="lab-pipeline">
          <p>Arrastra los pasos en el orden correcto:</p>
          <div class="pipeline-steps" id="pipelineSteps">
            ${lab.steps.map((step, idx) => `
              <div class="pipeline-step" draggable="true" data-order="${step.order}">
                <span class="step-number">${idx + 1}</span>
                <code>${step.cmd}</code>
                <span class="step-desc">${step.desc}</span>
              </div>
            `).join('')}
          </div>
          <button class="check-pipeline-btn" onclick="checkPipeline()">Verificar orden</button>
        </div>
      `;
    case 'errores':
      return `
        <div class="lab-errores">
          ${lab.problems.map((prob, idx) => `
            <div class="error-problem">
              <p><strong>Problema ${idx + 1}:</strong></p>
              <code class="incorrect-cmd">${prob.incorrect}</code>
              <input type="text" class="fix-input" placeholder="Escribe el comando corregido" data-problem="${idx}">
              <button class="hint-btn" onclick="showErrorHint(${idx})">💡 Pista</button>
              <p class="hint-text hidden">${prob.hint}</p>
              <button class="check-btn" onclick="checkErrorFix(${idx}, '${prob.correct.replace(/'/g, "\\'")}')">Verificar</button>
              <div class="feedback hidden"></div>
            </div>
          `).join('')}
        </div>
      `;
    case 'terminal':
      return `
        <div class="lab-terminal">
          <div class="terminal-scenario">
            <h4>Escenario 1: Verificar directorio</h4>
            <p class="task">Task: ${lab.scenarios[0].task}</p>
            <input type="text" class="terminal-input" placeholder="$ ">
            <button onclick="runTerminalScenario(0)">Ejecutar</button>
            <pre class="terminal-output hidden"></pre>
          </div>
        </div>
      `;
    default:
      return '';
  }
}

function renderQuizTab() {
  const questions = [
    {
      q: "¿Qué comando cuenta las líneas de un archivo?",
      options: [
        { text: "wc -l archivo", correct: true },
        { text: "count archivo", correct: false },
        { text: "lines archivo", correct: false }
      ]
    },
    {
      q: "¿Para qué sirve el flag -h en el comando ls?",
      options: [
        { text: "Muestra tamaños legibles (human-readable)", correct: true },
        { text: "Muestra archivos ocultos", correct: false },
        { text: "Ordena por fecha", correct: false }
      ]
    },
    {
      q: "¿Cómo visualizas un archivo .gz sin descomprimirlo?",
      options: [
        { text: "zcat archivo.gz | head", correct: true },
        { text: "cat archivo.gz", correct: false },
        { text: "unzip archivo.gz", correct: false }
      ]
    },
    {
      q: "¿Qué comando filtra columnas específicas de un TSV?",
      options: [
        { text: "cut -f1,3 archivo.tsv", correct: true },
        { text: "filter -c archivo.tsv", correct: false },
        { text: "select -col 1,3 archivo.tsv", correct: false }
      ]
    },
    {
      q: "¿Cuál es el propósito de samtools flagstat?",
      options: [
        { text: "Mostrar estadísticas de mapeo", correct: true },
        { text: "Convertir BAM a SAM", correct: false },
        { text: "Indexar archivos", correct: false }
      ]
    }
  ];
  
  return `
    <div class="cli-quiz">
      <p class="quiz-intro">Responde estas preguntas para validar tu conocimiento.</p>
      ${questions.map((q, idx) => `
        <div class="quiz-question" data-question="${idx}">
          <p><strong>Pregunta ${idx + 1}:</strong> ${q.q}</p>
          <div class="quiz-options">
            ${q.options.map(opt => `
              <button class="quiz-option" data-correct="${opt.correct}">${opt.text}</button>
            `).join('')}
          </div>
          <div class="quiz-feedback hidden"></div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================
// HANDLERS DE EVENTOS
// ============================================

function attachCLITabHandlers() {
  // Tabs
  document.querySelectorAll('.cli-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cli-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.cli-content').forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(`cliTab${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`).classList.remove('hidden');
    });
  });
  
  // Quiz options
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const question = e.target.closest('.quiz-question');
      const feedback = question.querySelector('.quiz-feedback');
      const isCorrect = e.target.dataset.correct === 'true';
      
      question.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
      
      feedback.classList.remove('hidden');
      if (isCorrect) {
        feedback.textContent = '✅ ¡Correcto!';
        feedback.className = 'quiz-feedback correct';
      } else {
        feedback.textContent = '❌ Incorrecto. Intenta de nuevo.';
        feedback.className = 'quiz-feedback incorrect';
      }
    });
  });
}

// Funciones globales para los ejercicios
window.showHint = (exerciseKey) => {
  const card = document.querySelector(`[data-exercise="${exerciseKey}"]`);
  card.querySelector('.hint-text').classList.remove('hidden');
};

window.checkExercise = (exerciseKey) => {
  const card = document.querySelector(`[data-exercise="${exerciseKey}"]`);
  const input = card.querySelector('.exercise-input');
  const feedback = card.querySelector('.exercise-feedback');
  const exercise = cliExercises[exerciseKey];
  
  feedback.classList.remove('hidden');
  if (exercise.test(input.value)) {
    feedback.textContent = '✅ ¡Correcto! Excelente trabajo.';
    feedback.className = 'exercise-feedback correct';
  } else {
    feedback.textContent = '❌ No es correcto. Revisa la pista e intenta de nuevo.';
    feedback.className = 'exercise-feedback incorrect';
  }
};

window.checkPipeline = () => {
  alert('¡Laboratorio de pipeline en construcción! 🎯');
};

window.showErrorHint = (idx) => {
  alert(`Pista: La respuesta correcta es diferente. Revisa la sintaxis del comando.`);
};

window.checkErrorFix = (idx, correct) => {
  alert(`Verificando... La respuesta correcta sería: ${correct}`);
};

window.runTerminalScenario = (idx) => {
  alert('¡Laboratorio de terminal en construcción! 🎯');
};

export default { cliLibrary, cliExercises, cliLabs, renderCLIModule };
