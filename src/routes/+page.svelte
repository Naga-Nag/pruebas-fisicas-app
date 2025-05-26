<script lang="ts">
  import { onMount } from "svelte";

  type Sexo = "masculino" | "femenino";

  let edad = 0;
  let añoNacimiento = "";
  let sexo: Sexo = "masculino";
  let correr2400 = "";
  let flexionesBrazo = "";
  let abdominales = "";
  let barra = "";
  let pierna = "";
  let cabo = false;

  let resultado = "";
  let datos: any = null;

  onMount(async () => {
    const res = await fetch("/pruebas_fisicas.json");
    datos = await res.json();
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

  function evaluarTabla(valor: number, fila: any): number {
    for (const k of ["100", "92", "80", "72", "52", "40", "32", "20", "10"]) {
      if (valor >= fila[k]) return Number(k);
    }
    return 0;
  }

  function evaluarTablaFloat(valor: number, fila: any): number {
    for (const k of ["100", "92", "80", "72", "52", "40", "32", "20", "10"]) {
      if (valor >= parseFloat(fila[k])) return Number(k);
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
  }

  function evaluar() {
    if (!datos) {
      resultado = "Datos no cargados";
      return;
    }

    const year = new Date().getFullYear();
    const edadP = year - parseInt(añoNacimiento);
    if (isNaN(edadP) || edadP < 10 || edadP > 100) {
      resultado = "Año de nacimiento inválido";
      edad = edadP;
      return;
    }

    const grupo = grupoEtario(edad);

    const t2400 = parseTiempo(correr2400);
    if (t2400 === null) {
      resultado = "Tiempo inválido";
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

    const fuerza = (pbrazo + pabd + pbarra ) / 3;
    let puntajeFinal = (p2400*3+ fuerza *2 + ppierna)/6;
    if (!cabo) puntajeFinal -= 10;

    let estado = Math.round(puntajeFinal) >= 52 ? "✅ APROBADO" : "❌ NO APROBADO";
    if (p2400 < 52 && fuerza < 52) {
      estado = "❌ NO APROBADO (Debe aprobar al menos 2400m o fuerza)";
    }

    resultado = `
Puntajes:
- Correr 2400m: ${p2400}
- Flexibilidad: ${ppierna}

Promedio fuerza: ${fuerza.toFixed(1)}
- Flexiones de brazo: ${pbrazo}
- Abdominales: ${pabd}
- Barras: ${pbarra}

Puntaje final: ${puntajeFinal.toFixed(1)}
Puntaje Final Redondeado: ${Math.round(puntajeFinal).toFixed(1)} → ${estado}
`.trim();
  }
</script>

<main>
  <h2>Evaluación de Pruebas Físicas</h2>

  <div class="input-group">
    <label for="añoNacimiento">Año de nacimiento:</label>
    <div class="flex-row">
      <input
        bind:value={añoNacimiento}
        placeholder="1990"
        on:input={() => {
          const year = new Date().getFullYear();
          const parsed = parseInt(añoNacimiento);
          edad = isNaN(parsed) ? 0 : year - parsed;
        }}
      />
      {#if edad > 0 && edad < 100}
        <span class="edad">Edad: {edad}</span>
      {/if}
    </div>
  </div>

  <label for="sexo">Sexo:</label>
  <label
    ><input type="radio" value="masculino" bind:group={sexo} /> Masculino</label
  >
  <label
    ><input type="radio" value="femenino" bind:group={sexo} /> Femenino</label
  >

  <label for="correr2400">Tiempo 2400m (mm:ss):</label>
  <input bind:value={correr2400} placeholder="10:30" />

  <label for="flexionesBrazo">Flexiones de brazo:</label>
  <input bind:value={flexionesBrazo} type="number" />

  <label for="abdominales">Abdominales:</label>
  <input bind:value={abdominales} type="number" />

  <label for="barra">Barras:</label>
  <input bind:value={barra} type="number" />

  <label for="pierna_recta">Elevacion Pierna recta (s):</label>
  <input bind:value={pierna} type="number" step="0.1" />

  <label><input type="checkbox" bind:checked={cabo} /> ¿Sube el cabo?</label>

  <button on:click={evaluar}>✅ Evaluar</button>

  {#if resultado}
    <pre>{resultado}</pre>
  {/if}

  <button class="clear" on:click={resetCampos}>🧹 Limpiar campos</button>
</main>

<style>
@font-face {
  font-family: Comfortaa;
  font-style: normal;
  font-weight: 400;
  src: url(/Comfortaa.ttf);
}

:global(body) {
  margin: 0;
  padding: 0;
  font-family: Comfortaa, sans-serif;
  background: linear-gradient(135deg, #e0f7fa, #ffffff);
  min-height: 100vh;
}

main {
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.8s ease-in-out;
  box-sizing: border-box;
}

h2 {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #004d7a;
  animation: slideIn 0.6s ease-out;
}

label {
  display: block;
  font-weight: 600;
  margin: 1rem 0 0.25rem;
  color: #333;
}

input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 0.85rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #00bcd4;
  box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.2);
  outline: none;
}

input[type="radio"],
input[type="checkbox"] {
  margin-right: 0.5rem;
  transform: scale(1.25);
}

.flex-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.edad {
  font-size: 1rem;
  font-weight: 600;
  color: #00796b;
}

button {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.95rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

button:not(.clear) {
  background: linear-gradient(90deg, #007cf0, #00dfd8);
  color: white;
}

button.clear {
  background: linear-gradient(90deg, #bbbbbb, #dddddd);
  color: #333;
}

button.clear:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

pre {
  margin-top: 2rem;
  background: #f0faff;
  padding: 1rem;
  border-left: 5px solid #00bcd4;
  border-radius: 0.6rem;
  color: #222;
  font-size: 0.95rem;
  white-space: pre-wrap;
  animation: fadeInResult 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInResult {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile-only tweaks */
@media (max-width: 480px) {
  h2 {
    font-size: 1.35rem;
  }

  .edad {
    font-size: 0.95rem;
  }

  input[type="text"],
  input[type="number"] {
    font-size: 0.95rem;
  }

  button {
    font-size: 1rem;
    padding: 0.85rem;
  }

  pre {
    font-size: 0.9rem;
  }
}
</style>
