#!/bin/sh
PID=$(netstat -tlpn 2>/dev/null | grep ':3085 ' | awk '{print $7}' | cut -d'/' -f1)
if [ -n "$PID" ]; then
    kill -9 "$PID" 2>/dev/null || true
    echo "Serveur Wishlist arrete (PID $PID)."
else
    echo "Aucun serveur Wishlist actif sur le port 3085."
fi
