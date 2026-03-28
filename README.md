# BioInteractiva 🧬

Plataforma educativa interactiva para aprender bioinformática desde cero: línea de comando, búsqueda en bases de datos, genómica y filogenética.

## 🌐 Demo

**URL**: https://julian8811.github.io/biointeractiva/

## 📚 Contenido

| Módulo | Descripción |
|--------|-------------|
| **1. Línea de Comando** | Comandos esenciales para bioinformática (CLI, grep, awk, samtools, bcftools, FastQC) |
| **2. Bases de Datos** | Búsqueda en NCBI, UniProt, ENA con operadores y estrategias |
| **3. Genómica** | Pipeline de análisis: QC, alineamiento, variant calling, visualización |
| **4. Filogenética** | MSA, modelos evolutivos, BEAST, visualización de árboles |

## 🚀 Características

- ✅ Aprende línea de comando con ejercicios interactivos
- ✅ Emuladores de herramientas bioinformáticas (MAFFT, IQ-TREE, BEAST, FigTree)
- ✅ Quiz por módulo para evaluar conocimientos
- ✅ Progreso guardado automáticamente (localStorage)
- ✅ Modo offline (PWA con Service Worker)
- ✅ Diseño responsive (móvil y desktop)

## 🛠️ Tecnologías

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: localStorage para persistencia
- **PWA**: Service Worker para offline

## 📁 Estructura

```
biointeractiva/
├── index.html          # Entry point
├── app.js             # Lógica principal (~6700 líneas)
├── styles.css         # Estilos (~4000 líneas)
├── sw.js              # Service Worker (PWA)
├── js/
│   ├── core.js        # Estado y persistencia
│   └── cli-module.js  # Módulo CLI (deprecado)
└── assets/
    └── captures/      # Capturas de terminal SVG
```

## 🎯 Cómo Contribuir

### Agregar Nuevo Contenido

#### 1. Nuevo Módulo
Para agregar un nuevo módulo, edita `app.js`:

```javascript
// Agregar en moduleData (línea ~547)
const moduleData = {
  nuevo_modulo: {
    title: "Nuevo Módulo",
    description: "Descripción breve"
  },
  // ... módulos existentes
};

// Crear funciones de renderizado
function renderNuevoModuloLesson() { /* contenido */ }
function renderNuevoModuloInteractive() { /* ejercicios */ }
function renderNuevoModuloQuiz() { /* quiz */ }
function renderNuevoModuloModule() {
  return `<div class="cli-module-enhanced">
    <div class="cli-header">...</div>
    <div class="cli-tabs">...</div>
  </div>`;
}
```

#### 2. Nuevo Ejercicio
En `app.js`, busca la función `renderXxxExercises()` y agrega:

```javascript
<div class="exercise-card">
  <h5>✏️ Nuevo Ejercicio</h5>
  <p>Descripción del ejercicio</p>
  <input type="text" id="nuevoEx-input" placeholder="respuesta">
  <button onclick="checkNuevoEx()">Verificar</button>
  <div id="nuevoExFeedback" class="feedback hidden"></div>
</div>
```

Agrega la función verificadora:

```javascript
window.checkNuevoEx = function() {
  const input = document.getElementById('nuevoEx-input').value;
  const fb = document.getElementById('nuevoExFeedback');
  const ok = /* lógica de verificación */;
  fb.classList.remove('hidden');
  if (ok) { fb.textContent = '✅ ¡Correcto!'; fb.className = 'feedback ok'; }
  else { fb.textContent = '❌ Intenta de nuevo'; fb.className = 'feedback err'; }
};
```

#### 3. Nuevo Emulador
Para crear un emulador, agrega en la función `renderXxxEmulators()`:

```javascript
<div class="emulator-card">
  <h4>🔧 Nombre del Emulador</h4>
  <div class="emulator-input">
    <label>Entrada:</label>
    <textarea id="emuladorInput"></textarea>
  </div>
  <button class="emulator-btn" onclick="runEmulador()">▶ Ejecutar</button>
  <div class="emulator-output">
    <pre id="emuladorOutput">Resultado...</pre>
  </div>
</div>
```

#### 4. Nuevo Quiz
En la función `renderXxxQuiz()`:

```javascript
const questions = [
  { q: "¿Tu pregunta?", options: ["A", "B", "C"], answer: 0 }
];
```

### Estilos CSS

Agrega estilos en `styles.css`:

```css
.nuevo-elemento {
  background: var(--panel);
  padding: 1rem;
  border-radius: 8px;
}
```

### Service Worker

Cuando modifiques `app.js` o `styles.css`, actualiza la versión del cache en `sw.js`:

```javascript
const CACHE_VERSION = 'v8';  // Incrementa
```

## 🧪 Testing

Para probar cambios locally:

```bash
# Usar un servidor local
npx serve .

# O con Python
python -m http.server 8000
```

Luego abre http://localhost:8000

## 📝 Convenciones

### Nombres de Funciones
- `renderXxxModule()` - Renderiza el módulo completo con tabs
- `renderXxxLesson()` - Contenido teórico
- `renderXxxInteractive()` - Ejercicios
- `renderXxxQuiz()` - Cuestionario
- `renderXxxEmulators()` - Emuladores de herramientas
- `checkXxx()` - Verifica respuestas

### Estilos
- Usar variables CSS (`--accent`, `--bg`, `--panel`)
- Dark theme por defecto
- Clases BEM (`block__element--modifier`)

### Git Commits
Usa conventional commits:

```
feat: add new exercise
fix: resolve bug in emulators
chore: update service worker
docs: update README
```

## 📄 Licencia

MIT License - Feel free to use and modify!

## 🙏 Agradecimientos

- Comunidad de bioinformática
- Desarrolladores de herramientas como MAFFT, IQ-TREE, BEAST, FigTree
