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
    echo ""
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
    echo ""
fi

# Create data directory for SQLite
if [ ! -d "prisma/data" ]; then
    mkdir -p prisma/data
    echo -e "${GREEN}✓ Created prisma/data directory${NC}"
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

# Generate Prisma Client
echo ""
echo "Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Run database migration
echo "=========================================="
echo "Database Setup (SQLite)"
echo "=========================================="
echo ""
echo "Running database migrations..."
npx prisma migrate dev --name init
echo -e "${GREEN}✓ Database created and migrations applied${NC}"
echo ""

# Summary
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:3123"
echo "3. Create a tax year"
echo "4. Import your CSV files"
echo "5. Calculate WAC"
echo "6. Generate tax report"
echo ""
echo -e "${GREEN}Happy tax calculating!${NC}"
echo ""
