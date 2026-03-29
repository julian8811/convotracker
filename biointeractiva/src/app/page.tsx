"use client";

import { useState } from "react";
import { UserButton, useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useProgress } from "@/hooks/useProgress";

const modules = [
  {
    id: "cli",
    title: "1) Línea de comando para bioinformática",
    description: "Aprende comandos esenciales para navegar directorios, manipular archivos FASTA/FASTQ y automatizar tareas.",
  },
  {
    id: "db",
    title: "2) Búsqueda en bases de datos biológicas",
    description: "Practica estrategias de consulta en NCBI, UniProt y ENA, incluyendo palabras clave y operadores útiles.",
  },
  {
    id: "genomics",
    title: "3) Genómica",
    description: "Comprende flujo de análisis genómico: control de calidad, ensamblaje, anotación, variantes y visualización.",
  },
  {
    id: "phylo",
    title: "4) Filogenética",
    description: "Construye una base sólida en alineamiento multiple, modelos evolutivos y lectura de árboles filogenéticos.",
  },
];

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const { progress, loading, completeModule, totalScore, completedModules } = useProgress();

  const handleModuleClick = (moduleId: string) => {
    if (!isSignedIn) {
      alert("Por favor, inicia sesión para acceder a los módulos");
      return;
    }
    setActiveModule(moduleId);
  };

  const handleCompleteModule = async () => {
    if (!activeModule) return;
    await completeModule(activeModule, 25);
  };

  const goBack = () => setActiveModule(null);

  if (activeModule) {
    const isCompleted = progress[activeModule]?.completed || false;
    return (
      <div className="container">
        <div className="cli-header">
          <h2>{modules.find(m => m.id === activeModule)?.title}</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="ghost" onClick={goBack}>← Volver</button>
            {!isCompleted ? (
              <button onClick={handleCompleteModule}>✓ Completar Módulo</button>
            ) : (
              <button className="ghost" disabled>✓ Completado</button>
            )}
          </div>
        </div>
        
        <div className="cli-tabs">
          <button className="cli-tab active">📚 Conceptos</button>
          <button className="cli-tab">✏️ Ejercicios</button>
          <button className="cli-tab">🧪 Laboratorio</button>
          <button className="cli-tab">❓ Quiz</button>
        </div>

        <div className="lesson">
          <h3>Contenido del módulo</h3>
          <p>Este módulo está en construcción. Próximamente disponible con ejercicios interactivos.</p>
        </div>

        <div className="interactive">
          <h4>Simulador de terminal</h4>
          <p>Próximamente: terminal interactivo para practicar comandos de bioinformática.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="hero">
        <div className="hero__content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img src="/logo.svg" alt="BioInteractiva" style={{ width: "60px", height: "60px" }} />
              <h1>BioInteractiva</h1>
              <p>
                Plataforma interactiva para aprender bioinformática desde cero:
                línea de comando, búsqueda en bases de datos, genómica y filogenética.
              </p>
            </div>
            {isSignedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span>Hola, {user?.firstName}</span>
                <UserButton />
              </div>
            ) : (
              <div className="hero__buttons">
                <SignInButton mode="modal">
                  <button className="btn-primary">Iniciar Sesión</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-secondary">Registrarse</button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        <section className="progress">
          <h2>Tu progreso</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <>
              <div className="progress__stats">
                <div className="card">
                  <h3>Completado</h3>
                  <p>{completedModules} / {modules.length} módulos</p>
                </div>
                <div className="card">
                  <h3>Puntaje total</h3>
                  <p>{totalScore} puntos</p>
                </div>
              </div>
              <div className="progress__bar-wrap">
                <div 
                  className="progress__bar" 
                  style={{ width: `${(completedModules / modules.length) * 100}%` }}
                />
              </div>
            </>
          )}
        </section>

        <section className="modules">
          <h2>Módulos de aprendizaje</h2>
          <div className="module-grid">
            {modules.map((module) => {
              const isCompleted = progress[module.id]?.completed || false;
              return (
                <article key={module.id} className="module-card">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  <button onClick={() => handleModuleClick(module.id)}>
                    {isCompleted ? "✓ Completado" : "Abrir módulo"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>BioInteractiva - Plataforma educativa interactiva</p>
      </footer>
    </>
  );
}
