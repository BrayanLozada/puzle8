#!/usr/bin/env python3
"""Resolver el puzle lineal de 8 dígitos usando BFS.

Este script puede ejecutarse directamente proporcionando dos estados de 8
números separados por comas. Cada estado debe contener los mismos dígitos,
solo que en diferente orden. El algoritmo busca la secuencia mínima de
intercambios adyacentes necesaria para transformar el estado inicial en el
estado objetivo.
"""

from collections import deque
import argparse


def parse_state(text):
    """Convierte una cadena como "1,2,3,4,5,6,7,8" en una lista de enteros."""
    return [int(part.strip()) for part in text.split(',') if part.strip()]


def validate_states(a, b):
    """Verifica que ambos estados tengan longitud 8 y el mismo multiconjunto."""
    if len(a) != 8 or len(b) != 8:
        raise ValueError("Ambos estados deben tener exactamente 8 elementos.")
    if sorted(a) != sorted(b):
        raise ValueError(
            "Los estados inicial y objetivo deben contener los mismos elementos."
        )


def neighbours(state):
    """Genera estados vecinos intercambiando elementos adyacentes."""
    for i in range(len(state) - 1):
        nxt = list(state)
        nxt[i], nxt[i + 1] = nxt[i + 1], nxt[i]
        yield nxt, (i + 1, i + 2)  # posiciones en base 1


def bfs_linear(inicio, meta):
    """Realiza BFS para encontrar la secuencia mínima de intercambios."""
    start = tuple(inicio)
    goal = tuple(meta)
    if start == goal:
        return {"pasos": 0, "camino": [inicio], "movimientos": []}

    queue = deque([start])
    parents = {start: (None, None)}  # estado -> (padre, movimiento)

    while queue:
        state = queue.popleft()
        for nxt, move in neighbours(list(state)):
            key = tuple(nxt)
            if key in parents:
                continue
            parents[key] = (state, move)
            if key == goal:
                # reconstruir camino
                path = []
                moves = []
                cur = key
                while cur is not None:
                    path.append(list(cur))
                    parent, mv = parents[cur]
                    if mv is not None:
                        moves.append({"i": mv[0], "j": mv[1]})
                    cur = parent
                path.reverse()
                moves.reverse()
                return {
                    "pasos": len(path) - 1,
                    "camino": path,
                    "movimientos": moves,
                }
            queue.append(key)
    raise ValueError(
        "No se encontró camino; verifica que inicio y meta contengan los mismos elementos."
    )


def main():
    parser = argparse.ArgumentParser(
        description="Resolver el puzle lineal de 8 dígitos usando BFS"
    )
    parser.add_argument(
        "inicio",
        help="Estado inicial como lista separada por comas, ej. 8,7,6,5,4,3,2,1",
    )
    parser.add_argument(
        "meta",
        help="Estado objetivo como lista separada por comas, ej. 1,2,3,4,5,6,7,8",
    )
    args = parser.parse_args()

    inicio = parse_state(args.inicio)
    meta = parse_state(args.meta)
    validate_states(inicio, meta)
    resultado = bfs_linear(inicio, meta)

    print(f"Pasos: {resultado['pasos']}")
    for idx, estado in enumerate(resultado["camino"]):
        print(f"{idx}: {','.join(map(str, estado))}")


if __name__ == "__main__":
    main()
