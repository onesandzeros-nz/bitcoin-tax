#!/bin/bash

# Bitcoin Tax Calculator - Setup Script
# This script helps set up the application

set -e

echo "=========================================="
echo "Bitcoin Tax Calculator - Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠ Please edit .env with your database credentials${NC}"
    echo ""
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
    echo ""
fi

# Check if MySQL is accessible
echo "Checking database connection..."
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✓ MySQL client found${NC}"
else
    echo -e "${RED}✗ MySQL client not found${NC}"
    echo -e "${YELLOW}Please install MySQL first${NC}"
    echo ""
fi

# Generate Prisma Client
echo ""
echo "Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Ask about database migration
echo "=========================================="
echo "Database Migration"
echo "=========================================="
echo ""
echo "Before running migrations, ensure:"
echo "1. MySQL is running"
echo "2. Database 'bitcoin_tax' is created"
echo "3. .env file has correct DATABASE_URL"
echo ""
read -p "Do you want to run database migrations now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Running database migrations..."
    npx prisma migrate dev --name initial_setup
    echo -e "${GREEN}✓ Database migrations completed${NC}"
    echo ""
else
    echo -e "${YELLOW}Skipping migrations. Run 'npx prisma migrate dev' when ready.${NC}"
    echo ""
fi

# Build check
echo "=========================================="
echo "Build Check"
echo "=========================================="
echo ""
read -p "Do you want to test the build now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Building application..."
    npm run build
    echo -e "${GREEN}✓ Build successful${NC}"
    echo ""
else
    echo -e "${YELLOW}Skipping build check. Run 'npm run build' to verify later.${NC}"
    echo ""
fi

# Summary
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Ensure .env has correct database credentials"
echo "2. Start development server: npm run dev"
echo "3. Open http://localhost:3000"
echo "4. Create a tax year"
echo "5. Import your CSV files"
echo "6. Calculate WAC"
echo "7. Generate tax report"
echo ""
echo "Documentation:"
echo "- README.md - Overview and features"
echo "- SETUP.md - Detailed setup guide"
echo "- DATABASE_SETUP.md - Database configuration"
echo "- IMPLEMENTATION_SUMMARY.md - Complete feature list"
echo ""
echo -e "${GREEN}Happy tax calculating! 🎉${NC}"
echo ""
