# IEEE HR Intranet Portal

<div align="center">

![IEEE](https://img.shields.io/badge/IEEE-00629B?style=for-the-badge&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

A full-featured HR intranet portal with kiosk/TV mode, admin CMS, employee directory,
announcements, shoutouts, gallery, and more — built for IEEE.

</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Quick Start — Local Development](#quick-start--local-development)
6. [Configuration](#configuration)
7. [Database Setup](#database-setup)
8. [Admin Panel](#admin-panel)
9. [Kiosk / TV Mode](#kiosk--tv-mode)
10. [API Endpoints](#api-endpoints)
11. [Troubleshooting](#troubleshooting)
12. [Linux Deployment](#linux-deployment)

---

## Overview

The IEEE HR Intranet Portal is a **monolithic Java Spring Boot web application** that serves both the
REST API backend and the HTML/CSS/JS frontend from a single deployable **WAR file (ROOT.war)**.

It is designed for:
- **Lobby / reception TV screens** via a dedicated Kiosk Mode
- **Employee self-service** — holidays, announcements, shoutouts, job openings
- **HR administration** via a full-featured admin CMS with JWT authentication

---

## Features

### Portal (Public-Facing)

| Feature | Description |
|---|---|
| 🖼️ **Photo Carousel** | Auto-rotating company photos (5-second intervals) |
| 👋 **New Joiners** | Employees who joined within the last 30 days |
| 🎂 **Birthdays & Anniversaries** | Monthly celebration highlights |
| 📅 **Holiday Calendar** | Upcoming holidays with descriptions |
| 📢 **Announcements** | Company news, alerts, urgent notices, breaking ticker |
| 🔗 **Quick Links** | One-click shortcuts to internal resources |
| 🚨 **Emergency Contacts** | Always-accessible emergency numbers |
| 💼 **Open Positions** | Live job postings from HR |
| 🎉 **Shoutouts** | Peer recognition and appreciation board |
| ⏳ **Upcoming Event Countdown** | Live countdown timer to the next company event |
| 🌙 **Dark Mode** | User-toggle dark/light theme |
| 📺 **TV / Kiosk Mode** | Full-screen auto-rotating lobby display |

### Admin CMS (JWT-Protected)

| Module | Capabilities |
|---|---|
| 👥 Employees | Add, edit, deactivate; profile photo upload |
| 📢 Announcements | Create/schedule with images, priority, and expiry |
| 📅 Holidays | Manage the company holiday calendar |
| 🖼️ Carousel | Upload and reorder homepage banner slides |
| 🗂️ Gallery | Folder-based photo management for the kiosk |
| 🔗 Quick Links | Manage navigation shortcuts |
| 🚨 Emergency Contacts | Update the emergency contact list |
| 🏆 Work Anniversaries | View, filter, and export employee milestones |
| 💼 Open Positions | Post and manage job requisitions |
| 📋 Audit Log | Full audit trail of all admin actions with detail view |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | **17** | Runtime language |
| Spring Boot | 3.2.2 | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | ORM / database abstraction |
| MySQL Connector/J | 8.x | Database driver |
| JWT (jjwt) | 0.12.3 | Stateless admin tokens (24-hour expiry) |
| Lombok | 1.18.30 | Boilerplate reduction |
| Apache Commons IO | 2.15.1 | Multipart file handling |
| Maven | 3.6+ | Build & dependency management |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| HTML5 / CSS3 | — | Structure & styling |
| Bootstrap | 5.3.2 | Responsive UI framework |
| Bootstrap Icons | — | Icon library |
| jQuery | 3.7.1 | DOM, AJAX, animations |
| IEEE Brand Fonts | Custom | Corporate typography |

### Packaging & Deployment

| Component | Detail |
|---|---|
| Output format | **WAR** (`ROOT.war`) — deploys at server root context |
| Recommended server | Apache Tomcat 10.x |
| Database | MySQL 8.0 |
| Reverse proxy | Nginx (recommended for production) |

---

## Project Structure

```
HRIntranet-Portal/
├── pom.xml                              # Maven configuration (Java 17, Spring Boot 3.2.2)
├── start-app.bat                        # Windows dev quick-start script
├── README.md                            # This file
├── DEPLOY-LINUX.md                      # Linux server deployment guide
│
├── database/                            # SQL scripts — run to create schema & seed data
│   ├── hr_intranet_portal_admin_users.sql
│   ├── hr_intranet_portal_employees.sql
│   ├── hr_intranet_portal_announcements.sql
│   ├── hr_intranet_portal_holidays.sql
│   ├── hr_intranet_portal_carousel_slides.sql
│   ├── hr_intranet_portal_gallery_folders.sql
│   ├── hr_intranet_portal_gallery_images.sql
│   ├── hr_intranet_portal_images.sql
│   ├── hr_intranet_portal_quick_links.sql
│   ├── hr_intranet_portal_emergency_contacts.sql
│   ├── hr_intranet_portal_open_positions.sql
│   ├── hr_intranet_portal_shoutouts.sql
│   ├── hr_intranet_portal_audit_log.sql
│   ├── hr_intranet_portal_routines.sql
│   └── create_open_positions_table.sql
│
├── uploads/                             # Runtime-generated upload directory
│   └── images/                          # Uploaded employee photos, carousel images, etc.
│
└── src/
    └── main/
        ├── java/org/ieee/hrintranet/
        │   ├── HRIntranetApplication.java   # Spring Boot entry point
        │   ├── config/                      # Security, CORS, MVC, WebMvc config
        │   ├── controller/                  # REST controllers (public + admin)
        │   ├── dto/                         # Request/Response DTOs
        │   ├── entity/                      # JPA entities mapping to DB tables
        │   ├── model/                       # Additional domain models
        │   ├── repository/                  # Spring Data JPA interfaces
        │   ├── security/                    # JWT filter, UserDetailsService
        │   ├── service/                     # Business logic layer
        │   ├── startup/                     # ApplicationRunner / startup tasks
        │   └── util/                        # Utility classes
        │
        ├── resources/
        │   └── application.properties       # All app configuration
        │
        └── webapp/                          # Frontend (bundled into WAR, served as static)
            ├── index.html                   # Main employee portal
            ├── kiosk.html                   # Kiosk controller (rotates Portal/Shoutouts/Gallery)
            ├── shoutouts-kiosk.html         # Shoutouts kiosk display
            ├── shoutouts.html               # Shoutouts portal page
            ├── gallery.html                 # Photo gallery kiosk
            ├── kiosk-open-positions.html    # Open positions kiosk
            ├── admin-login.html             # Admin sign-in
            ├── admin-panel.html             # Admin dashboard
            ├── admin-employees.html
            ├── admin-announcements.html
            ├── admin-holidays.html
            ├── admin-carousel.html
            ├── admin-gallery.html
            ├── admin-quick-links.html
            ├── admin-emergency.html
            ├── admin-work-anniversaries.html
            ├── admin-open-positions.html
            ├── admin-audit.html
            ├── admin-sidebar-template.html  # Shared sidebar partial
            ├── css/
            │   ├── styles.css               # Portal styles + TV mode
            │   └── admin-common.css         # Shared admin styles
            ├── js/
            │   ├── config.js                # API URL, environment config
            │   ├── app.js                   # Main portal logic, TV mode
            │   ├── admin-utils.js           # JWT helper, AdminAPI object
            │   ├── admin-employees.js
            │   ├── admin-announcements.js
            │   ├── admin-holidays.js
            │   ├── admin-carousel.js
            │   ├── admin-gallery.js
            │   ├── admin-quick-links.js
            │   ├── admin-emergency.js
            │   └── admin-audit.js
            ├── images/                      # Static assets (logos, placeholders)
            └── vendor/                      # Bundled third-party libraries
                ├── bootstrap/
                ├── bootstrap-icons/
                ├── fonts/
                └── jquery/
```

---

## Quick Start — Local Development

### Prerequisites

| Requirement | Minimum Version | Verify with |
|---|---|---|
| Java JDK | **17** | `java -version` |
| Maven | **3.6** | `mvn -version` |
| MySQL | **8.0** | `mysql --version` |

### Step 1 — Database Setup

```bash
# Log in to MySQL
mysql -u root -p

# Inside MySQL shell
CREATE DATABASE hr_intranet_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
EXIT;
```

Import the schema and seed data:

```bash
cd HRIntranet-Portal

for f in \
  hr_intranet_portal_employees \
  hr_intranet_portal_admin_users \
  hr_intranet_portal_announcements \
  hr_intranet_portal_holidays \
  hr_intranet_portal_carousel_slides \
  hr_intranet_portal_gallery_folders \
  hr_intranet_portal_gallery_images \
  hr_intranet_portal_images \
  hr_intranet_portal_quick_links \
  hr_intranet_portal_emergency_contacts \
  hr_intranet_portal_open_positions \
  hr_intranet_portal_shoutouts \
  hr_intranet_portal_audit_log \
  hr_intranet_portal_routines; do
  mysql -u root -p hr_intranet_portal < database/${f}.sql
done

mysql -u root -p hr_intranet_portal < database/create_open_positions_table.sql
```

### Step 2 — Configure Database Credentials

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 3 — Build

```bash
mvn clean package -DskipTests
```

Output: `target/ROOT.war`

### Step 4 — Run

```bash
# Option A — Maven dev mode (recommended, auto-restarts on class changes)
mvn spring-boot:run

# Option B — Run the WAR directly
java -jar target/ROOT.war

# Option C — Windows shortcut
start-app.bat
```

### Step 5 — Open in Browser

| Page | URL |
|---|---|
| **HR Portal** | http://localhost:8080 |
| **Admin Panel** | http://localhost:8080/admin-login.html |
| **TV Kiosk** | http://localhost:8080/kiosk.html |
| **Shoutouts** | http://localhost:8080/shoutouts.html |
| **Gallery** | http://localhost:8080/gallery.html |
| **API Health** | http://localhost:8080/api/public/health |

---

## Configuration

### Frontend — `src/main/webapp/js/config.js`

```javascript
const CONFIG = {
    // 'auto' detects localhost vs real domain automatically
    ENVIRONMENT: 'auto',

    // ⚠️  UPDATE THIS for production:
    PRODUCTION_API_URL: 'https://your-server.com/api',

    // Local development (auto-detected, no change needed):
    DEVELOPMENT_API_URL: 'http://localhost:8080/api',

    MAX_JOINERS: 6,           // New joiners shown on portal
    MAX_HOLIDAYS: 50,         // Upcoming holidays shown
    MAX_ANNOUNCEMENTS: 10,    // Announcements shown
    CAROUSEL_INTERVAL: 5000,  // Slide transition in ms
    NEW_JOINER_DAYS: 30,      // Days a joiner is considered "new"

    DEBUG: true   // Set to false in production
};
```

### Backend — `src/main/resources/application.properties`

```properties
# ── Server ──────────────────────────────────────────
server.port=8080

# ── Database ─────────────────────────────────────────
spring.datasource.url=jdbc:mysql://localhost:3306/hr_intranet_portal?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root

# ── File Uploads ──────────────────────────────────────
app.upload.dir=uploads/images
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# ── JWT (CHANGE THE SECRET IN PRODUCTION!) ───────────
app.jwt.secret=YourSuperSecretKeyForJWTTokenGenerationChangeThisInProduction123456789
app.jwt.expiration-ms=86400000   # Token valid for 24 hours

# ── CORS (update allowed origins for production) ──────
app.cors.allowed-origins=http://localhost:*,http://127.0.0.1:*,file://*
```

---

## Database Setup

**Database name:** `hr_intranet_portal`

| Table | Purpose |
|---|---|
| `employees` | Employee records, profile photos, department, dates |
| `admin_users` | Admin accounts with BCrypt-hashed passwords |
| `announcements` | Scheduled company announcements |
| `holidays` | Holiday calendar entries |
| `carousel_slides` | Homepage banner images with ordering |
| `gallery_folders` | Gallery albums/folders |
| `gallery_images` | Photos within gallery folders |
| `images` | General image store (employee photos, announcement images) |
| `quick_links` | Navigation shortcuts |
| `emergency_contacts` | Emergency contact directory |
| `open_positions` | Job postings |
| `shoutouts` | Peer recognition messages |
| `audit_log` | Admin action history |

---

## Admin Panel

### Default Login Credentials

> ⚠️ **Change the default password immediately after first setup!**

| Field | Value |
|---|---|
| URL | `http://localhost:8080/admin-login.html` |
| Username | `admin` |
| Password | `admin123` |

### Navigation

After login, use the left sidebar to access:

| Sidebar Item | URL |
|---|---|
| Dashboard | `/admin-panel.html` |
| Employees | `/admin-employees.html` |
| Announcements | `/admin-announcements.html` |
| Holidays | `/admin-holidays.html` |
| Carousel Slides | `/admin-carousel.html` |
| Gallery | `/admin-gallery.html` |
| Quick Links | `/admin-quick-links.html` |
| Emergency Contacts | `/admin-emergency.html` |
| Work Anniversaries | `/admin-work-anniversaries.html` |
| Open Positions | `/admin-open-positions.html` |
| Audit Logs | `/admin-audit.html` |

---

## Kiosk / TV Mode

### Open the Kiosk

```
http://localhost:8080/kiosk.html
```

### Automatic Rotation Cycle

The kiosk is **event-driven** — each screen plays to completion before moving on:

```
┌──────────────────────────────────────────────────────────────┐
│  PORTAL (TV Mode)                                            │
│  Carousel (all slides) → New Joiners → Holidays →            │
│  Announcements → Open Positions → [Upcoming Event]           │
│  ▶ Sends signal when ALL sections complete                   │
└───────────────────────────┬──────────────────────────────────┘
                            │  tv-cycle-complete (postMessage)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  SHOUTOUTS                                                   │
│  Every shoutout displayed (10s each)                         │
│  ▶ Sends signal when ALL shoutouts shown                     │
└───────────────────────────┬──────────────────────────────────┘
                            │  shoutouts-cycle-complete (postMessage)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  GALLERY                                                     │
│  Photo slideshow — 30 seconds fixed timer                    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                    (back to PORTAL)
```

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl+K` | Toggle the progress indicator pill |
| `Ctrl+N` | Skip immediately to the next screen |
| `Ctrl+R` | Restart the current screen's timer |
| `ESC` | Exit TV mode (when on the portal page) |
| `Ctrl+T` | Toggle TV mode on/off |

### TV Mode on the Portal

- Click the **TV** icon in the top navbar, or
- Navigate to `http://localhost:8080/index.html?tv=1`

---

## API Endpoints

### Public (No Authentication)

| Method | Path | Description |
|---|---|---|
| GET | `/api/public/health` | Health check |
| GET | `/api/public/portal-data` | Combined portal data |
| GET | `/api/public/employees` | Employee list |
| GET | `/api/public/announcements` | Active announcements |
| GET | `/api/public/holidays` | Holiday list |
| GET | `/api/public/carousel` | Carousel slides |
| GET | `/api/public/gallery/folders` | Gallery folders |
| GET | `/api/public/positions` | Open positions |
| GET | `/api/public/positions/all` | All positions (any status) |
| GET | `/api/public/shoutouts` | Shoutouts |
| GET | `/api/public/work-anniversaries/all` | Work anniversaries |

### Protected (JWT Bearer Token Required)

```
Authorization: Bearer <token>
```

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login → returns JWT |
| GET | `/api/admin/employees` | All employees |
| POST | `/api/admin/employees` | Create employee |
| PUT | `/api/admin/employees/{id}` | Update employee |
| DELETE | `/api/admin/employees/{id}` | Delete employee |
| GET | `/api/admin/announcements` | All announcements |
| POST | `/api/admin/announcements` | Create announcement |
| PUT | `/api/admin/announcements/{id}` | Update announcement |
| DELETE | `/api/admin/announcements/{id}` | Delete announcement |
| GET | `/api/admin/holidays` | All holidays |
| POST | `/api/admin/holidays` | Create holiday |
| PUT | `/api/admin/holidays/{id}` | Update holiday |
| DELETE | `/api/admin/holidays/{id}` | Delete holiday |
| GET | `/api/admin/carousel` | All carousel slides |
| POST | `/api/admin/carousel` | Upload carousel slide |
| DELETE | `/api/admin/carousel/{id}` | Delete slide |
| GET | `/api/admin/quick-links` | All quick links |
| GET | `/api/admin/emergency-contacts` | All emergency contacts |
| GET | `/api/admin/positions` | All positions (admin) |
| POST | `/api/admin/positions` | Create position |
| PUT | `/api/admin/positions/{id}` | Update position |
| DELETE | `/api/admin/positions/{id}` | Delete position |
| GET | `/api/admin/audit-logs` | Paginated audit log |
| POST | `/api/images/upload` | Upload image file |

---

## Troubleshooting

### Application won't start

```bash
# Is port 8080 already in use?
netstat -an | grep 8080         # Linux
netstat -ano | findstr :8080    # Windows

# Correct Java version?
java -version                   # Must show 17.x or higher

# MySQL running?
mysql -u root -p -e "SELECT 1"
```

### Database connection error

1. Verify MySQL is running
2. Confirm the database `hr_intranet_portal` exists:
   ```sql
   SHOW DATABASES;
   ```
3. Check `application.properties` username/password match

### Portal shows no data

```bash
# Test the backend directly
curl http://localhost:8080/api/public/health
```

Open browser DevTools → Console tab for CORS or API errors.
Make sure `PRODUCTION_API_URL` in `config.js` is correct if deployed.

### Image uploads fail

- Verify `uploads/images/` directory exists and is writable by the process user
- Check `app.upload.dir=uploads/images` in `application.properties`
- File must be under 10MB and an image type (JPG, PNG, GIF, WebP)

### Admin login rejected

- Default password: `admin123`
- If forgotten, reset via MySQL:
  ```sql
  -- BCrypt hash of 'admin123'
  UPDATE admin_users
  SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH'
  WHERE username = 'admin';
  ```

---

## Linux Deployment

For full step-by-step instructions to deploy on Ubuntu / CentOS / RHEL, see:

📄 **[DEPLOY-LINUX.md](DEPLOY-LINUX.md)**

Topics covered:
- Java 17 & Maven installation
- MySQL 8.0 setup and hardening
- Building `ROOT.war`
- Apache Tomcat 10 deployment
- Nginx reverse proxy + HTTPS (Let's Encrypt)
- Systemd service for auto-start on boot
- Firewall (ufw / firewalld) configuration
- Maintenance — logs, restart, update procedure

---

## Development Notes

### When is a rebuild needed?

| Change | Rebuild? |
|---|---|
| `src/main/webapp/` — HTML, CSS, JS | ❌ No — just refresh browser (`Ctrl+F5`) |
| `src/main/java/` — Java source | ✅ Yes — `mvn spring-boot:run` or `mvn package` |
| `src/main/resources/application.properties` | ✅ Yes — restart required |
| `pom.xml` — dependencies | ✅ Yes — full `mvn clean package` |

### Adding a New Feature

1. **Entity** → `entity/` (JPA mapped to DB table)
2. **Repository** → `repository/` (Spring Data interface)
3. **Service** → `service/` (business logic)
4. **Controller** → `controller/` (REST endpoints)
5. **Frontend** → update `js/app.js`, add admin HTML/JS as needed
6. **Database** → add SQL script to `database/`

---

## Deployment Scripts

All scripts live in the `scripts/` folder:

| Script | Where to run | Purpose |
|---|---|---|
| `git-clone-and-run.sh` | Linux (dev/staging) | Clone repo from Git and run locally |
| `deploy-to-server.sh` | Your local machine (Linux/Mac/Git Bash) | Build WAR locally → push & restart on server |
| `deploy-to-server.bat` | Your local machine (Windows CMD) | Same as above, but for Windows |
| `server-update.sh` | On the production server | Pull latest Git code, rebuild, and redeploy |

### Quick usage

```bash
# From a fresh Linux machine — clone and run
bash scripts/git-clone-and-run.sh --repo https://github.com/YOUR_ORG/HRIntranet-Portal.git --branch main

# Deploy from your local machine (Linux/Git Bash)
cd HRIntranet-Portal
bash scripts/deploy-to-server.sh --host 192.168.1.100 --user ubuntu

# Deploy from your local machine (Windows)
scripts\deploy-to-server.bat   # (edit SERVER_HOST inside the file first)

# Update directly on the server
sudo bash /opt/hrintranet/app/scripts/server-update.sh --branch main
```

> See `DEPLOY-LINUX.md` for the full step-by-step production setup guide.

---

## License

Internal use only — IEEE HR Department. Not for public distribution.

## Support

Contact the development team for technical issues or feature requests.

---

*Last updated: March 2026 · IEEE HR Intranet Portal v1.0.0*
