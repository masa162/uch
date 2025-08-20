#!/bin/bash

# VPS Health Check Script
# 継続的監視とアラート用

set -e

PROJECT_DIR="/home/nakayama/uch"
LOG_FILE="/var/log/uch-monitor.log"
ALERT_WEBHOOK="${ALERT_WEBHOOK_URL:-}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

send_alert() {
    local message="$1"
    local level="$2"
    
    log "ALERT [$level]: $message"
    
    # Discord/Slack webhook notification (if configured)
    if [ -n "$ALERT_WEBHOOK" ]; then
        curl -X POST "$ALERT_WEBHOOK" \
             -H "Content-Type: application/json" \
             -d "{\"content\": \"🚨 **$level**: $message\"}" \
             2>/dev/null || true
    fi
}

check_containers() {
    log "Checking container status..."
    
    local app_status=$(docker inspect --format='{{.State.Health.Status}}' uch_app 2>/dev/null || echo "not_found")
    local db_status=$(docker inspect --format='{{.State.Health.Status}}' uch_db 2>/dev/null || echo "not_found")
    
    if [ "$app_status" != "healthy" ]; then
        send_alert "App container is $app_status" "CRITICAL"
        return 1
    fi
    
    if [ "$db_status" != "healthy" ]; then
        send_alert "DB container is $db_status" "CRITICAL"
        return 1
    fi
    
    log "✅ All containers are healthy"
    return 0
}

check_application() {
    log "Checking application endpoints..."
    
    # Health endpoint
    if ! curl -f -s --max-time 10 http://localhost:3000/api/health >/dev/null; then
        send_alert "Health endpoint is not responding" "CRITICAL"
        return 1
    fi
    
    # Main pages
    if ! curl -f -s --max-time 10 http://localhost:3000/ >/dev/null; then
        send_alert "Homepage is not accessible" "WARNING"
        return 1
    fi
    
    if ! curl -f -s --max-time 10 http://localhost:3000/essays >/dev/null; then
        send_alert "Essays page is not accessible" "WARNING"
        return 1
    fi
    
    log "✅ All application endpoints are responding"
    return 0
}

check_system_resources() {
    log "Checking system resources..."
    
    # Disk usage
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        send_alert "Disk usage is ${disk_usage}%" "WARNING"
    fi
    
    # Memory usage
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$mem_usage" -gt 90 ]; then
        send_alert "Memory usage is ${mem_usage}%" "WARNING"
    fi
    
    # Docker images cleanup if disk space is low
    if [ "$disk_usage" -gt 80 ]; then
        log "High disk usage detected, cleaning up Docker images..."
        docker image prune -f
        docker system prune -f
    fi
    
    log "✅ System resources are within acceptable limits"
    return 0
}

check_logs() {
    log "Checking for errors in application logs..."
    
    # Check for recent critical errors
    local error_count=$(docker logs uch_app --since="5m" 2>&1 | grep -i "error\|critical\|fatal" | wc -l)
    
    if [ "$error_count" -gt 10 ]; then
        send_alert "High error count in application logs: $error_count errors in last 5 minutes" "WARNING"
    fi
    
    log "✅ Log check completed"
    return 0
}

auto_recovery() {
    log "Attempting automatic recovery..."
    
    cd "$PROJECT_DIR"
    
    # Try to restart unhealthy containers
    if ! check_containers; then
        log "Restarting containers..."
        docker compose -f docker-compose.prod.yml restart
        
        # Wait for containers to be healthy
        sleep 30
        
        if check_containers && check_application; then
            send_alert "Automatic recovery successful" "INFO"
            return 0
        else
            send_alert "Automatic recovery failed - manual intervention required" "CRITICAL"
            return 1
        fi
    fi
}

# Main execution
main() {
    log "Starting health check..."
    
    local all_checks_passed=true
    
    # Run all checks
    check_containers || all_checks_passed=false
    check_application || all_checks_passed=false
    check_system_resources || all_checks_passed=false
    check_logs || all_checks_passed=false
    
    if [ "$all_checks_passed" = true ]; then
        log "✅ All health checks passed"
        exit 0
    else
        log "⚠️  Some health checks failed"
        
        # Attempt automatic recovery
        if auto_recovery; then
            log "🔧 Automatic recovery completed"
            exit 0
        else
            log "❌ Manual intervention required"
            exit 1
        fi
    fi
}

# Trap signals for graceful shutdown
trap 'log "Health check interrupted"; exit 1' INT TERM

main "$@"