#!/bin/bash
# =============================================================
# IEEE HR Intranet Portal — Git Clone & Run Script
# =============================================================
# PURPOSE : Clone the repository from Git and run the app
#           on a fresh Linux machine (dev or staging).
# USAGE   : bash git-clone-and-run.sh [--branch <branch>] [--repo <url>]
# REQUIRES: Java 17+, Maven 3.6+, MySQL 8.0
# =============================================================

set -euo pipefail

# ─── Configuration (edit these or pass as env vars) ───────────
REPO_URL="${REPO_URL:-https://github.com/YOUR_ORG/HRIntranet-Portal.git}"
BRANCH="${BRANCH:-main}"
INSTALL_DIR="${INSTALL_DIR:-/opt/hrintranet/app}"
DB_NAME="${DB_NAME:-hr_intranet_portal}"
DB_USER="${DB_USER:-hrportal}"
DB_PASS="${DB_PASS:-StrongPassword123!}"
DB_HOST="${DB_HOST:-localhost}"
UPLOAD_DIR="${UPLOAD_DIR:-/opt/tomcat/uploads/images}"
APP_PORT="${APP_PORT:-8080}"
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
    --branch) BRANCH="$2"; shift 2 ;;
    --repo)   REPO_URL="$2"; shift 2 ;;
    --dir)    INSTALL_DIR="$2"; shift 2 ;;
    *) error "Unknown argument: $1" ;;
  esac
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  IEEE HR Intranet Portal — Clone & Run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Repo    : $REPO_URL"
echo "  Branch  : $BRANCH"
echo "  Dir     : $INSTALL_DIR"
echo "  Port    : $APP_PORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── 1. Check prerequisites ───────────────────────────────────
info "Checking prerequisites..."

command -v java  >/dev/null 2>&1 || error "Java 17+ is required. Install: sudo apt install openjdk-17-jdk"
command -v mvn   >/dev/null 2>&1 || error "Maven 3.6+ is required. Install: sudo apt install maven"
command -v git   >/dev/null 2>&1 || error "Git is required. Install: sudo apt install git"
command -v mysql >/dev/null 2>&1 || warn  "MySQL client not found — skipping DB check."

JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
[[ "$JAVA_VER" -ge 17 ]] || error "Java 17+ is required. Found version: $JAVA_VER"
success "Prerequisites OK (Java $JAVA_VER, Maven $(mvn -q -version 2>&1 | head -1))"

# ─── 2. Clone or pull the repository ──────────────────────────
if [[ -d "$INSTALL_DIR/.git" ]]; then
  info "Repository already exists at $INSTALL_DIR — pulling latest changes..."
  cd "$INSTALL_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
  success "Repository updated to latest $BRANCH"
else
  info "Cloning repository..."
  mkdir -p "$(dirname "$INSTALL_DIR")"
  git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  success "Repository cloned to $INSTALL_DIR"
fi

# ─── 3. Create uploads directory ──────────────────────────────
info "Creating uploads directory at $UPLOAD_DIR..."
mkdir -p "$UPLOAD_DIR"
success "Uploads directory ready"

# ─── 4. Configure application.properties ──────────────────────
PROPS_FILE="$INSTALL_DIR/src/main/resources/application.properties"
if [[ -f "$PROPS_FILE" ]]; then
  info "Updating database credentials in application.properties..."
  sed -i "s|spring.datasource.url=.*|spring.datasource.url=jdbc:mysql://${DB_HOST}:3306/${DB_NAME}?useSSL=false\&serverTimezone=UTC\&allowPublicKeyRetrieval=true|" "$PROPS_FILE"
  sed -i "s|spring.datasource.username=.*|spring.datasource.username=${DB_USER}|" "$PROPS_FILE"
  sed -i "s|spring.datasource.password=.*|spring.datasource.password=${DB_PASS}|" "$PROPS_FILE"
  sed -i "s|app.upload.dir=.*|app.upload.dir=${UPLOAD_DIR}|" "$PROPS_FILE"
  success "application.properties updated"
else
  warn "application.properties not found at $PROPS_FILE — skipping DB config"
fi

# ─── 5. Import database schema ────────────────────────────────
if command -v mysql >/dev/null 2>&1; then
  echo ""
  read -rp "Import database schema now? (y/N): " IMPORT_DB
  if [[ "${IMPORT_DB,,}" == "y" ]]; then
    info "Importing database schema..."
    DB_DIR="$INSTALL_DIR/database"
    SCHEMAS=(
      "hr_intranet_portal_employees.sql"
      "hr_intranet_portal_admin_users.sql"
      "hr_intranet_portal_announcements.sql"
      "hr_intranet_portal_holidays.sql"
      "hr_intranet_portal_carousel_slides.sql"
      "hr_intranet_portal_gallery_folders.sql"
      "hr_intranet_portal_gallery_images.sql"
      "hr_intranet_portal_images.sql"
      "hr_intranet_portal_quick_links.sql"
      "hr_intranet_portal_emergency_contacts.sql"
      "hr_intranet_portal_open_positions.sql"
      "hr_intranet_portal_shoutouts.sql"
      "hr_intranet_portal_audit_log.sql"
      "hr_intranet_portal_routines.sql"
      "create_open_positions_table.sql"
    )
    for sql in "${SCHEMAS[@]}"; do
      if [[ -f "$DB_DIR/$sql" ]]; then
        info "  Importing $sql..."
        mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$DB_DIR/$sql"
        success "  $sql imported"
      else
        warn "  $sql not found — skipping"
      fi
    done
    success "Database schema imported"
  fi
fi

# ─── 6. Build the application ─────────────────────────────────
echo ""
info "Building the application (this may take 1–3 minutes)..."
cd "$INSTALL_DIR"
mvn clean package -DskipTests -q
success "Build complete → target/ROOT.war"

# ─── 7. Run with embedded server ──────────────────────────────
echo ""
info "Starting the application on port $APP_PORT..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Application starting at: http://localhost:$APP_PORT"
echo "  Admin panel            : http://localhost:$APP_PORT/admin-login.html"
echo "  Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

mvn spring-boot:run -DskipTests -Dspring-boot.run.jvmArguments="-Xms256m -Xmx512m"

