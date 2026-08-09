@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo Node.js e npm nao foram encontrados. Instale o Node.js 20 ou superior.
  pause
  exit /b 1
)

call npm run dev
if errorlevel 1 (
  echo.
  echo O E-Market nao foi iniciado. Consulte a mensagem de erro acima.
  pause
)
