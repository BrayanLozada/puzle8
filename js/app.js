// app.js
// Capa de UI que usa la lógica BFS del puzle lineal
// Se encarga de: validar entradas, llamar a bfsLinear, y renderizar resultados

import { bfsLinear } from './bfs.js';

// -------------------- Utilidades UI --------------------

/** Renderiza un estado del puzle en un contenedor */
function renderPuzzle(containerId, estado) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  estado.forEach((num) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.textContent = String(num);
    container.appendChild(tile);
  });
}

/** Parsea el input "1,2,3,4,5,6,7,8" a [1,2,3,4,5,6,7,8] */
function parseStateInput(input) {
  return input
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

/** Muestra estadísticas del resultado */
function showStats({ pasos, nodosExplorados, iteraciones }) {
  const statsContainer = document.getElementById('stats-container');
  statsContainer.innerHTML = `
    <div class="stats">
      <div class="stat-item">
        <div class="stat-number">${pasos}</div>
        <div class="stat-label">Pasos</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${nodosExplorados ?? '—'}</div>
        <div class="stat-label">Nodos Explorados</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${iteraciones ?? '—'}</div>
        <div class="stat-label">Iteraciones</div>
      </div>
    </div>`;
}

/** Texto de movimiento legible */
function movementLabel(move) {
  if (!move) return '';
  return `swap(${move.i},${move.j})  Pos ${move.i}↔${move.j}`;
}

/** Valida que ambos estados tengan longitud 8 y mismo multiconjunto */
function validateStates(a, b) {
  if (a.length !== 8 || b.length !== 8) {
    throw new Error('Ambos estados deben tener exactamente 8 elementos.');
  }
  const sa = a.slice().sort((x, y) => x - y).join(',');
  const sb = b.slice().sort((x, y) => x - y).join(',');
  if (sa !== sb) {
    throw new Error('Los estados inicial y objetivo deben contener los mismos elementos.');
  }
}

// -------------------- Flujo principal --------------------

function solvePuzzle() {
  const initialInput = document.getElementById('initial-state').value;
  const targetInput = document.getElementById('target-state').value;
  const resultContainer = document.getElementById('result-container');
  const statsContainer = document.getElementById('stats-container');
  const solveBtn = document.getElementById('solve-btn');

  // Reset UI
  statsContainer.innerHTML = '';
  resultContainer.innerHTML = '';
  solveBtn.innerHTML = '<span class="loading"></span>Resolviendo...';
  solveBtn.disabled = true;

  setTimeout(() => {
    try {
      const inicio = parseStateInput(initialInput);
      const meta = parseStateInput(targetInput);
      validateStates(inicio, meta);

      // Render de estados actuales
      renderPuzzle('initial-puzzle', inicio);
      renderPuzzle('target-puzzle', meta);

      // Ejecutar BFS (óptimo por definición)
      const t0 = performance.now();
      const res = bfsLinear(inicio, meta);
      const t1 = performance.now();

      // Construir salida visual
      const { pasos, camino, movimientos } = res;

      // Estadísticas mínimas (tiempo medido en cliente)
      showStats({ pasos, nodosExplorados: undefined, iteraciones: undefined });

      let html = '<div class="success-message">¡Solución encontrada!</div>';
      html += '<div class="solution-container">';
      html += `<h3>Pasos para resolver el puzle (≈ ${(t1 - t0).toFixed(1)} ms):</h3>`;

      // Mostrar cada estado alcanzado y el movimiento que lo generó
      for (let i = 1; i < camino.length; i++) {
        const estado = camino[i];
        const mov = movimientos[i - 1];
        html += `
          <div class="step">
            <div class="step-number">${i}</div>
            <div class="movement-info">${movementLabel(mov)}</div>
            <div class="puzzle">${estado.map((n) => `<div class="tile">${n}</div>`).join('')}</div>
          </div>`;
      }
      html += '</div>';
      resultContainer.innerHTML = html;
    } catch (e) {
      resultContainer.innerHTML = `<div class="error-message">Error: ${e.message}</div>`;
    } finally {
      solveBtn.innerHTML = 'Resolver Puzle';
      solveBtn.disabled = false;
    }
  }, 50);
}

function generateRandomPuzzle() {
  // Fisher-Yates para mezclar 1..8
  const arr = [1, 2, 3, 4, 5, 6, 7, 8];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  document.getElementById('initial-state').value = arr.join(',');
  document.getElementById('target-state').value = '1,2,3,4,5,6,7,8';
  renderPuzzle('initial-puzzle', arr);
  renderPuzzle('target-puzzle', [1, 2, 3, 4, 5, 6, 7, 8]);
  document.getElementById('result-container').innerHTML = '';
  document.getElementById('stats-container').innerHTML = '';
}

function resetPuzzle() {
  document.getElementById('initial-state').value = '8,7,6,5,4,3,2,1';
  document.getElementById('target-state').value = '1,2,3,4,5,6,7,8';
  renderPuzzle('initial-puzzle', [8, 7, 6, 5, 4, 3, 2, 1]);
  renderPuzzle('target-puzzle', [1, 2, 3, 4, 5, 6, 7, 8]);
  document.getElementById('result-container').innerHTML = '';
  document.getElementById('stats-container').innerHTML = '';
}

// Exponer funciones para los botones declarados en el HTML
window.solvePuzzle = solvePuzzle;
window.generateRandomPuzzle = generateRandomPuzzle;
window.resetPuzzle = resetPuzzle;

// Inicialización
document.addEventListener('DOMContentLoaded', resetPuzzle);

