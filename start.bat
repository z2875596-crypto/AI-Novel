@echo off
cd /d %~dp0
echo 正在启动 AI 互动小说...
start cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
start http://localhost:3000