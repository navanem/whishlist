#!/bin/sh
PORT=${PORT:-3000}
PID=$(lsof -ti :$PORT 2>/dev/null || true)
if [ -n "$PID" ]; then
    kill -9 "$PID" 2>/dev/null || true
    echo "Serveur arrêté sur le port $PORT."
else
    echo "Aucun serveur actif sur le port $PORT."
fi
