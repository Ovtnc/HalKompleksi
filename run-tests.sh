#!/bin/bash

# Hal Kompleksi Test Runner Script
# This script runs all tests for both backend and frontend

set -e

echo "🧪 Hal Kompleksi Test Suite"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    print_status "Backend dependencies installed"
else
    print_warning "Backend dependencies already installed"
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../HalKompleksi
if [ ! -d "node_modules" ]; then
    npm install
    print_status "Frontend dependencies installed"
else
    print_warning "Frontend dependencies already installed"
fi

cd ..

echo ""
echo "🧪 Running Backend Tests..."
echo "================================"

# Run backend tests
cd backend
if npm run test:coverage; then
    print_status "Backend tests passed"
else
    print_error "Backend tests failed"
    exit 1
fi

echo ""
echo "🧪 Running Frontend Tests..."
echo "================================"

# Run frontend tests
cd ../HalKompleksi
if npm run test:coverage; then
    print_status "Frontend tests passed"
else
    print_error "Frontend tests failed"
    exit 1
fi

cd ..

echo ""
echo "📊 Test Coverage Summary"
echo "================================"

# Display coverage summaries
if [ -f "backend/coverage/lcov-report/index.html" ]; then
    echo "Backend coverage report: backend/coverage/lcov-report/index.html"
fi

if [ -f "HalKompleksi/coverage/lcov-report/index.html" ]; then
    echo "Frontend coverage report: HalKompleksi/coverage/lcov-report/index.html"
fi

echo ""
print_status "All tests completed successfully! 🎉"

echo ""
echo "📋 Test Commands:"
echo "  Backend only:     cd backend && npm test"
echo "  Frontend only:    cd HalKompleksi && npm test"
echo "  Watch mode:       npm run test:watch"
echo "  Coverage:         npm run test:coverage"
echo "  CI mode:          npm run test:ci"
