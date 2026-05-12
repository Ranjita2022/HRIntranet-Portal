@echo off
title IEEE HR Portal - Spring Boot Backend
color 0B
cd /d "%~dp0"

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║          IEEE HR Intranet Portal - BACKEND               ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║  Rebuild required ONLY for:                              ║
echo ║    • Java source code changes (src\main\java\)           ║
echo ║    • application.properties changes                      ║
echo ║    • pom.xml dependency changes                          ║
echo ║                                                          ║
echo ║  NO rebuild needed for:                                  ║
echo ║    • HTML / CSS / JS changes in src\main\webapp\         ║
echo ║    → Just press Ctrl+F5 in browser to see changes!       ║
echo ║    → Or use start-ui-dev.bat for hot-reload dev mode     ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Building and starting backend on http://localhost:8080 ...
echo.
call mvn spring-boot:run -DskipTests
pause
