#!/bin/bash

# Houston Development Intelligence CRM - Deployment Script
# This script automates the deployment process to Railway

set -e

echo "🚀 Starting deployment process..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI is not installed. Installing..."
        npm install -g @railway/cli
    fi
    
    print_success "All dependencies are available"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Run type checking
    print_status "Running TypeScript type checking..."
    npm run type-check
    
    # Run linting
    print_status "Running ESLint..."
    npm run lint
    
    # Run unit tests
    print_status "Running unit tests..."
    npm run test -- --coverage --watchAll=false
    
    print_success "All tests passed"
}

# Build the application
build_app() {
    print_status "Building application..."
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npm run db:generate
    
    # Build Next.js application
    print_status "Building Next.js application..."
    npm run build
    
    print_success "Application built successfully"
}

# Deploy to Railway
deploy_to_railway() {
    print_status "Deploying to Railway..."
    
    # Check if Railway project is linked
    if ! railway status &> /dev/null; then
        print_warning "Railway project not linked. Please run 'railway login' and 'railway link' first"
        exit 1
    fi
    
    # Deploy to Railway
    railway up
    
    print_success "Deployment completed successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Push schema changes to database
    railway run npm run db:push
    
    print_success "Database migrations completed"
}

# Seed database (optional)
seed_database() {
    read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Seeding database..."
        railway run npm run db:seed
        print_success "Database seeded successfully"
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Get the deployed URL
    DEPLOY_URL=$(railway status --json | jq -r '.url')
    
    if [ -z "$DEPLOY_URL" ]; then
        print_error "Could not get deployment URL"
        return 1
    fi
    
    print_status "Checking deployment at: $DEPLOY_URL"
    
    # Wait for deployment to be ready
    sleep 10
    
    # Check if the application is responding
    if curl -f -s "$DEPLOY_URL/api/health" > /dev/null; then
        print_success "Health check passed"
    else
        print_warning "Health check failed - application may still be starting up"
    fi
}

# Main deployment process
main() {
    print_status "Starting Houston Development Intelligence CRM deployment"
    
    # Check dependencies
    check_dependencies
    
    # Run tests
    run_tests
    
    # Build application
    build_app
    
    # Deploy to Railway
    deploy_to_railway
    
    # Run migrations
    run_migrations
    
    # Seed database (optional)
    seed_database
    
    # Health check
    health_check
    
    print_success "🎉 Deployment completed successfully!"
    print_status "Your CRM is now live on Railway"
}

# Run main function
main "$@" 