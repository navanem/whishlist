#!/bin/sh
cd /volume3/docker/wishlist
PID=$(netstat -tlpn 2>/dev/null | grep ':3085 ' | awk '{print $7}' | cut -d'/' -f1)
if [ -n "$PID" ]; then
    kill -9 "$PID" 2>/dev/null || true
    sleep 1
fi
nohup env PORT=3085 HOSTNAME=0.0.0.0 DATA_DIR=/volume3/docker/wishlist/data /volume3/docker/shroom/node-bin/bin/node /volume3/docker/wishlist/server.js > /volume3/docker/wishlist/wishlist.log 2>&1 < /dev/null &
echo 'Serveur Wishlist demarre sur le port 3085.'
