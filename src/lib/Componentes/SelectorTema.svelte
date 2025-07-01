<script>
     import { onMount } from 'svelte';
     let theme = 'light';

     onMount(() => {
          const saved = localStorage.getItem('theme');
          if (saved) {
               theme = saved;
          } else {
               // Detectar preferencia del sistema
               if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    theme = 'dark';
               }
          }
          applyTheme();
     });

     function toggleTheme() {
          theme = theme === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme', theme);
          applyTheme();
     }

     function applyTheme() {
          document.documentElement.setAttribute('data-theme', theme);
     }
</script>

<style>
     .selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
     }
     
     .selector span {
          color: var(--text-primary);
          font-weight: 500;
     }
     
     button {
          padding: 0.5em 1em;
          border: 1px solid var(--border-color);
          border-radius: 0.5em;
          cursor: pointer;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.9rem;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
     }
     
     button:hover {
          background: var(--bg-secondary);
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
     }
     
     button:active {
          transform: translateY(0);
     }
</style>

<div class="selector">
     <span>Tema:</span>
     <button on:click={toggleTheme}>
          {theme === 'light' ? '🌞 Brillante' : '🌙 Nocturno'}
     </button>
</div>