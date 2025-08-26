<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { calcularPenalizacion, calcularIMC } from "./utils";
  import { base } from "$app/paths";
  import SelectorTema from "$lib/Componentes/SelectorTema.svelte";

  type Sexo = "masculino" | "femenino";

  let edad = $state(0);
  let añoNacimiento = $state("");
  let sexo: Sexo = $state("masculino");

  let altura: number | null = $state(null);
  let peso: number | null = $state(null);
  let imc: number | null = $state(null);
  let imcTexto = $state("");
  let cc: number | null = $state(null);
  let penalizacion = $state(0);

  let correr2400 = $state("");
  let flexionesBrazo = $state("");
  let abdominales = $state("");
  let barra = $state("");
  let pierna = $state("");
  let cabo = $state(false);

  let resultado = $state("");
  let datos: any = $state(null);
  let showEmailForm = $state(false);

  $effect(() => {
    if (showEmailForm) {
      document.body.style.overflow = "hidden";
      console.log("Formulario de email abierto");
    } else {
      document.body.style.overflow = "auto";

      console.log("Formulario de email cerrado");
    }
  });

  onMount(async () => {
    const res = await fetch(`${base}/pruebas_fisicas.json`);
    datos = await res.json();

    // Restaurar datos del formulario si existen
    restaurarDatos();
  });

  function parseTiempo(str: string): number | null {
    const [min, sec] = str.split(":").map(Number);
    return isNaN(min) || isNaN(sec) ? null : min * 60 + sec;
  }

  function grupoEtario(edad: number): number {
    if (edad <= 24) return 0;
    if (edad <= 29) return 1;
    if (edad <= 34) return 2;
    if (edad <= 39) return 3;
    if (edad <= 44) return 4;
    if (edad <= 50) return 5;
    return 6;
  }

  function guardarDatos() {
    const datosFormulario = {
      edad,
      añoNacimiento,
      sexo,
      altura,
      peso,
      cc,
      correr2400,
      flexionesBrazo,
      abdominales,
      barra,
      pierna,
      cabo,
    };
    sessionStorage.setItem("datosFormulario", JSON.stringify(datosFormulario));
  }

  function restaurarDatos() {
    const datosGuardados = sessionStorage.getItem("datosFormulario");
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados);
        edad = datos.edad || 0;
        añoNacimiento = datos.añoNacimiento || "";
        sexo = datos.sexo || "masculino";
        altura = datos.altura || null;
        peso = datos.peso || null;
        cc = datos.cc || null;
        correr2400 = datos.correr2400 || "";
        flexionesBrazo = datos.flexionesBrazo || "";
        abdominales = datos.abdominales || "";
        barra = datos.barra || "";
        pierna = datos.pierna || "";
        cabo = datos.cabo || false;

        // Actualizar IMC si hay datos de altura y peso
        if (altura && peso) {
          actualizarIMC();
        }
      } catch (e) {
        console.error("Error restaurando datos:", e);
      }
    }
  }

  function actualizarIMC() {
    const h = altura;
    const p = peso;

    if (!h || !p) {
      imc = 0;
      imcTexto = "";
      penalizacion = 0;
      return;
    }

    if (!isNaN(h) && h > 0 && !isNaN(p)) {
      const { imc: imcCalculado, clasificacion } = calcularIMC(p, h);
      imc = imcCalculado;
      imcTexto = `IMC: ${imcCalculado.toFixed(2)} (${clasificacion})`;
    } else {
      imcTexto = "IMC inválido";
    }

    if (cc && altura && peso) {
      penalizacion = calcularPenalizacion(altura, peso, cc, sexo);
    } else {
      penalizacion = 0;
    }
  }

  function evaluarTabla(valor: number, fila: any): number {
    const puntajes = Object.keys(fila)
      .filter((k) => !isNaN(Number(k)))
      .map(Number)
      .sort((a, b) => b - a);

    for (const k of puntajes) {
      if (valor >= fila[k]) return k;
    }
    return 0;
  }

  function evaluarTablaFloat(valor: number, fila: any): number {
    const puntajes = Object.keys(fila)
      .filter((k) => !isNaN(Number(k)))
      .map(Number)
      .sort((a, b) => b - a);

    for (const k of puntajes) {
      if (valor >= parseFloat(fila[k])) return k;
    }
    return 0;
  }

  function resetCampos() {
    edad = 0;
    añoNacimiento = "";
    sexo = "masculino";
    correr2400 = "";
    flexionesBrazo = "";
    abdominales = "";
    barra = "";
    pierna = "";
    cabo = false;
    resultado = "";
    altura = 0;
    peso = 0;
    imc = 0;
    imcTexto = "";
    cc = 0;
    penalizacion = 0;

    // Limpiar datos guardados
    sessionStorage.removeItem("datosFormulario");
  }

  function toggleEmailForm() {
    showEmailForm = !showEmailForm;
  }

  function sendEmail(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const mailtoLink = `mailto:naga_1252@proton.me?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;

    // Cerrar el formulario después de enviar
    showEmailForm = false;
  }

  function evaluar() {
    if (!datos) {
      alert("❌ Error: Datos no cargados. Por favor, recarga la página.");
      return;
    }

    const year = new Date().getFullYear();
    const edadP = year - parseInt(añoNacimiento);
    if (isNaN(edadP) || edadP < 10 || edadP > 100) {
      alert("❌ Error: Año de nacimiento inválido");
      edad = edadP;
      return;
    }

    const grupo = grupoEtario(edad);

    const t2400 = parseTiempo(correr2400);
    if (t2400 === null) {
      alert("❌ Error: Tiempo de carrera inválido. Formato: mm:ss");
      return;
    }

    // Validar que todos los campos estén completos
    if (!flexionesBrazo || !abdominales || !pierna) {
      alert(
        "❌ Error: Por favor, completa todos los campos de las pruebas físicas",
      );
      return;
    }

    const tablaTiempo = datos["2400_metros"][sexo];
    let p2400 = 0;
    for (const fila of tablaTiempo) {
      const ref = parseTiempo(fila.tiempos[grupo]);
      if (ref !== null && t2400 <= ref) {
        p2400 = fila.puntos;
        break;
      }
    }

    const pbrazo = evaluarTabla(
      Number(flexionesBrazo),
      datos["flexiones_de_brazo"].general[grupo],
    );
    const pabd = evaluarTabla(
      Number(abdominales),
      datos["abdominales"].general[grupo],
    );
    const pbarra = evaluarTabla(
      Number(barra),
      datos["flexiones_en_barra"].general[grupo],
    );
    const ppierna = evaluarTablaFloat(
      Number(pierna),
      datos["elevacion_pierna"].general[grupo],
    );

    const fuerza = (pbrazo + pabd + pbarra) / 3;
    let puntajeFinal = (p2400 * 3 + fuerza * 2 + ppierna) / 6;
    if (!cabo) puntajeFinal -= 10;

    // Calcular penalización si hay datos físicos
    let penalizacionFinal = 0;
    if (altura && peso && cc) {
      penalizacionFinal = calcularPenalizacion(altura, peso, cc, sexo);
    }
    puntajeFinal += penalizacionFinal;

    const puntajeRedondeado = Math.round(puntajeFinal);

    // Evaluar subgrupos de aprobación (cada uno debe tener >= 52 puntos)
    const resistenciaAprobada = p2400 >= 52;
    const fuerzaAprobada = fuerza >= 52;
    const flexibilidadAprobada = ppierna >= 52;

    // Contar cuántos subgrupos están desaprobados
    const subgruposDesaprobados = [
      !resistenciaAprobada,
      !fuerzaAprobada,
      !flexibilidadAprobada
    ].filter(Boolean).length;

    // Se desaprueba si tiene 2 o más subgrupos desaprobados
    const aprobadoPorSubgrupos = subgruposDesaprobados < 2;
    
    // Aprobación final: puntaje >= 52 Y máximo 1 subgrupo desaprobado
    const aprobado = puntajeRedondeado >= 52 && aprobadoPorSubgrupos;

    let observaciones = "";
    if (!aprobadoPorSubgrupos) {
      observaciones = `Desaprobado por tener ${subgruposDesaprobados} subgrupos reprobados. `;
      if (!resistenciaAprobada) observaciones += "Resistencia: " + p2400 + " pts. ";
      if (!fuerzaAprobada) observaciones += "Fuerza: " + fuerza.toFixed(1) + " pts. ";
      if (!flexibilidadAprobada) observaciones += "Flexibilidad: " + ppierna + " pts. ";
    } else if (puntajeRedondeado < 52) {
      observaciones = "Puntaje final insuficiente (mínimo 52 puntos)";
    }

    // Preparar datos para la página de resultados
    const resultadosData = {
      // Datos personales
      sexo,
      edad,
      altura,
      peso,
      cc,
      imc: imcTexto,
      grupoEtario: `Grupo ${grupo + 1}`,
      cabo,

      // Valores ingresados
      valores: {
        carrera: correr2400,
        flexionesBrazo,
        abdominales,
        barra,
        pierna,
      },

      // Tiempos
      tiempos: {
        carrera: correr2400,
      },

      // Puntajes obtenidos
      puntajes: {
        carrera: p2400,
        flexibilidad: ppierna,
        flexionesBrazo: pbrazo,
        abdominales: pabd,
        barra: pbarra,
        fuerzaPromedio: fuerza.toFixed(1),
      },

      // Estado de subgrupos
      subgrupos: {
        resistencia: { puntaje: p2400, aprobado: resistenciaAprobada },
        fuerza: { puntaje: parseFloat(fuerza.toFixed(1)), aprobado: fuerzaAprobada },
        flexibilidad: { puntaje: ppierna, aprobado: flexibilidadAprobada },
        desaprobados: subgruposDesaprobados
      },

      // Resultado final
      penalizacion: penalizacionFinal,
      puntajeFinal: puntajeFinal.toFixed(1),
      puntajeRedondeado,
      aprobado,
      aprobadoPorSubgrupos,
      observaciones,
    };

    // Guardar en sessionStorage y navegar
    sessionStorage.setItem("resultados", JSON.stringify(resultadosData));
    goto(`${base}/resultados`);
  }
</script>

<main class="main-container">
  <header class="main-header">
    <h1 class="main-title">Evaluación de Pruebas Físicas</h1>
    <p class="subtitle">Sistema Nuevo</p>
    <div class="header-controls">
      <SelectorTema />
      <button
        class="email-button"
        title="Enviar correo"
        aria-label="Enviar correo"
        onclick={toggleEmailForm}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
          />
        </svg>
      </button>
      <a
        href="https://github.com/Naga-Nag/pruebas-fisicas-app"
        target="_blank"
        rel="noopener noreferrer"
        class="github-button"
        title="Ver código en GitHub"
        aria-label="Ver código en GitHub"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
      </a>
    </div>
  </header>

  <!-- Formulario de email plegable -->
  {#if showEmailForm}
    <div
      class="email-form-overlay"
      role="button"
      tabindex="0"
      aria-label="Cerrar formulario de correo"
      onclick={toggleEmailForm}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          toggleEmailForm();
        }
      }}
    >
      <div
        class="email-form-container"
        role="dialog"
        aria-modal="true"
        tabindex="0"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleEmailForm();
          }
        }}
      >
        <div class="email-form-header">
          <h3>✉️ Enviar correo</h3>
          <button
            class="close-button"
            onclick={toggleEmailForm}
            aria-label="Cerrar formulario"
            type="button">✕</button
          >
        </div>
        <form onsubmit={sendEmail} class="email-form">
          <div class="form-group">
            <label for="subject">Asunto:</label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="Asunto del mensaje"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="message">Mensaje:</label>
            <textarea
              id="message"
              name="message"
              placeholder="Escribe tu mensaje..."
              rows="6"
              required
              class="form-textarea"
            ></textarea>
          </div>
          <div class="form-actions">
            <button
              type="button"
              class="btn-secondary"
              onclick={toggleEmailForm}
            >
              Cancelar
            </button>
            <button type="submit" class="btn-primary"> 📧 Enviar </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <div class="main-content">
    <!-- Sección de Datos Personales -->
    <div class="section-card">
      <h2 class="section-title">
        <span class="section-icon">👤</span>
        Datos Personales
      </h2>

      <div class="input-group">
        <div class="form-label">Sexo:</div>
        <div class="radio-group">
          <label class="radio-item">
            <input
              type="radio"
              value="masculino"
              bind:group={sexo}
              onchange={guardarDatos}
            />
            <span>👨 Masculino</span>
          </label>
          <label class="radio-item">
            <input
              type="radio"
              value="femenino"
              bind:group={sexo}
              onchange={guardarDatos}
            />
            <span>👩 Femenino</span>
          </label>
        </div>
      </div>

      <div class="input-group">
        <label class="form-label" for="añoNacimiento">Año de nacimiento:</label>
        <div class="input-row">
          <div class="input-with-label">
            <input
              class="form-input"
              bind:value={añoNacimiento}
              placeholder="Ej: 2001"
              type="text"
              oninput={() => {
                const year = new Date().getFullYear();
                const parsed = parseInt(añoNacimiento);
                edad = isNaN(parsed) ? 0 : year - parsed;
                guardarDatos();
              }}
            />
          </div>
          {#if edad > 0 && edad < 100}
            <span class="text-edad">🎂 {edad} años</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Sección de Medidas Corporales -->
    <div class="section-card">
      <h2 class="section-title">
        <span class="section-icon">📏</span>
        Medidas Corporales
      </h2>

      <div class="form-grid">
        <div class="input-group">
          <label class="form-label" for="altura">Altura (cm):</label>
          <input
            class="form-input"
            type="number"
            bind:value={altura}
            step="0.01"
            placeholder="Ej: 175.5"
            oninput={() => {
              actualizarIMC();
              guardarDatos();
            }}
          />
        </div>

        <div class="input-group">
          <label class="form-label" for="peso">Peso (kg):</label>
          <input
            class="form-input"
            type="number"
            bind:value={peso}
            placeholder="Ej: 70.5"
            oninput={() => {
              actualizarIMC();
              guardarDatos();
            }}
          />
        </div>

        <div class="input-group">
          <label class="form-label" for="cc"
            >Circunferencia de cintura (cm):</label
          >
          <input
            class="form-input"
            type="number"
            bind:value={cc}
            placeholder="Ej: 80"
            oninput={() => {
              actualizarIMC();
              guardarDatos();
            }}
          />
        </div>
      </div>

      {#if imcTexto}
        <div class="info-card">
          <strong>📊 {imcTexto}</strong>
        </div>
      {/if}

      {#if penalizacion < 0}
        <div class="text-penalizacion">
          ⚠️ Penalización: {penalizacion.toFixed(1)} puntos
        </div>
      {/if}
    </div>

    <!-- Sección de Pruebas Físicas -->
    <div class="section-card">
      <h2 class="section-title">
        <span class="section-icon">🏃‍♂️</span>
        Pruebas Físicas
      </h2>

      <div class="form-grid">
        <div class="input-group">
          <label class="form-label" for="correr2400"
            >🏃 Tiempo 2400m (mm:ss):</label
          >
          <input
            class="form-input"
            bind:value={correr2400}
            placeholder="Ej: 10:30"
            type="text"
            oninput={guardarDatos}
          />
        </div>

        <div class="input-group">
          <label class="form-label" for="flexionesBrazo"
            >💪 Flexiones de brazo:</label
          >
          <input
            class="form-input"
            bind:value={flexionesBrazo}
            type="number"
            placeholder="Ej: 25"
            oninput={guardarDatos}
          />
        </div>

        <div class="input-group">
          <label class="form-label" for="abdominales">🤸 Abdominales:</label>
          <input
            class="form-input"
            bind:value={abdominales}
            type="number"
            placeholder="Ej: 40"
            oninput={guardarDatos}
          />
        </div>

        <div class="input-group">
          <label class="form-label" for="barra">🤲 Barras:</label>
          <input
            class="form-input"
            bind:value={barra}
            type="number"
            placeholder="Ej: 8"
            oninput={guardarDatos}
          />
        </div>

        <div class="input-group">
          <label class="form-label" for="pierna_recta"
            >🦵 Elevación Pierna recta (s):</label
          >
          <input
            class="form-input"
            bind:value={pierna}
            type="number"
            step="0.1"
            placeholder="Ej: 4"
            oninput={guardarDatos}
          />
        </div>
      </div>

      <div class="checkbox-item">
        <input type="checkbox" bind:checked={cabo} onchange={guardarDatos} />
        <span>🎖️ ¿Sube el cabo?</span>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="section-card">
      <button class="btn-primary" onclick={evaluar}>
        ✅ Evaluar Pruebas Físicas
      </button>

      <button class="btn-secondary" onclick={resetCampos}>
        🧹 Limpiar todos los campos
      </button>
    </div>
  </div>
</main>

<style>
  /* Estilos específicos para esta página */

  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .email-button,
  .github-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    transition: all 0.2s ease;
    text-decoration: none;
    cursor: pointer;
  }

  .email-button:hover {
    background: #0066cc;
    color: white;
    transform: translateY(-1px);
  }

  .github-button:hover {
    background: var(--color-primary);
    color: white;
    transform: translateY(-1px);
  }

  .email-button svg,
  .github-button svg {
    transition: transform 0.2s ease;
  }

  .email-button:hover svg,
  .github-button:hover svg {
    transform: scale(1.1);
  }

  /* Formulario de email plegable */
  .email-form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .email-form-container {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    animation: slideIn 0.3s ease;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    position: absolute;
    top: 0;
  }

  .email-form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 1rem;
  }

  .email-form-header h3 {
    margin: 0;
    color: var(--color-text);
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text);
    transition: color 0.2s ease;
  }

  .close-button:hover {
    color: #ff4444;
  }

  .email-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: 600;
    color: var(--color-text);
  }

  .form-textarea {
    resize: vertical;
    min-height: 120px;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-background);
    color: var(--color-text);
    font-family: inherit;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Ajustes para medios pequeños */
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .radio-group {
      flex-direction: column;
      gap: 0.5rem;
    }

    .input-row {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
