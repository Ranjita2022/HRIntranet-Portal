@echo off
:: =============================================================
:: IEEE HR Intranet Portal — Deploy to Server (Windows)
:: =============================================================
:: PURPOSE : Build the WAR on Windows and push it to the server.
:: USAGE   : deploy-to-server.bat
:: REQUIRES: Maven, Java 17, OpenSSH (built into Win10/11) or PuTTY
:: =============================================================
title IEEE HR Portal - Deploy to Server
color 0B

:: ─── Configuration (EDIT THESE) ─────────────────────────────
set SERVER_HOST=YOUR_SERVER_IP
set SERVER_USER=ubuntu
set SSH_PORT=22
set SSH_KEY=
:: Example with key: set SSH_KEY=-i C:\Users\you\.ssh\id_rsa
set TOMCAT_HOME=/opt/tomcat
set SERVICE_NAME=hrintranet
set LOCAL_WAR=target\ROOT.war
set REMOTE_TMP=/tmp/ROOT.war
:: ─────────────────────────────────────────────────────────────

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║       IEEE HR Intranet Portal — Deploy to Server         ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║  Server : %SERVER_HOST%
echo ║  User   : %SERVER_USER%
echo ║  Service: %SERVICE_NAME%
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: ─── Check if pom.xml exists ──────────────────────────────────
if not exist pom.xml (
    echo [ERROR] pom.xml not found. Run this script from the project root.
    pause
    exit /b 1
)

:: ─── Check server host is configured ─────────────────────────
if "%SERVER_HOST%"=="YOUR_SERVER_IP" (
    echo [ERROR] Please set SERVER_HOST in this script before running!
    pause
    exit /b 1
)

:: ─── Step 1: Build the WAR ────────────────────────────────────
echo [1/5] Building WAR file (skipping tests)...
call mvn clean package -DskipTests -q
if errorlevel 1 (
    echo [ERROR] Maven build failed!
    pause
    exit /b 1
)
if not exist "%LOCAL_WAR%" (
    echo [ERROR] WAR file not found at %LOCAL_WAR%
    pause
    exit /b 1
)
echo [OK]    Build complete: %LOCAL_WAR%
echo.

:: ─── Step 2: Test SSH connection ─────────────────────────────
echo [2/5] Testing SSH connection to %SERVER_HOST%...
ssh %SSH_KEY% -p %SSH_PORT% -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 %SERVER_USER%@%SERVER_HOST% "echo SSH_OK" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] SSH connection failed! Check host, user, port, and SSH key.
    pause
    exit /b 1
)
echo [OK]    SSH connection successful
echo.

:: ─── Step 3: Upload the WAR ───────────────────────────────────
echo [3/5] Uploading ROOT.war to server...
scp %SSH_KEY% -P %SSH_PORT% -o StrictHostKeyChecking=accept-new "%LOCAL_WAR%" %SERVER_USER%@%SERVER_HOST%:%REMOTE_TMP%
if errorlevel 1 (
    echo [ERROR] Failed to upload ROOT.war to server
    pause
    exit /b 1
)
echo [OK]    Upload complete
echo.

:: ─── Step 4: Deploy on server ─────────────────────────────────
echo [4/5] Deploying on server (stop, swap WAR, start)...
ssh %SSH_KEY% -p %SSH_PORT% %SERVER_USER%@%SERVER_HOST% "sudo systemctl stop %SERVICE_NAME% && sudo rm -rf %TOMCAT_HOME%/webapps/ROOT && sudo cp %REMOTE_TMP% %TOMCAT_HOME%/webapps/ROOT.war && sudo chown hrintranet:hrintranet %TOMCAT_HOME%/webapps/ROOT.war && sudo systemctl start %SERVICE_NAME% && echo DEPLOY_OK"
if errorlevel 1 (
    echo [ERROR] Deployment step failed. Check server logs.
    pause
    exit /b 1
)
echo [OK]    Deployment step complete
echo.

:: ─── Step 5: Check service ────────────────────────────────────
echo [5/5] Waiting 20 seconds for application startup...
timeout /t 20 /nobreak >nul
ssh %SSH_KEY% -p %SSH_PORT% %SERVER_USER%@%SERVER_HOST% "sudo systemctl is-active %SERVICE_NAME% && echo Service is RUNNING || echo Service FAILED"
echo.

echo ╔══════════════════════════════════════════════════════════╗
echo ║   Deployment complete!                                   ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║  App URL    : http://%SERVER_HOST%
echo ║  Admin      : http://%SERVER_HOST%/admin-login.html
echo ║  Health API : http://%SERVER_HOST%/api/public/health
echo ║                                                          ║
echo ║  Tail logs: ssh %SERVER_USER%@%SERVER_HOST%
echo ║    then: sudo tail -f %TOMCAT_HOME%/logs/catalina.out
echo ╚══════════════════════════════════════════════════════════╝
echo.
pause

