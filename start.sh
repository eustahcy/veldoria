#!/bin/bash
# Start Margonem Node.js + React

cd "$(dirname "$0")"

echo "=== Margonem Startup ==="

# Kill existing processes
pkill -f "margo/server/src/index.js" 2>/dev/null
pkill -f "vite.*5174" 2>/dev/null
sleep 1

# Start backend
echo "[1/2] Starting backend (port 3002)..."
node server/src/index.js &
SERVER_PID=$!
sleep 2

# Verify backend
if ! curl -sf http://localhost:3002/api/auth/stats > /dev/null 2>&1; then
  echo "ERROR: Backend failed to start"
  exit 1
fi
echo "      Backend OK (PID: $SERVER_PID)"

# Start frontend
echo "[2/2] Starting frontend (port 5174)..."
cd client && npm run dev -- --host 0.0.0.0 &
CLIENT_PID=$!
cd ..
sleep 3

echo ""
echo "=== Margonem Running ==="
echo "  Frontend: http://localhost:5174"
echo "  Backend:  http://localhost:3002"
echo ""
echo "Postacie (hasło: 1 dla wszystkich):"
echo "  WerdiZ (Tancerz Ostrzy lvl 18)"
echo "  Mafia  (Paladyn lvl 28)"
echo "  ProbZ  (Mag lvl 100)"
echo "  Pogromca Noobów (Tropiciel lvl 4)"
echo ""
echo "Sterowanie: WASD lub strzałki"
echo "Press Ctrl+C to stop"

wait
