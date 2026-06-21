@echo off
title My Website Dashboard
color 0A

REM CRITICAL: change to THIS folder (where the .bat file lives)
cd /d "%~dp0"

echo.
echo  ============================================
echo        WEBSITE DASHBOARD - STARTING UP
echo  ============================================
echo.

REM Double-check we are in the right folder
if not exist "package.json" (
  echo  [!] ERROR: package.json not found in this folder!
  echo.
  echo      Make sure START-WINDOWS.bat is INSIDE the 'backend' folder
  echo      (next to package.json, src, public folders).
  echo.
  echo      Current folder: %CD%
  echo.
  pause
  exit /b
)

echo  Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [!] Node.js is NOT installed on your computer.
  echo.
  echo      Please install it first from:
  echo      https://nodejs.org
  echo.
  echo      Download the "LTS" version, then double-click
  echo      to install. After that, run THIS file again.
  echo.
  pause
  exit /b
)

echo  Node.js found! ✓
echo.
echo  Installing required files (first time only)...
call npm install

echo.
echo  Starting your dashboard...
echo.
echo  ============================================
echo   DONE! Your dashboard is opening now.
echo.
echo   Login details:
echo     Email:    admin@example.com
echo     Password: admin123
echo.
echo   (Keep this window open while you use it)
echo.
echo   If browser doesn't open automatically, go to:
echo   http://localhost:3000
echo  ============================================
echo.

timeout /t 2 >nul
start http://localhost:3000
call npm start

echo.
echo  Dashboard stopped. Press any key to close.
pause >nul
