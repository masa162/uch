#!/bin/bash

# Automated Backup Script for uch application
# バックアップとローテーション管理

set -e

PROJECT_DIR="/home/nakayama/uch"
BACKUP_BASE_DIR="/home/nakayama/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_BASE_DIR}/${DATE}"
RETENTION_DAYS=7
RETENTION_WEEKLY=4
RETENTION_MONTHLY=12

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

create_backup_dir() {
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"/{db,files,config}
}

backup_database() {
    log "Backing up database..."
    
    docker exec uch_db pg_dump \
        -U uch_user \
        -d uch_prod \
        --verbose \
        --no-owner \
        --no-privileges \
        --compress=9 > "${BACKUP_DIR}/db/uch_prod_${DATE}.sql.gz"
    
    # Verify backup
    if [ -s "${BACKUP_DIR}/db/uch_prod_${DATE}.sql.gz" ]; then
        log "✅ Database backup completed: $(du -h "${BACKUP_DIR}/db/uch_prod_${DATE}.sql.gz" | cut -f1)"
    else
        log "❌ Database backup failed!"
        return 1
    fi
}

backup_files() {
    log "Backing up application files..."
    
    # Upload files
    if [ -d "${PROJECT_DIR}/uploads" ]; then
        tar -czf "${BACKUP_DIR}/files/uploads_${DATE}.tar.gz" -C "${PROJECT_DIR}" uploads/
        log "✅ Upload files backed up: $(du -h "${BACKUP_DIR}/files/uploads_${DATE}.tar.gz" | cut -f1)"
    fi
    
    # Log files
    if [ -d "/var/log" ]; then
        tar -czf "${BACKUP_DIR}/files/logs_${DATE}.tar.gz" -C "/var" log/uch* log/nginx* 2>/dev/null || true
        log "✅ Log files backed up"
    fi
}

backup_configuration() {
    log "Backing up configuration files..."
    
    cd "$PROJECT_DIR"
    
    # Docker compose files
    cp docker-compose*.yml "${BACKUP_DIR}/config/" 2>/dev/null || true
    
    # Environment files
    cp .env* "${BACKUP_DIR}/config/" 2>/dev/null || true
    
    # Nginx configuration
    if [ -d "nginx" ]; then
        cp -r nginx "${BACKUP_DIR}/config/"
    fi
    
    # Git information
    git rev-parse HEAD > "${BACKUP_DIR}/config/git_commit.txt"
    git status --porcelain > "${BACKUP_DIR}/config/git_status.txt"
    
    log "✅ Configuration files backed up"
}

create_backup_metadata() {
    log "Creating backup metadata..."
    
    cat > "${BACKUP_DIR}/metadata.json" << EOF
{
  "backup_date": "$(date -Iseconds)",
  "backup_type": "full",
  "git_commit": "$(git -C "$PROJECT_DIR" rev-parse HEAD)",
  "git_branch": "$(git -C "$PROJECT_DIR" rev-parse --abbrev-ref HEAD)",
  "docker_images": {
    "app": "$(docker inspect --format='{{.RepoTags}}' uch_app | tr -d '[]')",
    "db": "$(docker inspect --format='{{.RepoTags}}' uch_db | tr -d '[]')"
  },
  "system_info": {
    "disk_usage": "$(df -h / | awk 'NR==2 {print $5}')",
    "memory_usage": "$(free -h | awk 'NR==2{printf "%s/%s (%.0f%%)", $3,$2,$3*100/$2}')",
    "uptime": "$(uptime -p)"
  }
}
EOF
    
    log "✅ Backup metadata created"
}

cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    cd "$BACKUP_BASE_DIR"
    
    # Daily backups (keep last 7 days)
    find . -maxdepth 1 -name "20*" -mtime +$RETENTION_DAYS | head -n -5 | xargs rm -rf
    
    # Weekly backups (keep last 4 weeks - every Sunday)
    # Monthly backups (keep last 12 months - first of month)
    
    log "✅ Old backups cleaned up"
}

verify_backup() {
    log "Verifying backup integrity..."
    
    # Check if all expected files exist
    local errors=0
    
    if [ ! -f "${BACKUP_DIR}/db/uch_prod_${DATE}.sql.gz" ]; then
        log "❌ Database backup missing"
        errors=$((errors + 1))
    fi
    
    if [ ! -f "${BACKUP_DIR}/metadata.json" ]; then
        log "❌ Metadata missing"
        errors=$((errors + 1))
    fi
    
    # Test database backup integrity
    if [ -f "${BACKUP_DIR}/db/uch_prod_${DATE}.sql.gz" ]; then
        if ! gzip -t "${BACKUP_DIR}/db/uch_prod_${DATE}.sql.gz"; then
            log "❌ Database backup is corrupted"
            errors=$((errors + 1))
        fi
    fi
    
    if [ $errors -eq 0 ]; then
        log "✅ Backup verification completed successfully"
        return 0
    else
        log "❌ Backup verification failed with $errors errors"
        return 1
    fi
}

send_notification() {
    local status="$1"
    local message="$2"
    
    # Here you can add Discord/Slack/Email notifications
    if [ -n "${BACKUP_WEBHOOK_URL:-}" ]; then
        curl -X POST "$BACKUP_WEBHOOK_URL" \
             -H "Content-Type: application/json" \
             -d "{\"content\": \"📁 **Backup $status**: $message\"}" \
             2>/dev/null || true
    fi
}

# Main execution
main() {
    log "Starting backup process..."
    
    # Create backup directory structure
    create_backup_dir
    
    # Perform backups
    if backup_database && backup_files && backup_configuration; then
        create_backup_metadata
        
        if verify_backup; then
            cleanup_old_backups
            
            local backup_size=$(du -sh "$BACKUP_DIR" | cut -f1)
            log "🎉 Backup completed successfully: $backup_size"
            send_notification "SUCCESS" "Backup completed ($backup_size) - $DATE"
        else
            log "❌ Backup verification failed"
            send_notification "FAILED" "Backup verification failed - $DATE"
            exit 1
        fi
    else
        log "❌ Backup process failed"
        send_notification "FAILED" "Backup process failed - $DATE"
        exit 1
    fi
}

# Script help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    cat << EOF
Usage: $0 [options]

Options:
  --help, -h          Show this help message
  --verify-only       Only verify existing backups
  --cleanup-only      Only cleanup old backups

Environment Variables:
  BACKUP_WEBHOOK_URL  Webhook URL for notifications
  RETENTION_DAYS      Days to keep daily backups (default: 7)

Examples:
  $0                  Run full backup
  $0 --verify-only    Verify latest backup
  $0 --cleanup-only   Cleanup old backups only
EOF
    exit 0
fi

# Handle options
case "${1:-}" in
    "--verify-only")
        LATEST_BACKUP=$(find "$BACKUP_BASE_DIR" -maxdepth 1 -name "20*" | sort | tail -n1)
        if [ -n "$LATEST_BACKUP" ]; then
            BACKUP_DIR="$LATEST_BACKUP"
            verify_backup
        else
            echo "No backups found to verify"
            exit 1
        fi
        ;;
    "--cleanup-only")
        cleanup_old_backups
        ;;
    *)
        main
        ;;
esac