#!/bin/bash

# Setup Monitoring and Automation on VPS
# VPS上でのモニタリングと自動化設定

set -e

PROJECT_DIR="/home/nakayama/uch"
SCRIPTS_DIR="$PROJECT_DIR/scripts"
MONITORING_DIR="$PROJECT_DIR/monitoring"
LOG_DIR="/var/log/uch"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

setup_directories() {
    log "Setting up directories..."
    
    sudo mkdir -p "$LOG_DIR"
    sudo mkdir -p "/home/nakayama/backups"
    sudo chown nakayama:nakayama "/home/nakayama/backups"
    sudo chmod 755 "/home/nakayama/backups"
    
    mkdir -p "$SCRIPTS_DIR"
    mkdir -p "$MONITORING_DIR"
    
    log "✅ Directories created"
}

setup_scripts_permissions() {
    log "Setting up script permissions..."
    
    chmod +x "$SCRIPTS_DIR"/*.sh 2>/dev/null || true
    chmod +x "$MONITORING_DIR"/*.sh 2>/dev/null || true
    
    log "✅ Script permissions set"
}

setup_logrotate() {
    log "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/uch << EOF
$LOG_DIR/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 nakayama nakayama
    postrotate
        # Restart any services if needed
        /bin/systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}

/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF
    
    log "✅ Log rotation configured"
}

setup_cron_jobs() {
    log "Setting up cron jobs..."
    
    # Create temporary cron file
    crontab -l > /tmp/current_cron 2>/dev/null || touch /tmp/current_cron
    
    # Remove existing uch-related cron jobs
    grep -v "uch" /tmp/current_cron > /tmp/new_cron || touch /tmp/new_cron
    
    # Add new cron jobs
    cat >> /tmp/new_cron << EOF

# uch Application Monitoring and Maintenance
# Health check every 5 minutes
*/5 * * * * $MONITORING_DIR/health-check.sh >> $LOG_DIR/health-check.log 2>&1

# Full backup daily at 2:00 AM
0 2 * * * $SCRIPTS_DIR/backup.sh >> $LOG_DIR/backup.log 2>&1

# Docker cleanup weekly on Sunday at 3:00 AM
0 3 * * 0 docker system prune -f && docker image prune -f >> $LOG_DIR/cleanup.log 2>&1

# SSL certificate renewal check monthly
0 4 1 * * certbot renew --nginx --quiet >> $LOG_DIR/ssl-renewal.log 2>&1

# System updates check weekly on Monday at 1:00 AM
0 1 * * 1 apt update && apt list --upgradable >> $LOG_DIR/updates.log 2>&1
EOF
    
    # Install new cron jobs
    crontab /tmp/new_cron
    rm /tmp/current_cron /tmp/new_cron
    
    log "✅ Cron jobs configured"
}

setup_systemd_service() {
    log "Setting up systemd service for application monitoring..."
    
    sudo tee /etc/systemd/system/uch-monitor.service << EOF
[Unit]
Description=uch Application Monitor
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=nakayama
WorkingDirectory=$PROJECT_DIR
ExecStart=$MONITORING_DIR/health-check.sh
StandardOutput=append:$LOG_DIR/systemd-monitor.log
StandardError=append:$LOG_DIR/systemd-monitor.log

[Install]
WantedBy=multi-user.target
EOF

    sudo tee /etc/systemd/system/uch-monitor.timer << EOF
[Unit]
Description=Run uch monitor every 5 minutes
Requires=uch-monitor.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable uch-monitor.timer
    sudo systemctl start uch-monitor.timer
    
    log "✅ Systemd service configured"
}

setup_fail2ban() {
    log "Setting up fail2ban for enhanced security..."
    
    # Install fail2ban if not present
    if ! command -v fail2ban-server &> /dev/null; then
        sudo apt update
        sudo apt install -y fail2ban
    fi
    
    # Configure fail2ban for SSH
    sudo tee /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF
    
    sudo systemctl enable fail2ban
    sudo systemctl restart fail2ban
    
    log "✅ fail2ban configured"
}

setup_firewall() {
    log "Setting up UFW firewall..."
    
    # Enable UFW if not already enabled
    sudo ufw --force enable
    
    # Default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH (be careful with this!)
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Allow only local access to database and app ports
    sudo ufw deny 3000
    sudo ufw deny 5432
    
    log "✅ Firewall configured"
}

install_monitoring_tools() {
    log "Installing monitoring tools..."
    
    # Update package list
    sudo apt update
    
    # Install useful monitoring tools
    sudo apt install -y \
        htop \
        iotop \
        nethogs \
        ncdu \
        tree \
        jq \
        curl \
        wget \
        unzip \
        rsync
    
    # Install docker-compose if not present
    if ! command -v docker-compose &> /dev/null; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    log "✅ Monitoring tools installed"
}

create_monitoring_dashboard() {
    log "Creating monitoring dashboard script..."
    
    cat > "$SCRIPTS_DIR/dashboard.sh" << 'EOF'
#!/bin/bash

# Simple monitoring dashboard
clear
echo "==================================="
echo "    uch Application Dashboard"
echo "==================================="
echo

echo "🖥️  System Status:"
echo "  Uptime: $(uptime -p)"
echo "  Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "  Memory: $(free -h | awk 'NR==2{printf "%s/%s (%.0f%%)", $3,$2,$3*100/$2}')"
echo "  Disk: $(df -h / | awk 'NR==2{print $3 "/" $2 " (" $5 ")"}')"
echo

echo "🐳 Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep uch
echo

echo "🏥 Health Status:"
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo "  ✅ Application: Healthy"
else
    echo "  ❌ Application: Unhealthy"
fi

echo

echo "📊 Recent Activity:"
echo "  Last backup: $(find /home/nakayama/backups -name "20*" | sort | tail -n1 | xargs basename)"
echo "  Log entries (last hour): $(journalctl --since="1 hour ago" | grep uch | wc -l)"
echo

echo "🌐 Network Status:"
echo "  Active connections: $(ss -tuln | grep -E ':80|:443|:3000|:5432' | wc -l)"

if command -v ufw &> /dev/null; then
    echo "  Firewall: $(ufw status | head -1)"
fi

echo
echo "Press Ctrl+C to exit, or any key to refresh..."
read -n 1 -s
exec "$0"
EOF

    chmod +x "$SCRIPTS_DIR/dashboard.sh"
    
    log "✅ Monitoring dashboard created"
}

# Main execution
main() {
    log "Starting monitoring setup..."
    
    setup_directories
    setup_scripts_permissions
    setup_logrotate
    setup_cron_jobs
    setup_systemd_service
    install_monitoring_tools
    create_monitoring_dashboard
    
    # Optional security enhancements
    if [ "${SETUP_SECURITY:-yes}" = "yes" ]; then
        setup_fail2ban
        setup_firewall
    fi
    
    log "🎉 Monitoring setup completed!"
    log ""
    log "Available commands:"
    log "  $SCRIPTS_DIR/dashboard.sh     - View monitoring dashboard"
    log "  $SCRIPTS_DIR/backup.sh        - Run manual backup"
    log "  $MONITORING_DIR/health-check.sh - Run health check"
    log ""
    log "Automated tasks:"
    log "  • Health checks every 5 minutes"
    log "  • Daily backups at 2:00 AM"
    log "  • Weekly Docker cleanup on Sundays"
    log ""
    log "To view cron jobs: crontab -l"
    log "To view systemd timers: systemctl list-timers"
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h")
        cat << EOF
Setup Monitoring and Automation for uch application

Usage: $0 [options]

Options:
  --help, -h          Show this help message
  --no-security       Skip security setup (fail2ban, firewall)

Environment Variables:
  SETUP_SECURITY      Set to 'no' to skip security setup (default: yes)

This script will setup:
  • Health monitoring with automatic recovery
  • Automated backups with retention
  • Log rotation
  • System monitoring tools
  • Security enhancements (fail2ban, firewall)
  • Cron jobs and systemd timers
EOF
        exit 0
        ;;
    "--no-security")
        export SETUP_SECURITY=no
        main
        ;;
    *)
        main
        ;;
esac