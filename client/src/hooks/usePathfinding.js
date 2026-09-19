import { useRef, useCallback, useEffect } from 'react';

function bfs(start, goal, blocked, maxX, maxY) {
  const key = (x, y) => `${x},${y}`;
  const isBlocked = (x, y) =>
    x < 0 || y < 0 || x > maxX || y > maxY || blocked.has(key(x, y));

  if (isBlocked(goal.x, goal.y)) return null;
  if (start.x === goal.x && start.y === goal.y) return [];

  const dirs = [
    { dx: 0, dy: -1, d: 'gora'  },
    { dx: 0, dy:  1, d: 'dol'   },
    { dx: -1, dy: 0, d: 'lewo'  },
    { dx:  1, dy: 0, d: 'prawo' },
  ];

  const queue = [{ x: start.x, y: start.y, path: [] }];
  const visited = new Set([key(start.x, start.y)]);

  while (queue.length) {
    const { x, y, path } = queue.shift();
    if (path.length > 80) continue;

    for (const { dx, dy, d } of dirs) {
      const nx = x + dx, ny = y + dy;
      const k = key(nx, ny);
      if (!visited.has(k) && !isBlocked(nx, ny)) {
        const np = [...path, d];
        if (nx === goal.x && ny === goal.y) return np;
        visited.add(k);
        queue.push({ x: nx, y: ny, path: np });
      }
    }
  }
  return null;
}

export function buildBlockSet(state) {
  const set = new Set();
  if (!state) return set;
  for (const b of state.blockers || []) set.add(`${b.x},${b.y}`);
  for (const n of state.npcs    || []) set.add(`${n.x},${n.y}`);
  for (const m of state.mobs    || []) set.add(`${m.x},${m.y}`);
  return set;
}

export function usePathfinding(onMove) {
  const timerRef  = useRef(null);
  const pathRef   = useRef([]);
  const activeRef = useRef(false);

  const stopWalking = useCallback(() => {
    activeRef.current = false;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    pathRef.current  = [];
  }, []);

  useEffect(() => () => stopWalking(), [stopWalking]);

  const STEP_MS = 215; // min ms between steps — matches MOVE_MS in Game.jsx

  // Sequential async walk — each step awaits the previous
  function startWalk(path, onDone) {
    stopWalking();
    if (!path || path.length === 0) { onDone?.(); return; }
    pathRef.current  = path;
    activeRef.current = true;

    async function step() {
      if (!activeRef.current || pathRef.current.length === 0) {
        if (activeRef.current) onDone?.();
        stopWalking();
        return;
      }
      const t0  = Date.now();
      const dir = pathRef.current.shift();
      const ok  = await onMove(dir);
      if (!ok) { stopWalking(); return; }
      if (activeRef.current && pathRef.current.length > 0) {
        // Jeśli sieć zajęła ≥ STEP_MS — odpal natychmiast zamiast czekać kolejne 215ms
        const remaining = STEP_MS - (Date.now() - t0);
        timerRef.current = setTimeout(step, Math.max(0, remaining));
      } else {
        if (activeRef.current) onDone?.();
        stopWalking();
      }
    }
    step();
  }

  const walkTo = useCallback((targetX, targetY, state) => {
    if (!state) return;
    const blocked = buildBlockSet(state);
    const { postac, mapa } = state;
    const path = bfs({ x: postac.x, y: postac.y }, { x: targetX, y: targetY }, blocked, mapa.maks_x, mapa.maks_y);
    startWalk(path);
  }, [onMove]);

  const walkAdjacentTo = useCallback((targetX, targetY, state, onArrival) => {
    if (!state) return;
    const { postac, mapa } = state;

    if (Math.abs(postac.x - targetX) <= 1 && Math.abs(postac.y - targetY) <= 1) {
      onArrival?.(); return;
    }

    const blocked = buildBlockSet(state);
    const candidates = [
      { x: targetX - 1, y: targetY }, { x: targetX + 1, y: targetY },
      { x: targetX, y: targetY - 1 }, { x: targetX, y: targetY + 1 },
    ].filter(a => a.x >= 0 && a.y >= 0 && a.x <= mapa.maks_x && a.y <= mapa.maks_y && !blocked.has(`${a.x},${a.y}`));

    if (!candidates.length) return;

    // Pick closest reachable adjacent tile
    let best = null, bestLen = Infinity;
    for (const c of candidates) {
      const p = bfs({ x: postac.x, y: postac.y }, c, blocked, mapa.maks_x, mapa.maks_y);
      if (p && p.length < bestLen) { best = p; bestLen = p.length; }
    }
    startWalk(best, onArrival);
  }, [onMove]);

  return { walkTo, walkAdjacentTo, stopWalking };
}
