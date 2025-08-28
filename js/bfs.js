// bfs.js
// Lógica del puzle lineal de 8 dígitos usando BFS (búsqueda no informada)
// - Estados representados como arrays de longitud 8: [1,2,3,4,5,6,7,8]
// - Acción: intercambiar elementos adyacentes (i, i+1)
// - Retorna solución óptima en número de swaps adyacentes

/**
 * Genera vecinos intercambiando pares adyacentes.
 * @param {number[]} state Estado actual como array de 8 números
 * @returns {{next:number[], move:{i:number,j:number}}[]} Lista de vecinos
 */
export function vecinos(state) {
  const res = [];
  for (let i = 0; i < state.length - 1; i++) {
    const next = state.slice();
    const j = i + 1;
    // swap adyacente
    [next[i], next[j]] = [next[j], next[i]];
    res.push({ next, move: { i, j } });
  }
  return res;
}

/**
 * Reconstruye el camino desde el mapa de padres.
 * @param {Map<string,{parent:string|null, move:{i:number,j:number}|null}>} padres
 * @param {string} goalKey clave (join(',')) del estado meta
 * @param {Map<string, number[]>} estados mapa de clave->array del estado
 * @returns {{pasos:number, camino:number[][], movimientos:{i:number,j:number}[]}}
 */
function reconstruirCamino(padres, goalKey, estados) {
  const camino = [];
  const movimientos = [];
  let k = goalKey;
  while (k !== null) {
    const info = padres.get(k);
    camino.push(estados.get(k));
    if (info && info.move) movimientos.push(info.move);
    k = info ? info.parent : null;
  }
  camino.reverse();
  movimientos.reverse();
  return { pasos: camino.length - 1, camino, movimientos };
}

/**
 * BFS que encuentra el camino óptimo de swaps adyacentes.
 * @param {number[]} inicio array de 8 números
 * @param {number[]} meta array de 8 números
 * @returns {{pasos:number, camino:number[][], movimientos:{i:number,j:number}[]}}
 */
export function bfsLinear(inicio, meta) {
  const startKey = inicio.join(',');
  const goalKey = meta.join(',');
  if (startKey === goalKey) return { pasos: 0, camino: [inicio.slice()], movimientos: [] };

  // Estructuras BFS
  const q = [inicio.slice()];
  const visitado = new Set([startKey]);
  const padres = new Map([[startKey, { parent: null, move: null }]]);
  const estados = new Map([[startKey, inicio.slice()]]);

  while (q.length) {
    const estado = q.shift();
    const vecinosList = vecinos(estado);
    for (const { next, move } of vecinosList) {
      const k = next.join(',');
      if (visitado.has(k)) continue;
      visitado.add(k);
      padres.set(k, { parent: estado.join(','), move });
      estados.set(k, next);
      if (k === goalKey) {
        return reconstruirCamino(padres, k, estados);
      }
      q.push(next);
    }
  }
  // Para permutaciones con el mismo multiconjunto, siempre hay camino.
  throw new Error('No se encontró camino; verifica que inicio/meta contengan los mismos elementos.');
}

