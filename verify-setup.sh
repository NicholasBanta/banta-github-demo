#!/bin/bash
# Setup Verification Script for Voter Registration System
# This script verifies all components are properly installed

echo "========================================="
echo "Voter Registration System - Setup Check"
echo "========================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  ✅ Node.js installed: $NODE_VERSION"
else
    echo "  ❌ Node.js NOT found. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
echo ""
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  ✅ npm installed: $NPM_VERSION"
else
    echo "  ❌ npm NOT found. Please install npm."
    exit 1
fi

# Check dependencies
echo ""
echo "✓ Checking project dependencies..."
if [ -f "package.json" ]; then
    echo "  ✅ package.json found"
else
    echo "  ❌ package.json NOT found"
    exit 1
fi

if [ -d "node_modules" ]; then
    echo "  ✅ node_modules found (dependencies installed)"
else
    echo "  ⚠️  node_modules NOT found. Run 'npm install' first"
fi

# Check required files
echo ""
echo "✓ Checking required files..."

FILES=(
    "server.js"
    "registration.html"
    "package.json"
    "API_README.md"
    "QUICKSTART.md"
    "API_TESTING.md"
    "BACKEND_SUMMARY.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file NOT found"
    fi
done

# Check Node modules
echo ""
echo "✓ Checking required npm packages..."

PACKAGES=("express" "cors" "body-parser")
for package in "${PACKAGES[@]}"; do
    if [ -d "node_modules/$package" ]; then
        echo "  ✅ $package"
    else
        echo "  ⚠️  $package not installed"
    fi
done

# Port check
echo ""
echo "✓ Checking if port 5000 is available..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "  ⚠️  Port 5000 is already in use"
    echo "     Use: set PORT=5001 && npm run dev"
else
    echo "  ✅ Port 5000 is available"
fi

# Check .env
echo ""
echo "✓ Checking environment configuration..."
if [ -f ".env" ]; then
    echo "  ✅ .env file found"
else
    if [ -f ".env.example" ]; then
        echo "  ⚠️  .env file not found (using defaults)"
        echo "     Copy .env.example to .env and customize if needed"
    else
        echo "  ❌ .env.example not found"
    fi
fi

# Summary
echo ""
echo "========================================="
echo "Setup Verification Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. If any dependencies are missing, run: npm install"
echo "2. Start the backend:                   npm run dev"
echo "3. Open frontend in browser:            registration.html"
echo "4. For testing guide, see:              QUICKSTART.md"
echo ""
