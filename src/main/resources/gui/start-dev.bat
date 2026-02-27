@echo off
set PATH=D:\INSTALLATION\eclipse\.node\node-v22.21.1-win-x64;%PATH%
echo Starting AlpenLuce frontend dev server...
node node_modules/next/dist/bin/next dev
