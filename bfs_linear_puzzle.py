"""
Resolver de puzle lineal de 8 dígitos con BFS (búsqueda no informada).

Estado: cadena con 8 dígitos (por ejemplo, "12345678").
Acciones: intercambiar posiciones adyacentes (i, i+1).
Objetivo: alcanzar la configuración objetivo con el mínimo número de intercambios.

Uso:
  python bfs_linear_puzzle.py --start 12345678 --goal 87654321 --show-path

Nota: BFS garantiza solución óptima en número de intercambios adyacentes.
"""

from collections import deque
from dataclasses import dataclass
import argparse
from typing import Dict, List, Optional, Tuple


Move = Tuple[int, int]  # (i, j) índices intercambiados; siempre j = i+1


def vecinos(state: str) -> List[Tuple[str, Move]]:
    """Genera vecinos intercambiando pares adyacentes."""
    s = list(state)
    res: List[Tuple[str, Move]] = []
    for i in range(len(s) - 1):
        s[i], s[i + 1] = s[i + 1], s[i]
        res.append(("".join(s), (i, i + 1)))
        s[i], s[i + 1] = s[i + 1], s[i]  # deshacer
    return res


@dataclass
class Resultado:
    pasos: int
    camino: List[str]
    movimientos: List[Move]


def reconstruir_camino(padres: Dict[str, Tuple[Optional[str], Optional[Move]]],
                       meta: str, inicio: str) -> Resultado:
    camino: List[str] = []
    movimientos: List[Move] = []
    actual: Optional[str] = meta
    while actual is not None:
        padre, mov = padres[actual]
        camino.append(actual)
        if mov is not None:
            movimientos.append(mov)
        actual = padre
    camino.reverse()
    movimientos.reverse()
    return Resultado(pasos=len(camino) - 1, camino=camino, movimientos=movimientos)


def bfs(inicio: str, meta: str) -> Resultado:
    if inicio == meta:
        return Resultado(pasos=0, camino=[inicio], movimientos=[])

    q: deque[str] = deque([inicio])
    visitado = {inicio}
    padres: Dict[str, Tuple[Optional[str], Optional[Move]]] = {
        inicio: (None, None)
    }

    while q:
        estado = q.popleft()
        for nxt, mov in vecinos(estado):
            if nxt in visitado:
                continue
            visitado.add(nxt)
            padres[nxt] = (estado, mov)
            if nxt == meta:
                return reconstruir_camino(padres, nxt, inicio)
            q.append(nxt)

    # En este grafo (todas las permutaciones alcanzables por swaps adyacentes) siempre hay camino,
    # así que no deberíamos llegar aquí si los alfabetos de inicio/meta coinciden.
    raise ValueError("No se encontró camino entre inicio y meta; verifica las entradas.")


def validar_cadenas(inicio: str, meta: str) -> None:
    if len(inicio) != 8 or len(meta) != 8:
        raise argparse.ArgumentTypeError("Las cadenas deben tener longitud 8.")
    if sorted(inicio) != sorted(meta):
        raise argparse.ArgumentTypeError(
            "Inicio y meta deben contener los mismos símbolos (misma multiconjunto)."
        )
    # Opcional: advertir sobre duplicados (BFS sigue funcionando, pero el conteo óptimo
    # de swaps deja de ser la distancia Kendall-Tau clásica).


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="BFS para puzle lineal de 8 dígitos (swaps adyacentes)")
    p.add_argument("--start", "--inicio", dest="inicio", required=True,
                   help="Configuración inicial de 8 caracteres, p.ej. 12345678")
    p.add_argument("--goal", "--meta", dest="meta", required=True,
                   help="Configuración objetivo de 8 caracteres, p.ej. 87654321")
    p.add_argument("--show-path", action="store_true",
                   help="Muestra la secuencia de estados y movimientos")
    return p.parse_args()


def main() -> None:
    args = parse_args()
    inicio = args.inicio.strip()
    meta = args.meta.strip()
    validar_cadenas(inicio, meta)
    res = bfs(inicio, meta)

    print(f"Pasos mínimos: {res.pasos}")
    if args.show_path:
        print("Camino:")
        for i, estado in enumerate(res.camino):
            if i == 0:
                print(f"  {i}: {estado} (inicio)")
            else:
                a, b = res.movimientos[i - 1]
                print(f"  {i}: {estado}  swap({a},{b})")


if __name__ == "__main__":
    main()

