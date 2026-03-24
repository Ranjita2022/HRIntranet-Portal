@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo Starting IEEE HR Intranet Portal
echo ========================================
echo.
echo Building and running application...
call mvn clean spring-boot:run -DskipTests
pause
