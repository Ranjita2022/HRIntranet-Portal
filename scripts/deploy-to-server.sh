#!/bin/bash
# =============================================================
# IEEE HR Intranet Portal — Deploy to Production Server
# =============================================================
# PURPOSE : Build the WAR locally, push it to the Linux server,
#           and restart the application — all from your machine.
# USAGE   : bash deploy-to-server.sh [--host <ip>] [--user <user>]
#           ./deploy-to-server.sh --host 192.168.1.100 --user ubuntu
# REQUIRES: Maven 3.6+, Java 17+, SSH access to server, scp/ssh
# RUN ON  : Your LOCAL machine (Windows/Mac/Linux with Git Bash)
# =============================================================

set -euo pipefail

# ─── Configuration (edit these or pass as arguments) ──────────
SERVER_HOST="${SERVER_HOST:-YOUR_SERVER_IP}"
SERVER_USER="${SERVER_USER:-ubuntu}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-}"                             # e.g. ~/.ssh/id_rsa  (leave blank for password auth)
TOMCAT_HOME="${TOMCAT_HOME:-/opt/tomcat}"
SERVICE_NAME="${SERVICE_NAME:-hrintranet}"
REMOTE_TMP="/tmp/ROOT.war"
LOCAL_WAR="target/ROOT.war"
# ──────────────────────────────────────────────────────────────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ─── Parse arguments ──────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --host)    SERVER_HOST="$2"; shift 2 ;;
    --user)    SERVER_USER="$2"; shift 2 ;;
    --port)    SSH_PORT="$2"; shift 2 ;;
    --key)     SSH_KEY="$2"; shift 2 ;;
    --service) SERVICE_NAME="$2"; shift 2 ;;
    *) error "Unknown argument: $1" ;;
  esac
done

# Build SSH options
SSH_OPTS="-p $SSH_PORT -o StrictHostKeyChecking=accept-new"
SCP_OPTS="-P $SSH_PORT -o StrictHostKeyChecking=accept-new"
if [[ -n "$SSH_KEY" ]]; then
  SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
  SCP_OPTS="$SCP_OPTS -i $SSH_KEY"
fi

[[ "$SERVER_HOST" == "YOUR_SERVER_IP" ]] && error "Set SERVER_HOST or pass --host <ip>"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  IEEE HR Intranet Portal — Deploy to Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Server  : $SERVER_USER@$SERVER_HOST:$SSH_PORT"
echo "  Service : $SERVICE_NAME"
echo "  Tomcat  : $TOMCAT_HOME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── 1. Pre-flight: make sure we're in the project root ───────
[[ -f "pom.xml" ]] || error "pom.xml not found. Run this script from the project root."

# ─── 2. Test SSH connection ───────────────────────────────────
info "Testing SSH connection to $SERVER_HOST..."
ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "echo 'SSH OK'" >/dev/null 2>&1 \
  || error "Cannot connect via SSH. Check host, user, port, and key."
success "SSH connection OK"

# ─── 3. Build the WAR ─────────────────────────────────────────
echo ""
info "Building WAR (skipping tests)..."
mvn clean package -DskipTests -q
[[ -f "$LOCAL_WAR" ]] || error "Build failed — $LOCAL_WAR not found"
WAR_SIZE=$(du -h "$LOCAL_WAR" | cut -f1)
success "Build complete — $LOCAL_WAR ($WAR_SIZE)"

# ─── 4. Create remote backup ──────────────────────────────────
echo ""
info "Creating backup of current deployment on server..."
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "
  if [[ -f $TOMCAT_HOME/webapps/ROOT.war ]]; then
    sudo cp $TOMCAT_HOME/webapps/ROOT.war $TOMCAT_HOME/webapps/ROOT.war.bak.$BACKUP_TIMESTAMP
    echo 'Backup created: ROOT.war.bak.$BACKUP_TIMESTAMP'
  else
    echo 'No existing WAR to back up (fresh deploy)'
  fi
"
success "Backup step complete"

# ─── 5. Transfer the new WAR ──────────────────────────────────
echo ""
info "Uploading ROOT.war to server ($WAR_SIZE)..."
scp $SCP_OPTS "$LOCAL_WAR" "$SERVER_USER@$SERVER_HOST:$REMOTE_TMP"
success "Upload complete"

# ─── 6. Stop service, deploy, start service ───────────────────
echo ""
info "Deploying on server..."
ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" bash <<REMOTE_SCRIPT
  set -e
  echo "[REMOTE] Stopping $SERVICE_NAME service..."
  sudo systemctl stop $SERVICE_NAME

  echo "[REMOTE] Removing old webapps/ROOT directory..."
  sudo rm -rf $TOMCAT_HOME/webapps/ROOT

  echo "[REMOTE] Installing new ROOT.war..."
  sudo cp $REMOTE_TMP $TOMCAT_HOME/webapps/ROOT.war
  sudo chown hrintranet:hrintranet $TOMCAT_HOME/webapps/ROOT.war

  echo "[REMOTE] Starting $SERVICE_NAME service..."
  sudo systemctl start $SERVICE_NAME

  echo "[REMOTE] Service started. Waiting 20s for startup..."
  sleep 20

  echo "[REMOTE] Checking service status..."
  sudo systemctl is-active $SERVICE_NAME && echo "[REMOTE] ✅ Service is RUNNING" || echo "[REMOTE] ❌ Service FAILED to start"

  echo "[REMOTE] Cleaning up /tmp/ROOT.war..."
  rm -f $REMOTE_TMP

  echo "[REMOTE] Recent startup log:"
  sudo -u hrintranet tail -20 $TOMCAT_HOME/logs/catalina.out 2>/dev/null | grep -E "(ERROR|WARN|INFO.*startup|SEVERE)" || true
REMOTE_SCRIPT

# ─── 7. Smoke test ────────────────────────────────────────────
echo ""
info "Running smoke test (health check via Nginx)..."
sleep 5
HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" "http://$SERVER_HOST/api/public/health" 2>/dev/null || echo "000")
if [[ "$HTTP_CODE" =~ ^(200|401|403)$ ]]; then
  success "Health check responded with HTTP $HTTP_CODE — app is UP"
elif [[ "$HTTP_CODE" == "000" ]]; then
  warn "Could not reach http://$SERVER_HOST — server may need HTTPS or firewall rule check"
else
  warn "Health check returned HTTP $HTTP_CODE — check logs on server"
fi

# ─── 8. Clean up old backups (keep last 5) ────────────────────
echo ""
info "Cleaning up old backups on server (keeping last 5)..."
ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "
  ls -t $TOMCAT_HOME/webapps/ROOT.war.bak.* 2>/dev/null | tail -n +6 | xargs sudo rm -f && echo 'Old backups removed' || true
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}✅ Deployment complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  App URL     : http://$SERVER_HOST"
echo "  Admin Login : http://$SERVER_HOST/admin-login.html"
echo "  Health API  : http://$SERVER_HOST/api/public/health"
echo ""
echo "  Tail live logs:"
echo "  ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST 'sudo -u hrintranet tail -f $TOMCAT_HOME/logs/catalina.out'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

