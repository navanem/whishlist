#!/bin/sh
PORT=${PORT:-3000}
DATA_DIR=${DATA_DIR:-./data}

PID=$(lsof -ti :$PORT 2>/dev/null || true)
if [ -n "$PID" ]; then
    kill -9 "$PID" 2>/dev/null || true
    sleep 1
fi

PORT=$PORT DATA_DIR=$DATA_DIR node server.js > server.log 2>&1 &
echo "Serveur Cadeaux démarré sur le port $PORT."
