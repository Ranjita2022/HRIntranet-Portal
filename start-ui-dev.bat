@echo off
title HR Portal - UI Dev Server (No rebuild needed)
color 0A
cd /d "%~dp0"

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║       IEEE HR Portal - UI HOT RELOAD DEV MODE           ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║  Edit CSS / JS / HTML in src\main\webapp\               ║
echo ║  Then just hit Ctrl+F5 in the browser — no rebuild!     ║
echo ║                                                          ║
echo ║  Make sure Spring Boot is already running on :8080       ║
echo ║  (run start-app.bat in a separate terminal first)        ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: Check if Spring Boot backend is up
echo Checking backend on http://localhost:8080 ...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8080/api/public/portal-data' -UseBasicParsing -TimeoutSec 4; Write-Host '  Backend OK - HTTP ' + $r.StatusCode } catch { Write-Host '  WARNING: Backend not responding. Start start-app.bat first!' }"
echo.

cd src\main\webapp

echo Trying Python 3 ...
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✔ Python found. Starting static server on http://localhost:3000
    echo.
    echo  → Open: http://localhost:3000
    echo  → API : http://localhost:8080/api
    echo.
    echo  Edit any file in src\main\webapp\ and press Ctrl+F5 in browser.
    echo  Press Ctrl+C here to stop the UI server.
    echo.
    python -m http.server 3000
    goto :done
)

echo Python not found. Trying Node/npx ...
npx --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✔ Node found. Starting static server on http://localhost:3000
    npx serve -l 3000 .
    goto :done
)

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  Neither Python nor Node.js found.                       ║
echo ║  Install one of them:                                    ║
echo ║    Python: https://python.org/downloads                  ║
echo ║    Node:   https://nodejs.org                            ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Alternatively: open src\main\webapp\index.html directly
echo via File → Open in your browser (API calls go to :8080).
echo.

:done
pause

