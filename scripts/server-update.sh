#!/bin/bash
# =============================================================
# IEEE HR Intranet Portal — Server Self-Update Script
# =============================================================
# PURPOSE : Pull latest code from Git directly ON the server,
#           rebuild, and redeploy without touching your local machine.
# USAGE   : sudo bash server-update.sh [--branch <branch>]
# RUN ON  : The PRODUCTION SERVER (not your local machine)
# REQUIRES: Git, Java 17+, Maven 3.6+ installed on the server
# =============================================================

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────
REPO_URL="${REPO_URL:-https://github.com/YOUR_ORG/HRIntranet-Portal.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/opt/hrintranet/app}"
TOMCAT_HOME="${TOMCAT_HOME:-/opt/tomcat}"
SERVICE_NAME="${SERVICE_NAME:-hrintranet}"
APP_USER="${APP_USER:-hrintranet}"
UPLOAD_DIR="${UPLOAD_DIR:-/opt/tomcat/uploads/images}"
BACKUP_DIR="${BACKUP_DIR:-/opt/hrintranet/backups/wars}"
KEEP_BACKUPS="${KEEP_BACKUPS:-5}"
# ──────────────────────────────────────────────────────────────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/opt/hrintranet/deploy-${TIMESTAMP}.log"

# Tee all output to log file
exec > >(tee -a "$LOG_FILE") 2>&1

# ─── Parse arguments ──────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --branch) BRANCH="$2"; shift 2 ;;
    --repo)   REPO_URL="$2"; shift 2 ;;
    *) error "Unknown argument: $1" ;;
  esac
done

# ─── Must run as root (for systemctl) ─────────────────────────
[[ $EUID -eq 0 ]] || error "Run this script with sudo: sudo bash server-update.sh"

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  IEEE HR Intranet Portal — Server Self-Update${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  Branch  : $BRANCH"
echo "  App Dir : $APP_DIR"
echo "  Tomcat  : $TOMCAT_HOME"
echo "  Service : $SERVICE_NAME"
echo "  Log     : $LOG_FILE"
echo "  Time    : $(date)"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ─── 1. Check prerequisites ───────────────────────────────────
info "Checking prerequisites..."
command -v java  >/dev/null 2>&1 || error "Java 17+ not found. Install: sudo apt install openjdk-17-jdk"
command -v mvn   >/dev/null 2>&1 || error "Maven not found. Install: sudo apt install maven"
command -v git   >/dev/null 2>&1 || error "Git not found. Install: sudo apt install git"

JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
[[ "$JAVA_VER" -ge 17 ]] || error "Java 17+ required. Found: $JAVA_VER"
success "Prerequisites OK (Java $JAVA_VER)"

# ─── 2. Clone or pull latest code ─────────────────────────────
echo ""
if [[ -d "$APP_DIR/.git" ]]; then
  info "Pulling latest changes from $BRANCH..."
  cd "$APP_DIR"
  sudo -u "$APP_USER" git fetch origin
  sudo -u "$APP_USER" git checkout "$BRANCH"
  sudo -u "$APP_USER" git pull origin "$BRANCH"
  GIT_COMMIT=$(git rev-parse --short HEAD)
  success "Code updated → commit $GIT_COMMIT"
else
  info "Cloning repository for the first time..."
  mkdir -p "$(dirname "$APP_DIR")"
  sudo -u "$APP_USER" git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
  GIT_COMMIT=$(git rev-parse --short HEAD)
  success "Repository cloned → commit $GIT_COMMIT"
fi

# ─── 3. Preserve the production application.properties ────────
echo ""
PROD_PROPS="$TOMCAT_HOME/webapps/ROOT/WEB-INF/classes/application.properties"
PROPS_BACKUP="/tmp/application.properties.bak.$TIMESTAMP"

if [[ -f "$PROD_PROPS" ]]; then
  info "Backing up production application.properties..."
  cp "$PROD_PROPS" "$PROPS_BACKUP"
  success "Saved to $PROPS_BACKUP"
else
  warn "No existing application.properties found — will use the one from source"
fi

# ─── 4. Build the WAR ─────────────────────────────────────────
echo ""
info "Building WAR file (this takes 1–3 minutes)..."
cd "$APP_DIR"
sudo -u "$APP_USER" mvn clean package -DskipTests -q
NEW_WAR="$APP_DIR/target/ROOT.war"
[[ -f "$NEW_WAR" ]] || error "Build failed — ROOT.war not found at $NEW_WAR"
WAR_SIZE=$(du -h "$NEW_WAR" | cut -f1)
success "Build complete → ROOT.war ($WAR_SIZE)"

# ─── 5. Backup the current deployment ─────────────────────────
echo ""
mkdir -p "$BACKUP_DIR"
if [[ -f "$TOMCAT_HOME/webapps/ROOT.war" ]]; then
  info "Backing up current ROOT.war..."
  cp "$TOMCAT_HOME/webapps/ROOT.war" "$BACKUP_DIR/ROOT.war.$TIMESTAMP"
  success "Backup saved to $BACKUP_DIR/ROOT.war.$TIMESTAMP"
fi

# ─── 6. Stop Tomcat ───────────────────────────────────────────
echo ""
info "Stopping $SERVICE_NAME service..."
systemctl stop "$SERVICE_NAME"
sleep 3
success "Service stopped"

# ─── 7. Deploy the new WAR ────────────────────────────────────
echo ""
info "Removing old deployment..."
rm -rf "$TOMCAT_HOME/webapps/ROOT"

info "Installing new ROOT.war..."
cp "$NEW_WAR" "$TOMCAT_HOME/webapps/ROOT.war"
chown "${APP_USER}:${APP_USER}" "$TOMCAT_HOME/webapps/ROOT.war"
success "New WAR installed"

# ─── 8. Start Tomcat (let it extract WAR) ─────────────────────
echo ""
info "Starting $SERVICE_NAME service (Tomcat will extract WAR)..."
systemctl start "$SERVICE_NAME"
info "Waiting 25 seconds for application startup..."
sleep 25

# ─── 9. Restore production application.properties ─────────────
echo ""
EXTRACTED_PROPS="$TOMCAT_HOME/webapps/ROOT/WEB-INF/classes/application.properties"
if [[ -f "$PROPS_BACKUP" ]] && [[ -f "$EXTRACTED_PROPS" ]]; then
  info "Restoring production application.properties..."
  cp "$PROPS_BACKUP" "$EXTRACTED_PROPS"
  chown "${APP_USER}:${APP_USER}" "$EXTRACTED_PROPS"
  success "Production config restored"

  info "Restarting to apply config..."
  systemctl restart "$SERVICE_NAME"
  sleep 15
  success "Service restarted with production config"
fi

# ─── 10. Ensure uploads directory persists ────────────────────
echo ""
info "Ensuring uploads directory is intact..."
mkdir -p "$UPLOAD_DIR"
chown -R "${APP_USER}:${APP_USER}" "$UPLOAD_DIR"
success "Uploads directory OK: $UPLOAD_DIR"

# ─── 11. Verify service is running ────────────────────────────
echo ""
info "Verifying service status..."
if systemctl is-active --quiet "$SERVICE_NAME"; then
  success "Service is ACTIVE"
else
  error "Service failed to start. Check: journalctl -u $SERVICE_NAME -n 50"
fi

# Health check
sleep 5
HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" "http://localhost:8080/api/public/health" 2>/dev/null || echo "000")
if [[ "$HTTP_CODE" =~ ^(200|401|403)$ ]]; then
  success "Health check OK (HTTP $HTTP_CODE)"
elif [[ "$HTTP_CODE" == "000" ]]; then
  warn "Health endpoint unreachable — app may still be starting up. Check: tail -f $TOMCAT_HOME/logs/catalina.out"
else
  warn "Health check returned HTTP $HTTP_CODE"
fi

# ─── 12. Clean up old WAR backups ─────────────────────────────
echo ""
info "Cleaning up old WAR backups (keeping last $KEEP_BACKUPS)..."
ls -t "$BACKUP_DIR"/ROOT.war.* 2>/dev/null | tail -n +"$((KEEP_BACKUPS + 1))" | xargs rm -f && true
success "Cleanup complete"

# ─── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}${BOLD}✅ Update complete!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  Commit  : $GIT_COMMIT ($BRANCH)"
echo "  WAR size: $WAR_SIZE"
echo "  Log file: $LOG_FILE"
echo ""
echo "  Useful commands:"
echo "  sudo systemctl status $SERVICE_NAME"
echo "  sudo -u $APP_USER tail -f $TOMCAT_HOME/logs/catalina.out"
echo "  curl http://localhost:8080/api/public/health"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

