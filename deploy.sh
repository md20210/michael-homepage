#!/bin/bash
# =============================================================================
# Comprehensive Deployment Script for Michael Dabrock Portfolio
# =============================================================================
#
# This script handles deployment of:
# 1. Main Website (michael-homepage)
# 2. PrivateGPT Frontend
#
# Deployment targets:
# - Strato (SFTP)
# - GitHub
# - Railway (auto-deploy from GitHub)
#
# =============================================================================

set -e  # Exit on error (disabled for some sections)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Deployment options
DEPLOY_STRATO=true
DEPLOY_GITHUB=true
SKIP_AUDIO=true
SKIP_BUILD=false
SKIP_PRIVATEGPT=false
DRY_RUN=false

# Counters
ERRORS=0
WARNINGS=0

# Log file
LOG_FILE="deployment-$(date +%Y%m%d-%H%M%S).log"

# =============================================================================
# Helper Functions
# =============================================================================

log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

error() {
    ((ERRORS++))
    log "${RED}❌ ERROR: ${1}${NC}"
}

warning() {
    ((WARNINGS++))
    log "${YELLOW}⚠️  WARNING: ${1}${NC}"
}

success() {
    log "${GREEN}✅ ${1}${NC}"
}

info() {
    log "${BLUE}ℹ️  ${1}${NC}"
}

section() {
    log "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "${BLUE}  ${1}${NC}"
    log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

confirm() {
    if [ "$DRY_RUN" = true ]; then
        log "${YELLOW}[DRY RUN] Would ask: ${1}${NC}"
        return 0
    fi

    read -p "$(echo -e ${YELLOW}${1}${NC} [y/N]: )" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 1
    fi
    return 0
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        error "Required command not found: $1"
        return 1
    fi
    return 0
}

# =============================================================================
# Verification Functions
# =============================================================================

verify_strato_upload() {
    local url="$1"
    info "Verifying: $url"

    # Check for successful HTTP status codes (200, 301, 302)
    if curl -s --head "$url" | head -1 | grep -qE "HTTP/[0-9.]+ (200|301|302)"; then
        success "URL accessible: $url"
        return 0
    else
        error "URL not accessible: $url"
        return 1
    fi
}

verify_git_push() {
    info "Verifying git push..."

    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/main)

    if [ "$local_commit" = "$remote_commit" ]; then
        success "Git push verified (commit: ${local_commit:0:7})"
        return 0
    else
        error "Git push verification failed"
        error "Local: ${local_commit:0:7}, Remote: ${remote_commit:0:7}"
        return 1
    fi
}

verify_railway() {
    local url="$1"
    info "Verifying Railway deployment: $url"
    info "Note: Railway auto-deploys from GitHub (may take 2-5 minutes)"

    # Check for HTTP 200 status
    if curl -s --head "$url" | head -1 | grep -qE "HTTP/[0-9.]+ 200"; then
        success "Railway deployment accessible"
        return 0
    else
        warning "Railway deployment not yet accessible (may still be deploying)"
        return 1
    fi
}

# =============================================================================
# Build Functions
# =============================================================================

build_main_website() {
    section "Building Main Website"

    if [ "$SKIP_BUILD" = true ]; then
        warning "Skipping build (--skip-build flag)"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        info "[DRY RUN] Would build main website"
        return 0
    fi

    info "Running: npm run build"
    if npm run build >> "$LOG_FILE" 2>&1; then
        success "Main website build completed"

        # Check dist folder
        if [ -d "dist" ]; then
            local file_count=$(find dist -type f | wc -l)
            info "Build output: $file_count files in dist/"
        else
            error "dist/ folder not found after build"
            return 1
        fi
        return 0
    else
        error "Main website build failed (check $LOG_FILE)"
        return 1
    fi
}

build_privategpt() {
    section "Building PrivateGPT Frontend"

    if [ "$SKIP_PRIVATEGPT" = true ]; then
        warning "Skipping PrivateGPT (--skip-privategpt flag)"
        return 0
    fi

    if [ "$SKIP_BUILD" = true ]; then
        warning "Skipping build (--skip-build flag)"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        info "[DRY RUN] Would build PrivateGPT"
        return 0
    fi

    info "Changing to privategpt/frontend directory"
    cd privategpt/frontend

    info "Running: npm run build"
    if npm run build >> "../../$LOG_FILE" 2>&1; then
        success "PrivateGPT build completed"

        # Check dist folder
        if [ -d "dist" ]; then
            local file_count=$(find dist -type f | wc -l)
            info "Build output: $file_count files in dist/"
        else
            error "dist/ folder not found after build"
            cd ../..
            return 1
        fi

        cd ../..
        return 0
    else
        error "PrivateGPT build failed (check $LOG_FILE)"
        cd ../..
        return 1
    fi
}

# =============================================================================
# Strato Upload Functions
# =============================================================================

upload_main_to_strato() {
    section "Uploading Main Website to Strato"

    if [ "$DEPLOY_STRATO" != true ]; then
        warning "Skipping Strato upload (--no-strato flag)"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        info "[DRY RUN] Would upload main website to Strato"
        return 0
    fi

    local upload_cmd="./upload-to-strato.sh"
    if [ "$SKIP_AUDIO" = true ]; then
        upload_cmd="$upload_cmd --skip-audio"
    fi

    info "Running: $upload_cmd"
    if $upload_cmd >> "$LOG_FILE" 2>&1; then
        success "Main website uploaded to Strato"
        return 0
    else
        error "Main website upload failed (check $LOG_FILE)"
        return 1
    fi
}

upload_privategpt_to_strato() {
    section "Uploading PrivateGPT to Strato"

    if [ "$SKIP_PRIVATEGPT" = true ]; then
        warning "Skipping PrivateGPT upload (--skip-privategpt flag)"
        return 0
    fi

    if [ "$DEPLOY_STRATO" != true ]; then
        warning "Skipping Strato upload (--no-strato flag)"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        info "[DRY RUN] Would upload PrivateGPT to Strato"
        return 0
    fi

    info "Running: ./upload-privategpt-to-strato.sh"

    # Manual upload due to script timeout issues
    if [ -f .env.sftp ]; then
        source .env.sftp

        cd privategpt/frontend/dist
        local uploaded=0
        local failed=0

        for file in index.html vite.svg .htaccess assets/*.css assets/*.js; do
            if [ -f "$file" ]; then
                info "Uploading $file..."
                if curl -s --ftp-create-dirs -T "$file" \
                    "sftp://$SFTP_HOST:${SFTP_PORT:-22}/htdocs/privategpt/$file" \
                    --user "$SFTP_USER:$SFTP_PASS" -k \
                    --connect-timeout 30 --max-time 120 >> "../../../$LOG_FILE" 2>&1; then
                    ((uploaded++))
                else
                    ((failed++))
                    error "Failed to upload: $file"
                fi
            fi
        done

        cd ../../..

        if [ $failed -eq 0 ]; then
            success "PrivateGPT uploaded to Strato ($uploaded files)"
            return 0
        else
            error "PrivateGPT upload completed with errors ($failed failed, $uploaded succeeded)"
            return 1
        fi
    else
        error ".env.sftp not found"
        return 1
    fi
}

# =============================================================================
# Git Functions
# =============================================================================

deploy_to_github() {
    section "Deploying to GitHub"

    if [ "$DEPLOY_GITHUB" != true ]; then
        warning "Skipping GitHub deployment (--no-github flag)"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        info "[DRY RUN] Would deploy to GitHub"
        return 0
    fi

    # Check for changes (unstaged OR staged)
    if git diff-index --quiet HEAD -- && git diff --staged --quiet; then
        info "No changes to commit (nothing staged or unstaged)"
        return 0
    fi

    info "Changes detected, preparing commit..."
    git status --short

    if ! confirm "Commit and push these changes to GitHub?"; then
        warning "GitHub deployment cancelled by user"
        return 1
    fi

    # Stage changes
    info "Staging changes..."
    git add .

    # Create commit
    local commit_msg="Deployment update $(date +%Y-%m-%d\ %H:%M)

Automated deployment via deploy.sh

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

    if git commit -m "$commit_msg" >> "$LOG_FILE" 2>&1; then
        success "Commit created"
    elif git status --porcelain | grep -q '^'; then
        error "Failed to create commit (unexpected error)"
        return 1
    else
        info "No changes to commit after staging"
        return 0
    fi

    # Push to GitHub
    info "Pushing to GitHub..."
    if git push origin main >> "$LOG_FILE" 2>&1; then
        success "Pushed to GitHub"
        return 0
    else
        error "Failed to push to GitHub"
        return 1
    fi
}

# =============================================================================
# Main Deployment Flow
# =============================================================================

run_deployment() {
    section "🚀 Starting Deployment Process"

    info "Log file: $LOG_FILE"
    info "Project: Michael Dabrock Portfolio"
    info "Timestamp: $(date)"

    if [ "$DRY_RUN" = true ]; then
        warning "DRY RUN MODE - No actual changes will be made"
    fi

    # Pre-flight checks
    section "Pre-flight Checks"

    check_command "npm" || return 1
    check_command "git" || return 1
    check_command "curl" || return 1

    if [ "$DEPLOY_STRATO" = true ] && [ ! -f .env.sftp ]; then
        error ".env.sftp not found (required for Strato upload)"
        return 1
    fi

    success "All pre-flight checks passed"

    # Build phase
    build_main_website || return 1
    build_privategpt || return 1

    # Upload phase
    upload_main_to_strato || return 1
    upload_privategpt_to_strato || return 1

    # Git phase
    deploy_to_github || return 1

    # Verification phase
    section "Verification Phase"

    if [ "$DEPLOY_STRATO" = true ] && [ "$DRY_RUN" != true ]; then
        verify_strato_upload "https://www.dabrock.eu" || warning "Main website verification failed"

        if [ "$SKIP_PRIVATEGPT" != true ]; then
            verify_strato_upload "https://www.dabrock.eu/privategpt" || warning "PrivateGPT verification failed"
        fi
    fi

    if [ "$DEPLOY_GITHUB" = true ] && [ "$DRY_RUN" != true ]; then
        verify_git_push || warning "Git push verification failed"
    fi

    if [ "$DEPLOY_GITHUB" = true ] && [ "$DRY_RUN" != true ]; then
        verify_railway "https://michael-homepage-production.up.railway.app" || true
    fi

    # Summary
    section "📊 Deployment Summary"

    if [ $ERRORS -eq 0 ]; then
        success "Deployment completed successfully! 🎉"
    else
        error "Deployment completed with $ERRORS error(s)"
    fi

    if [ $WARNINGS -gt 0 ]; then
        warning "Total warnings: $WARNINGS"
    fi

    info "Full log: $LOG_FILE"

    # Test URLs
    log "\n${GREEN}🌐 Test Your Deployment:${NC}"
    log "   • Main Website: https://www.dabrock.eu"
    log "   • PrivateGPT: https://www.dabrock.eu/privategpt"
    log "   • Railway: https://michael-homepage-production.up.railway.app"
    log "   • GitHub: https://github.com/md20210/michael-homepage"

    return $ERRORS
}

# =============================================================================
# Command Line Arguments
# =============================================================================

show_help() {
    cat << EOF
🚀 Michael Dabrock Portfolio - Deployment Script

USAGE:
    ./deploy.sh [OPTIONS]

OPTIONS:
    --help, -h              Show this help message
    --dry-run               Show what would be done without making changes
    --skip-build            Skip build steps (use existing builds)
    --skip-audio            Skip audio files when uploading to Strato
    --skip-privategpt       Skip PrivateGPT deployment
    --no-strato             Skip Strato upload
    --no-github             Skip GitHub deployment
    --all                   Deploy everything (default)

EXAMPLES:
    # Full deployment (default)
    ./deploy.sh

    # Dry run to see what would happen
    ./deploy.sh --dry-run

    # Deploy only to Strato (no GitHub/Railway)
    ./deploy.sh --no-github

    # Quick update (skip builds, use existing)
    ./deploy.sh --skip-build

    # Deploy only main website (skip PrivateGPT)
    ./deploy.sh --skip-privategpt

    # Deploy to GitHub only
    ./deploy.sh --no-strato

DEPLOYMENT TARGETS:
    ✓ Strato SFTP (www.dabrock.eu)
    ✓ GitHub (github.com/md20210/michael-homepage)
    ✓ Railway (auto-deploys from GitHub)

LOG FILES:
    Logs are saved to: deployment-YYYYMMDD-HHMMSS.log

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-audio)
            SKIP_AUDIO=true
            shift
            ;;
        --skip-privategpt)
            SKIP_PRIVATEGPT=true
            shift
            ;;
        --no-strato)
            DEPLOY_STRATO=false
            shift
            ;;
        --no-github)
            DEPLOY_GITHUB=false
            shift
            ;;
        --all)
            # Default behavior
            shift
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# =============================================================================
# Main Entry Point
# =============================================================================

main() {
    # Change to script directory
    cd "$(dirname "$0")"

    # Show banner
    log "${GREEN}"
    log "╔═══════════════════════════════════════════════════════════════╗"
    log "║                                                               ║"
    log "║   Michael Dabrock Portfolio - Deployment Script              ║"
    log "║                                                               ║"
    log "╚═══════════════════════════════════════════════════════════════╝"
    log "${NC}"

    # Run deployment
    if run_deployment; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main
