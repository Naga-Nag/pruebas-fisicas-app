<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import SelectorTema from "$lib/Componentes/SelectorTema.svelte";

  let resultados: any = null;
  let loading = true;

  onMount(() => {
    // Obtener los resultados desde la URL o sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const resultadosData = urlParams.get('data') || sessionStorage.getItem('resultados');
    
    if (resultadosData) {
      try {
        resultados = JSON.parse(decodeURIComponent(resultadosData));
        loading = false;
      } catch (e) {
        console.error('Error parsing results:', e);
        loading = false;
      }
    } else {
      loading = false;
    }
  });

  function volverAEvaluacion() {
    history.back();
  }

  function nuevaEvaluacion() {
    sessionStorage.removeItem('resultados');
    sessionStorage.removeItem('datosFormulario');
    window.location.href = '/';
  }
</script>

<svelte:head>
  <title>Resultados</title>
</svelte:head>

<main class="main-container">
  <header class="main-header">
    <h1 class="main-title">📊 Resultados de Evaluación</h1>
    <div class="header-controls">
      <SelectorTema />
    </div>
  </header>

  <div class="main-content">
    {#if loading}
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando resultados...</p>
      </div>
    {:else if !resultados}
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h2>No se encontraron resultados</h2>
        <p>No hay datos de evaluación disponibles. Por favor, realiza una evaluación primero.</p>
        <button class="btn-primary" on:click={nuevaEvaluacion}>
          🏠 Volver al inicio
        </button>
      </div>
    {:else}
      <!-- Información del evaluado -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">👤</span>
          Datos del Evaluado
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Sexo:</span>
            <span class="info-value">{resultados.sexo === 'masculino' ? '👨 Masculino' : '👩 Femenino'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Edad:</span>
            <span class="info-value">🎂 {resultados.edad} años</span>
          </div>
          {#if resultados.altura}
            <div class="info-item">
              <span class="info-label">Altura:</span>
              <span class="info-value">📏 {resultados.altura} cm</span>
            </div>
          {/if}
          {#if resultados.peso}
            <div class="info-item">
              <span class="info-label">Peso:</span>
              <span class="info-value">⚖️ {resultados.peso} kg</span>
            </div>
          {/if}
          {#if resultados.imc}
            <div class="info-item">
              <span class="info-label">IMC:</span>
              <span class="info-value">📊 {resultados.imc}</span>
            </div>
          {/if}
          {#if resultados.cc}
            <div class="info-item">
              <span class="info-label">Circunferencia:</span>
              <span class="info-value">📐 {resultados.cc} cm</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Resultados por categoría -->
      <div class="results-grid">
        <!-- Resistencia -->
        <div class="result-card cardio">
          <div class="result-icon">🏃‍♂️</div>
          <div class="result-content">
            <h4>Resistencia Cardiovascular</h4>
            <div class="score-display">
              <span class="score-number">{resultados.puntajes.carrera}</span>
              <span class="score-label">puntos</span>
            </div>
            <p class="test-detail">Carrera 2400m: {resultados.tiempos.carrera}</p>
          </div>
        </div>

        <!-- Flexibilidad -->
        <div class="result-card flexibility">
          <div class="result-icon">🦵</div>
          <div class="result-content">
            <h4>Flexibilidad</h4>
            <div class="score-display">
              <span class="score-number">{resultados.puntajes.flexibilidad}</span>
              <span class="score-label">puntos</span>
            </div>
            <p class="test-detail">Elevación pierna: {resultados.valores.pierna}s</p>
          </div>
        </div>

        <!-- Fuerza -->
        <div class="result-card strength">
          <div class="result-icon">💪</div>
          <div class="result-content">
            <h4>Fuerza Muscular</h4>
            <div class="score-display">
              <span class="score-number">{resultados.puntajes.fuerzaPromedio}</span>
              <span class="score-label">promedio</span>
            </div>
            <div class="sub-tests">
              <div class="sub-test">
                <span>💪 Flexiones brazo:</span>
                <span>{resultados.puntajes.flexionesBrazo} pts ({resultados.valores.flexionesBrazo})</span>
              </div>
              <div class="sub-test">
                <span>🤸 Abdominales:</span>
                <span>{resultados.puntajes.abdominales} pts ({resultados.valores.abdominales})</span>
              </div>
              <div class="sub-test">
                <span>🤲 Barras:</span>
                <span>{resultados.puntajes.barra} pts ({resultados.valores.barra})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Evaluación Física -->
        <div class="result-card penalty">
          <div class="result-icon">⚖️</div>
          <div class="result-content">
            <h4>Evaluación Corporal</h4>
            <div class="score-display">
              <span class="score-number {resultados.penalizacion < 0 ? 'negative' : 'positive'}">{resultados.penalizacion > 0 ? '+' : ''}{resultados.penalizacion}</span>
              <span class="score-label">puntos penalizados</span>
            </div>
            <p class="test-detail">
              {#if resultados.penalizacion < 0}
                ⚠️ Penalización por IMC/Cintura
              {:else}
                ✅ Sin penalización
              {/if}
            </p>
          </div>
        </div>
      </div>

      <!-- Resultado Final Grande -->
      <div class="final-result-container">
        <div class="final-result {resultados.aprobado ? 'approved' : 'rejected'}">
          <div class="final-header">
            <h2>🎯 Resultado Final</h2>
          </div>
          
          <div class="final-score-section">
            <div class="score-breakdown">
              <div class="score-item">
                <span class="score-calc">Puntaje calculado:</span>
                <span class="score-val">{resultados.puntajeFinal} pts</span>
              </div>
              <div class="score-item main-score">
                <span class="score-calc">Puntaje final:</span>
                <span class="score-val final">{resultados.puntajeRedondeado} pts</span>
              </div>
            </div>
          </div>

          <div class="final-status-section">
            <div class="status-badge {resultados.aprobado ? 'approved' : 'rejected'}">
              {#if resultados.aprobado}
                <span class="status-icon">✅</span>
                <span class="status-text">APROBADO</span>
              {:else}
                <span class="status-icon">❌</span>
                <span class="status-text">NO APROBADO</span>
              {/if}
            </div>
            
            {#if resultados.observaciones}
              <p class="observaciones">{resultados.observaciones}</p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="action-buttons">
        <button class="btn-secondary" on:click={volverAEvaluacion}>
          ⬅️ Volver a la evaluación
        </button>
        <button class="btn-primary" on:click={nuevaEvaluacion}>
          🔄 Nueva evaluación
        </button>
      </div>
    {/if}
  </div>
</main>

<style>
  /* Estilos específicos para la página de resultados */
  
  .loading-container {
    text-align: center;
    padding: 4rem 2rem;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--border-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-container {
    text-align: center;
    padding: 4rem 2rem;
  }
  
  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--bg-tertiary);
    border-radius: 8px;
  }
  
  .info-label {
    font-weight: 600;
    color: var(--text-secondary);
  }
  
  .info-value {
    font-weight: 500;
    color: var(--text-primary);
  }
  
  /* Grid de resultados optimizado */
  .results-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .result-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-light);
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .result-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }
  
  .result-content {
    flex: 1;
  }
  
  .result-content h4 {
    margin: 0 0 0.5rem 0;
    color: var(--text-accent);
    font-size: 1.1rem;
  }
  
  .score-display {
    text-align: left;
    margin: 0.5rem 0;
  }
  
  .score-number {
    display: inline-block;
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-accent);
    margin-right: 0.5rem;
  }
  
  .score-number.negative {
    color: var(--text-error);
  }
  
  .score-number.positive {
    color: var(--success-color);
  }
  
  .score-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  .test-detail {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0.5rem 0 0 0;
  }
  
  .sub-tests {
    margin-top: 0.75rem;
  }
  
  .sub-test {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  
  .final-result-container {
    margin: 1.5rem 0;
  }
  
  .final-result {
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 1.5rem;
    border: 2px solid var(--border-color);
  }
  
  .final-result.approved {
    border-color: var(--success-color);
  }
  
  .final-result.rejected {
    border-color: var(--text-error);
  }
  
  .final-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .final-header h2 {
    margin: 0;
    font-size: 1.8rem;
    color: var(--text-accent);
  }
  
  .final-score-section {
    margin-bottom: 1.5rem;
  }
  
  .score-breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .score-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--bg-tertiary);
    border-radius: 12px;
  }
  
  .score-item.main-score {
    border: 2px solid var(--border-accent);
    background: var(--bg-primary);
  }
  
  .score-val.final {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-accent);
  }
  
  .final-status-section {
    text-align: center;
  }
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  
  .status-badge.approved {
    background: var(--success-color);
    color: white;
  }
  
  .status-badge.rejected {
    background: var(--text-error);
    color: white;
  }
  
  .observaciones {
    font-style: italic;
    color: var(--text-secondary);
    margin: 1rem 0 0 0;
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .action-buttons button {
    flex: 1;
  }
  
  /* Responsive para pantallas medianas */
  @media (min-width: 768px) {
    .results-grid {
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    
    .info-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
    
    .score-breakdown {
      flex-direction: row;
      gap: 1rem;
    }
    
    .score-item {
      flex: 1;
    }
  }
  
  /* Optimización para pantallas grandes */
  @media (min-width: 1024px) {
    .main-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
      align-items: start;
    }
    
    .results-grid {
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .final-result-container {
      grid-column: 1 / -1;
      margin: 1rem 0;
    }
    
    .action-buttons {
      grid-column: 1 / -1;
      max-width: 600px;
      margin: 1rem auto 0;
    }
    
    .result-card {
      padding: 1.25rem;
    }
    
    .score-number {
      font-size: 1.75rem;
    }
    
    .final-header h2 {
      font-size: 1.6rem;
    }
    
    .status-badge {
      font-size: 1.1rem;
      padding: 0.6rem 1.25rem;
    }
  }
  
  /* Para pantallas muy grandes */
  @media (min-width: 1200px) {
    .main-content {
      grid-template-columns: 1fr 3fr;
      gap: 2.5rem;
    }
    
    .results-grid {
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 1rem;
    }
    
    .result-card {
      flex-direction: column;
      text-align: center;
      padding: 1rem;
    }
    
    .result-icon {
      font-size: 2rem;
    }
    
    .score-display {
      text-align: center;
    }
    
    .score-number {
      font-size: 1.5rem;
    }
  }
  
  @media (max-width: 768px) {
    .action-buttons {
      flex-direction: column;
    }
    
    .score-breakdown {
      gap: 0.5rem;
    }
    
    .score-val.final {
      font-size: 1.25rem;
    }
    
    .status-badge {
      font-size: 1rem;
      padding: 0.6rem 1.25rem;
    }
  }
</style>
