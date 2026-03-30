# IEEE HR Intranet Portal — Linux Server Deployment Guide

> **Target environments:** Ubuntu 22.04 LTS / Ubuntu 20.04 LTS / CentOS 8+ / RHEL 8+  
> **Application:** IEEE HR Intranet Portal v1.0.0  
> **Architecture:** Spring Boot WAR → Tomcat 10 → Nginx (reverse proxy) → HTTPS  
> **Last updated:** March 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Server Sizing](#2-prerequisites--server-sizing)
3. [Step 1 — Initial Server Setup](#step-1--initial-server-setup)
4. [Step 2 — Install Java 17](#step-2--install-java-17)
5. [Step 3 — Install Maven (Build Only)](#step-3--install-maven-build-only)
6. [Step 4 — Install & Secure MySQL 8.0](#step-4--install--secure-mysql-80)
7. [Step 5 — Create the Database](#step-5--create-the-database)
8. [Step 6 — Build the WAR File](#step-6--build-the-war-file)
9. [Step 7 — Install Apache Tomcat 10](#step-7--install-apache-tomcat-10)
10. [Step 8 — Deploy the Application](#step-8--deploy-the-application)
11. [Step 9 — Configure the Application](#step-9--configure-the-application)
12. [Step 10 — Create Systemd Service](#step-10--create-systemd-service)
13. [Step 11 — Install & Configure Nginx](#step-11--install--configure-nginx)
14. [Step 12 — Enable HTTPS with Let's Encrypt](#step-12--enable-https-with-lets-encrypt)
15. [Step 13 — Configure Firewall](#step-13--configure-firewall)
16. [Step 14 — Final Verification](#step-14--final-verification)
17. [Post-Deployment Maintenance](#post-deployment-maintenance)
18. [Updating the Application](#updating-the-application)
19. [Backup & Recovery](#backup--recovery)
20. [Troubleshooting](#troubleshooting)

---

## 1. Architecture Overview

```
Internet / Internal Network
        │
        ▼
  ┌──────────────┐
  │    Nginx     │  Port 80 (HTTP → redirect to HTTPS)
  │  Reverse     │  Port 443 (HTTPS)
  │   Proxy      │
  └──────┬───────┘
         │  proxy_pass http://127.0.0.1:8080
         ▼
  ┌──────────────┐
  │   Tomcat 10  │  Port 8080 (internal only)
  │  ROOT.war    │  Serves: API + Frontend (HTML/CSS/JS)
  └──────┬───────┘
         │  JDBC
         ▼
  ┌──────────────┐
  │  MySQL 8.0   │  Port 3306 (localhost only)
  │ hr_intranet  │
  └──────────────┘
```

**Key points:**
- Tomcat is bound to `127.0.0.1:8080` — not exposed to the internet directly
- Nginx handles SSL termination, compression, and caching
- MySQL only listens on `localhost`
- A dedicated system user (`tomcat`) runs the application

---

## 2. Prerequisites & Server Sizing

### Minimum Server Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPUs | 4 vCPUs |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 50 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Required Software

| Software | Version | Notes |
|---|---|---|
| Java JDK | **17** (LTS) | OpenJDK or Eclipse Temurin |
| MySQL | **8.0** | MariaDB is not tested |
| Apache Tomcat | **10.1.x** | Matches Spring Boot 3.x |
| Nginx | Latest stable | Reverse proxy + HTTPS |
| Certbot | Latest | Let's Encrypt SSL |
| Maven | **3.6+** | Only needed on build machine |

### Assumptions

- You have SSH access with `sudo` privileges
- A domain name (e.g., `hr.yourcompany.com`) is pointed at this server's IP
- Ports 22, 80, and 443 are reachable from your network

---

## Step 1 — Initial Server Setup

### 1.1 Update the system

```bash
sudo apt update && sudo apt upgrade -y
# For CentOS/RHEL:
# sudo dnf update -y
```

### 1.2 Install essential utilities

```bash
sudo apt install -y curl wget unzip git nano ufw
# For CentOS/RHEL:
# sudo dnf install -y curl wget unzip git nano firewalld
```

### 1.3 Create a dedicated application user

Running the application as `root` is a security risk. Create a dedicated user:

```bash
sudo useradd -m -d /opt/hrintranet -s /bin/bash hrintranet
sudo passwd hrintranet          # Set a strong password
```

---

## Step 2 — Install Java 17

### Ubuntu 22.04

```bash
sudo apt install -y openjdk-17-jdk
```

### Ubuntu 20.04 (if openjdk-17 is not available)

```bash
sudo add-apt-repository ppa:linuxuprising/java -y
sudo apt update
sudo apt install -y openjdk-17-jdk
```

### CentOS / RHEL 8+

```bash
sudo dnf install -y java-17-openjdk-devel
```

### Verify installation

```bash
java -version
# Expected output:
# openjdk version "17.x.x" ...
```

### Set JAVA_HOME system-wide

```bash
# Find the JDK location
sudo update-alternatives --config java

# Add to /etc/environment
echo 'JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' | sudo tee -a /etc/environment
echo 'PATH=$PATH:$JAVA_HOME/bin' | sudo tee -a /etc/environment
source /etc/environment

# Verify
echo $JAVA_HOME
```

> **CentOS:** The JDK path is typically `/usr/lib/jvm/java-17-openjdk`

---

## Step 3 — Install Maven (Build Only)

> **Skip this step if you are building the WAR on your local Windows machine and only transferring the `ROOT.war` file to the server.**  
> Maven is only needed if you plan to build directly on the server.

```bash
sudo apt install -y maven

# Verify
mvn -version
# Expected: Apache Maven 3.x.x
```

---

## Step 4 — Install & Secure MySQL 8.0

### 4.1 Install MySQL

**Ubuntu:**

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**CentOS / RHEL:**

```bash
sudo dnf install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Get the temporary root password
sudo grep 'temporary password' /var/log/mysqld.log
```

### 4.2 Run the security script

```bash
sudo mysql_secure_installation
```

Answer the prompts:

| Prompt | Recommended answer |
|---|---|
| VALIDATE PASSWORD component? | Yes |
| Password strength level | 2 (Strong) |
| Change the root password? | Yes — set a strong password |
| Remove anonymous users? | Yes |
| Disallow root login remotely? | Yes |
| Remove test database? | Yes |
| Reload privilege tables? | Yes |

### 4.3 Create an application database user

Log in as root:

```bash
sudo mysql -u root -p
```

Inside the MySQL shell:

```sql
-- Create the application database
CREATE DATABASE hr_intranet_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create a dedicated application user (do NOT use root in production)
CREATE USER 'hrportal'@'localhost' IDENTIFIED BY 'StrongPassword123!';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER
  ON hr_intranet_portal.*
  TO 'hrportal'@'localhost';

FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'hrportal'@'localhost';
EXIT;
```

> **Save these credentials** — you will need them for `application.properties`:
> - **Username:** `hrportal`
> - **Password:** `StrongPassword123!` (use your actual strong password)

---

## Step 5 — Create the Database Schema

### 5.1 Transfer the database scripts to the server

From your local Windows machine:

```powershell
# Using SCP (run this in PowerShell on your local machine)
scp -r C:\Users\rdaivam\IdeaProjects\HRIntranet-Portal\database\* youruser@your-server-ip:/tmp/dbscripts/
```

Or use WinSCP / FileZilla to upload the `database/` folder to `/tmp/dbscripts/`.

### 5.2 Import the schema in order

```bash
cd /tmp/dbscripts

mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_employees.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_admin_users.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_announcements.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_holidays.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_carousel_slides.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_gallery_folders.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_gallery_images.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_images.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_quick_links.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_emergency_contacts.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_open_positions.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_shoutouts.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_audit_log.sql
mysql -u hrportal -p hr_intranet_portal < hr_intranet_portal_routines.sql
mysql -u hrportal -p hr_intranet_portal < create_open_positions_table.sql
```

### 5.3 Verify the schema

```bash
mysql -u hrportal -p hr_intranet_portal -e "SHOW TABLES;"
```

You should see all tables listed (employees, admin_users, announcements, etc.)

---

## Step 6 — Build the WAR File

> **Option A — Build on your local machine (recommended)**  
> **Option B — Build directly on the server**

### Option A: Build on Windows (Recommended)

On your local machine:

```powershell
cd C:\Users\rdaivam\IdeaProjects\HRIntranet-Portal

# Build the WAR
mvn clean package -DskipTests

# The WAR is at:
# target\ROOT.war
```

Then transfer it to the server:

```powershell
scp target\ROOT.war youruser@your-server-ip:/tmp/ROOT.war
```

### Option B: Build on the Linux Server

```bash
# Clone or upload the project source to the server
cd /opt/hrintranet

# If using git:
git clone <repository-url> app
cd app

# Or upload via SCP then:
cd /tmp/HRIntranet-Portal

# Build
mvn clean package -DskipTests

# WAR location
ls -lh target/ROOT.war
```

---

## Step 7 — Install Apache Tomcat 10

### 7.1 Download Tomcat 10.1

```bash
cd /tmp
TOMCAT_VERSION="10.1.20"
wget https://downloads.apache.org/tomcat/tomcat-10/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz

# Verify the download (optional but recommended)
# Check https://downloads.apache.org/tomcat/ for the latest 10.1.x version
```

### 7.2 Install Tomcat

```bash
sudo mkdir -p /opt/tomcat
sudo tar xzf /tmp/apache-tomcat-${TOMCAT_VERSION}.tar.gz -C /opt/tomcat --strip-components=1

# Verify
ls /opt/tomcat
# Should show: bin  conf  lib  logs  temp  webapps  work
```

### 7.3 Set ownership

```bash
sudo chown -R hrintranet:hrintranet /opt/tomcat
sudo chmod -R 750 /opt/tomcat
sudo chmod +x /opt/tomcat/bin/*.sh
```

### 7.4 Create uploads directory

```bash
sudo mkdir -p /opt/tomcat/uploads/images
sudo chown -R hrintranet:hrintranet /opt/tomcat/uploads
sudo chmod 755 /opt/tomcat/uploads/images
```

### 7.5 Configure Tomcat to bind to localhost only

Edit `/opt/tomcat/conf/server.xml`:

```bash
sudo nano /opt/tomcat/conf/server.xml
```

Find the Connector on port 8080 and add `address="127.0.0.1"`:

```xml
<!-- Change this line: -->
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443"
           maxParameterCount="1000" />

<!-- To this (adds address attribute): -->
<Connector port="8080" protocol="HTTP/1.1"
           address="127.0.0.1"
           connectionTimeout="20000"
           redirectPort="8443"
           maxParameterCount="1000" />
```

### 7.6 Remove the default Tomcat web apps (optional but recommended)

```bash
sudo rm -rf /opt/tomcat/webapps/ROOT
sudo rm -rf /opt/tomcat/webapps/docs
sudo rm -rf /opt/tomcat/webapps/examples
sudo rm -rf /opt/tomcat/webapps/host-manager
sudo rm -rf /opt/tomcat/webapps/manager
```

---

## Step 8 — Deploy the Application

### 8.1 Copy the WAR file to Tomcat's webapps

```bash
sudo cp /tmp/ROOT.war /opt/tomcat/webapps/ROOT.war
sudo chown hrintranet:hrintranet /opt/tomcat/webapps/ROOT.war
```

Tomcat will automatically extract `ROOT.war` to `webapps/ROOT/` when it starts, making the app available at the server root (`/`).

---

## Step 9 — Configure the Application

### 9.1 Wait for Tomcat to extract the WAR

Start Tomcat temporarily to let it extract the WAR:

```bash
sudo -u hrintranet /opt/tomcat/bin/startup.sh
sleep 10
sudo -u hrintranet /opt/tomcat/bin/shutdown.sh
sleep 5
```

The app is now extracted to `/opt/tomcat/webapps/ROOT/`.

### 9.2 Edit the production configuration

```bash
sudo nano /opt/tomcat/webapps/ROOT/WEB-INF/classes/application.properties
```

Update these values for production:

```properties
# ============================================
# PRODUCTION CONFIGURATION
# ============================================

# Server
server.port=8080

# Database — use the dedicated DB user created in Step 4
spring.datasource.url=jdbc:mysql://localhost:3306/hr_intranet_portal?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=hrportal
spring.datasource.password=StrongPassword123!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# Logging — reduce verbosity in production
logging.level.root=WARN
logging.level.com.company.hrintranet=INFO
logging.level.org.springframework.web=WARN
logging.level.org.hibernate.SQL=WARN

# File Uploads — store in a persistent directory outside the WAR
app.upload.dir=/opt/tomcat/uploads/images
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# JWT — CHANGE THIS SECRET! Generate a strong random string.
app.jwt.secret=ChangeThisToAStrongRandomSecretKeyAtLeast64CharactersLong!IEEE2026Portal
app.jwt.expiration-ms=86400000

# CORS — restrict to your actual domain in production
app.cors.allowed-origins=https://hr.yourcompany.com,https://www.yourcompany.com
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
app.cors.allowed-headers=*
app.cors.allow-credentials=true

# Date Format
spring.jackson.date-format=yyyy-MM-dd
spring.jackson.time-zone=UTC
spring.jackson.serialization.write-dates-as-timestamps=false
```

> **Important security checklist:**
> - ✅ Change `spring.datasource.password` to your MySQL password
> - ✅ Change `app.jwt.secret` to a long random string
> - ✅ Update `app.cors.allowed-origins` to your actual domain
> - ✅ Set `spring.jpa.show-sql=false` (prevents SQL in logs)

### 9.3 Update the frontend API URL

Edit the JavaScript config to point to your production domain:

```bash
sudo nano /opt/tomcat/webapps/ROOT/js/config.js
```

Find and update `PRODUCTION_API_URL`:

```javascript
PRODUCTION_API_URL: 'https://hr.yourcompany.com/api',
```

Also set `DEBUG: false` for production:

```javascript
DEBUG: false
```

Save and close.

---

## Step 10 — Create Systemd Service

A systemd service ensures Tomcat starts automatically on boot and restarts on failure.

### 10.1 Find the Java executable path

```bash
which java
# Example output: /usr/bin/java

readlink -f $(which java)
# Example output: /usr/lib/jvm/java-17-openjdk-amd64/bin/java
```

### 10.2 Create the service file

```bash
sudo nano /etc/systemd/system/hrintranet.service
```

Paste the following (adjust paths if needed):

```ini
[Unit]
Description=IEEE HR Intranet Portal (Tomcat 10)
Documentation=https://github.com/your-org/HRIntranet-Portal
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=forking

# Run as the dedicated application user
User=hrintranet
Group=hrintranet

# Tomcat environment
Environment="JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
Environment="CATALINA_HOME=/opt/tomcat"
Environment="CATALINA_BASE=/opt/tomcat"
Environment="CATALINA_PID=/opt/tomcat/temp/tomcat.pid"
Environment="CATALINA_OPTS=-Xms512M -Xmx1024M -server -XX:+UseParallelGC"
Environment="JAVA_OPTS=-Djava.awt.headless=true -Djava.security.egd=file:/dev/./urandom"

# Start / Stop / Status scripts
ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh

# Auto-restart on failure
Restart=on-failure
RestartSec=10

# Security hardening
PrivateTmp=true
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

### 10.3 Enable and start the service

```bash
# Reload systemd to pick up the new service file
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable hrintranet

# Start the service now
sudo systemctl start hrintranet

# Check status
sudo systemctl status hrintranet
```

Expected output:

```
● hrintranet.service - IEEE HR Intranet Portal (Tomcat 10)
     Loaded: loaded (/etc/systemd/system/hrintranet.service; enabled; ...)
     Active: active (running) since ...
```

### 10.4 Verify the application is running

```bash
# Check Tomcat logs
sudo -u hrintranet tail -f /opt/tomcat/logs/catalina.out

# Wait for this line:
# INFO: Server startup in [XXXX] milliseconds
# Then press Ctrl+C to stop tailing

# Test the API
curl http://localhost:8080/api/public/health
# Expected: {"status":"UP"} or similar JSON
```

---

## Step 11 — Install & Configure Nginx

Nginx acts as a reverse proxy: it receives external HTTP/HTTPS traffic and forwards it to Tomcat.

### 11.1 Install Nginx

**Ubuntu:**

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**CentOS / RHEL:**

```bash
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 11.2 Create the Nginx site configuration

```bash
sudo nano /etc/nginx/sites-available/hrintranet
```

> **CentOS:** Create the file at `/etc/nginx/conf.d/hrintranet.conf` instead.

Paste this configuration (replace `hr.yourcompany.com` with your actual domain):

```nginx
# ============================================================
# IEEE HR Intranet Portal — Nginx Configuration
# ============================================================

# Redirect all HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name hr.yourcompany.com;

    # Let's Encrypt challenge path (for cert renewal)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect everything else to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# Main HTTPS server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name hr.yourcompany.com;

    # SSL certificates (will be filled in by Certbot — Step 12)
    ssl_certificate     /etc/letsencrypt/live/hr.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hr.yourcompany.com/privkey.pem;

    # SSL hardening
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/hrintranet_access.log;
    error_log  /var/log/nginx/hrintranet_error.log;

    # Proxy settings
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
    proxy_connect_timeout 10s;

    # Upload size limit (match Spring Boot setting)
    client_max_body_size 15M;

    # ── Cache static assets ──────────────────────────────
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:8080;
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # ── Proxy all requests to Tomcat ─────────────────────
    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

### 11.3 Enable the site (Ubuntu only)

```bash
sudo ln -s /etc/nginx/sites-available/hrintranet /etc/nginx/sites-enabled/

# Disable the default site
sudo rm -f /etc/nginx/sites-enabled/default
```

### 11.4 Test the Nginx configuration

```bash
sudo nginx -t
# Expected: configuration file /etc/nginx/nginx.conf syntax is ok
#           configuration file /etc/nginx/nginx.conf test is successful
```

### 11.5 Temporarily start with HTTP only

Before obtaining SSL certificates, comment out the SSL lines so Nginx starts:

```bash
sudo nano /etc/nginx/sites-available/hrintranet
```

In the `server { listen 443... }` block, temporarily comment out the `ssl_certificate` lines:

```nginx
# ssl_certificate     ...
# ssl_certificate_key ...
```

Then reload Nginx:

```bash
sudo systemctl reload nginx
```

---

## Step 12 — Enable HTTPS with Let's Encrypt

### 12.1 Install Certbot

**Ubuntu:**

```bash
sudo apt install -y certbot python3-certbot-nginx
```

**CentOS / RHEL:**

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

### 12.2 Obtain an SSL certificate

```bash
sudo certbot --nginx -d hr.yourcompany.com
```

Follow the prompts:

1. Enter your email address for renewal notifications
2. Agree to the Terms of Service
3. Choose whether to share email with EFF (optional)
4. Certbot will automatically configure Nginx for HTTPS

### 12.3 Verify automatic renewal

Certbot installs a cron job / systemd timer for auto-renewal. Test it:

```bash
sudo certbot renew --dry-run
# Expected: Congratulations, all simulated renewals succeeded
```

### 12.4 Restore the full Nginx config

After Certbot runs, your Nginx config will have SSL filled in automatically.
Verify the full config is correct:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 13 — Configure Firewall

### Ubuntu — using `ufw`

```bash
# Allow SSH (important — do this FIRST or you'll lock yourself out)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to Tomcat (8080) from outside — Nginx handles it
# (8080 is already bound to 127.0.0.1 so external access is blocked anyway)

# Block MySQL from outside
# (MySQL is already localhost-only, but just in case:)
sudo ufw deny 3306/tcp

# Enable the firewall
sudo ufw enable

# Verify rules
sudo ufw status verbose
```

### CentOS / RHEL — using `firewalld`

```bash
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow SSH, HTTP, HTTPS
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Block Tomcat direct access
sudo firewall-cmd --permanent --remove-port=8080/tcp

# Apply
sudo firewall-cmd --reload
sudo firewall-cmd --list-all
```

---

## Step 14 — Final Verification

### 14.1 Check all services are running

```bash
sudo systemctl status hrintranet    # Tomcat
sudo systemctl status nginx         # Nginx
sudo systemctl status mysql         # MySQL
```

All three should show `Active: active (running)`.

### 14.2 Test the application

```bash
# Test via localhost (Tomcat direct)
curl -I http://localhost:8080/api/public/health

# Test via Nginx HTTP (should redirect to HTTPS)
curl -I http://hr.yourcompany.com

# Test via Nginx HTTPS
curl -I https://hr.yourcompany.com

# Test API through Nginx
curl https://hr.yourcompany.com/api/public/health
```

### 14.3 Test in a browser

Open these URLs in a browser:

| URL | Expected Result |
|---|---|
| `https://hr.yourcompany.com` | HR Portal loads with padlock icon |
| `https://hr.yourcompany.com/admin-login.html` | Admin login page |
| `https://hr.yourcompany.com/kiosk.html` | Kiosk display |
| `https://hr.yourcompany.com/api/public/health` | JSON health response |

### 14.4 Test admin login

1. Go to `https://hr.yourcompany.com/admin-login.html`
2. Username: `admin` | Password: `admin123`
3. ✅ Immediately change the password after login!

---

## Post-Deployment Maintenance

### Viewing Logs

```bash
# Tomcat application log (main log)
sudo -u hrintranet tail -f /opt/tomcat/logs/catalina.out

# Tomcat access log
sudo -u hrintranet tail -f /opt/tomcat/logs/localhost_access_log.$(date +%Y-%m-%d).txt

# Nginx access log
sudo tail -f /var/log/nginx/hrintranet_access.log

# Nginx error log
sudo tail -f /var/log/nginx/hrintranet_error.log

# MySQL log
sudo tail -f /var/log/mysql/error.log
```

### Start / Stop / Restart

```bash
# Restart the application (Tomcat)
sudo systemctl restart hrintranet

# Reload Nginx (without downtime)
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Restart MySQL
sudo systemctl restart mysql
```

### Check service boot status

```bash
sudo systemctl is-enabled hrintranet    # Should print: enabled
sudo systemctl is-enabled nginx         # Should print: enabled
sudo systemctl is-enabled mysql         # Should print: enabled
```

---

## Updating the Application

Follow these steps whenever you deploy a new version:

### Step 1 — Build the new WAR on your local machine

```powershell
# On Windows
cd C:\Users\rdaivam\IdeaProjects\HRIntranet-Portal
mvn clean package -DskipTests
```

### Step 2 — Transfer the new WAR to the server

```powershell
scp target\ROOT.war youruser@your-server-ip:/tmp/ROOT.war
```

### Step 3 — Deploy the new WAR

```bash
# Stop the application
sudo systemctl stop hrintranet

# Backup the old deployment (optional but recommended)
sudo mv /opt/tomcat/webapps/ROOT /opt/tomcat/webapps/ROOT.backup.$(date +%Y%m%d_%H%M%S)
sudo mv /opt/tomcat/webapps/ROOT.war /opt/tomcat/webapps/ROOT.war.bak

# Deploy the new WAR
sudo cp /tmp/ROOT.war /opt/tomcat/webapps/ROOT.war
sudo chown hrintranet:hrintranet /opt/tomcat/webapps/ROOT.war

# Start the application (Tomcat will auto-extract the WAR)
sudo systemctl start hrintranet

# Watch the startup log
sudo -u hrintranet tail -f /opt/tomcat/logs/catalina.out
# Wait for: INFO: Server startup in [XXXX] milliseconds
```

### Step 4 — Update production config (if needed)

After the new WAR is extracted:

```bash
sudo nano /opt/tomcat/webapps/ROOT/WEB-INF/classes/application.properties
sudo nano /opt/tomcat/webapps/ROOT/js/config.js
```

Restart if config changed:

```bash
sudo systemctl restart hrintranet
```

### Step 5 — Verify

```bash
curl https://hr.yourcompany.com/api/public/health
```

### Step 6 — Clean up old backups

```bash
# Remove backups older than 7 days
sudo find /opt/tomcat/webapps -name "ROOT.backup.*" -mtime +7 -exec rm -rf {} +
```

---

## Backup & Recovery

### Database Backup

Set up an automated daily backup:

```bash
sudo nano /opt/hrintranet/backup-db.sh
```

```bash
#!/bin/bash
# Daily MySQL backup script for IEEE HR Portal

BACKUP_DIR="/opt/hrintranet/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="hr_intranet_portal"
DB_USER="hrportal"
DB_PASS="StrongPassword123!"    # Or use ~/.my.cnf for security

mkdir -p "$BACKUP_DIR"

mysqldump \
  --user="$DB_USER" \
  --password="$DB_PASS" \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" | gzip > "$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# Delete backups older than 30 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "[$(date)] Backup completed: ${DB_NAME}_${DATE}.sql.gz"
```

```bash
sudo chmod +x /opt/hrintranet/backup-db.sh
sudo chown hrintranet:hrintranet /opt/hrintranet/backup-db.sh

# Schedule daily at 2 AM
(sudo crontab -u hrintranet -l 2>/dev/null; echo "0 2 * * * /opt/hrintranet/backup-db.sh >> /opt/hrintranet/backup.log 2>&1") | sudo crontab -u hrintranet -
```

### Restore a Database Backup

```bash
# Decompress and restore
gunzip < /opt/hrintranet/backups/mysql/hr_intranet_portal_20260101_020000.sql.gz \
  | mysql -u hrportal -p hr_intranet_portal
```

### Backup Uploaded Images

```bash
# Back up user-uploaded files
tar czf /opt/hrintranet/backups/uploads_$(date +%Y%m%d).tar.gz \
  /opt/tomcat/uploads/
```

---

## Troubleshooting

### Application does not start

```bash
# Check the full startup log
sudo -u hrintranet cat /opt/tomcat/logs/catalina.out | tail -100

# Check systemd journal
sudo journalctl -u hrintranet -n 100 --no-pager

# Common causes:
# - Wrong Java version (must be 17)
# - MySQL not running
# - Wrong database credentials in application.properties
# - Port 8080 already in use
```

### Port 8080 already in use

```bash
sudo ss -tlnp | grep 8080
# Kill the conflicting process:
sudo kill -9 <PID>
```

### MySQL connection refused

```bash
sudo systemctl status mysql
sudo journalctl -u mysql -n 50

# Try connecting manually:
mysql -u hrportal -p hr_intranet_portal -e "SELECT 1"
```

### Nginx 502 Bad Gateway

Nginx cannot reach Tomcat. Check:

```bash
# Is Tomcat running?
sudo systemctl status hrintranet

# Is it listening on 8080?
sudo ss -tlnp | grep 8080

# Test Tomcat directly:
curl http://127.0.0.1:8080/api/public/health
```

### SSL certificate error

```bash
# Check certificate expiry
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t
```

### Images not loading after deployment

The upload directory must be persistent across deployments:

```bash
# Verify the upload dir is correct in application.properties
grep app.upload.dir /opt/tomcat/webapps/ROOT/WEB-INF/classes/application.properties
# Should be: app.upload.dir=/opt/tomcat/uploads/images

# Check permissions
ls -la /opt/tomcat/uploads/images
# Should be owned by hrintranet:hrintranet
```

### Admin login fails

```bash
# Verify the admin user exists
mysql -u hrportal -p hr_intranet_portal -e "SELECT username, role FROM admin_users;"

# Reset admin password (BCrypt hash of 'admin123')
mysql -u hrportal -p hr_intranet_portal -e \
  "UPDATE admin_users SET password = '\$2a\$10\$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH' WHERE username = 'admin';"
```

### Out of memory errors

Edit the JVM options in the systemd service file:

```bash
sudo nano /etc/systemd/system/hrintranet.service
```

Increase the heap size:

```ini
Environment="CATALINA_OPTS=-Xms512M -Xmx2048M -server -XX:+UseG1GC"
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart hrintranet
```

---

## Quick Reference Card

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 IEEE HR INTRANET PORTAL — SERVER QUICK REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Tomcat home:   /opt/tomcat/
 App deployed:  /opt/tomcat/webapps/ROOT/
 App config:    /opt/tomcat/webapps/ROOT/WEB-INF/classes/application.properties
 JS config:     /opt/tomcat/webapps/ROOT/js/config.js
 Uploads:       /opt/tomcat/uploads/images/
 Tomcat logs:   /opt/tomcat/logs/catalina.out

 DB name:       hr_intranet_portal
 DB user:       hrportal
 DB host:       localhost:3306

 Nginx config:  /etc/nginx/sites-available/hrintranet
 Nginx logs:    /var/log/nginx/hrintranet_*.log

 Service name:  hrintranet
 Run as user:   hrintranet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 COMMON COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Start app:     sudo systemctl start hrintranet
 Stop app:      sudo systemctl stop hrintranet
 Restart app:   sudo systemctl restart hrintranet
 App status:    sudo systemctl status hrintranet
 App logs:      sudo tail -f /opt/tomcat/logs/catalina.out

 Reload Nginx:  sudo systemctl reload nginx
 Nginx test:    sudo nginx -t

 DB connect:    mysql -u hrportal -p hr_intranet_portal
 DB backup:     /opt/hrintranet/backup-db.sh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

*Last updated: March 2026 · IEEE HR Department*

