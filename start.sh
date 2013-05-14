#!/bin/sh
echo Killing process `cat server.js.pid`
kill `cat server.js.pid`
nohup node server.js &
echo $! > server.js.pid
echo New process running as `cat server.js.pid`
