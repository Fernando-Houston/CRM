#!/bin/bash

# Houston Development Intelligence CRM - Repository Setup Script
# This script will set up the git repository and prepare for deployment

set -e

echo "🚀 Setting up Houston Development Intelligence CRM Repository"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is available
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git is available"
}

# Initialize git repository
init_git() {
    print_status "Initializing git repository..."
    
    if [ -d ".git" ]; then
        print_warning "Git repository already exists"
        return
    fi
    
    git init
    print_success "Git repository initialized"
}

# Create .gitignore file
create_gitignore() {
    print_status "Creating .gitignore file..."
    
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Railway
.railway/

# Playwright
test-results/
playwright-report/
playwright/.cache/

# Jest
coverage/
.nyc_output/

# Prisma
prisma/migrations/
EOF

    print_success ".gitignore file created"
}

# Add all files to git
add_files() {
    print_status "Adding files to git repository..."
    
    git add .
    print_success "All files added to git"
}

# Create initial commit
create_commit() {
    print_status "Creating initial commit..."
    
    git commit -m "Initial commit: Houston Development Intelligence CRM v1.0.0

Complete CRM system for real estate development lead management:
- Lead Management with advanced scoring
- Deal Pipeline with 8-stage tracking
- Property Management with intelligent matching
- Market Intelligence and analytics
- Website integration with houstonlandguy.com
- Comprehensive testing suite
- Production-ready deployment configuration"
    
    print_success "Initial commit created"
}

# Add remote repository
add_remote() {
    print_status "Adding GitHub remote repository..."
    
    git remote add origin https://github.com/Fernando-Houston/CRM.git
    print_success "Remote repository added"
}

# Push to GitHub
push_to_github() {
    print_status "Pushing to GitHub repository..."
    
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        print_success "Successfully pushed to GitHub!"
    else
        print_warning "Push failed. You may need to authenticate with GitHub first."
        print_status "Please run: git push -u origin main"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_error "package.json not found"
        exit 1
    fi
}

# Setup environment
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        cp env.example .env.local
        print_warning "Environment file created. Please edit .env.local with your configuration."
    else
        print_success "Environment file already exists"
    fi
}

# Main setup process
main() {
    print_status "Starting Houston Development Intelligence CRM repository setup"
    
    # Check prerequisites
    check_git
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Initialize git
    init_git
    
    # Create gitignore
    create_gitignore
    
    # Add files
    add_files
    
    # Create commit
    create_commit
    
    # Add remote
    add_remote
    
    # Push to GitHub
    push_to_github
    
    print_success "🎉 Repository setup complete!"
    print_status "Next steps:"
    print_status "1. Configure your environment variables in .env.local"
    print_status "2. Set up Railway deployment: ./scripts/deploy.sh"
    print_status "3. Deploy database: npm run db:push && npm run db:seed"
    print_status "4. Start development: npm run dev"
}

# Run main function
main "$@" 