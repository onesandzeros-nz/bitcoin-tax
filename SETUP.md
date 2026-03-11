# Quick Setup Guide

## Option A: Docker (Recommended)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Clone this repo
3. Run `docker compose up --build`
4. Open [http://localhost:3123](http://localhost:3123)

Data persists in the `./data` directory.

## Option B: Manual (Node.js)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

The default SQLite configuration works out of the box — no database server needed.

### 3. Run Database Migrations

```bash
mkdir -p prisma/data
npx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3123](http://localhost:3123)

## Initial Setup in UI

1. **Create Tax Year** (`/tax-year`)
   - Set year: 2025 (for 2025/2026 tax year)
   - Start: 2025-04-01
   - End: 2026-03-31
   - Opening balance: 0 (or your actual opening balance)
   - Opening cost basis: 0 (or actual cost from previous year)

2. **Import Data** (`/import`)
   - Select exchange source
   - Upload CSV file
   - Verify import success

3. **Calculate WAC** (`/calculations`)
   - Select tax year
   - Click "Calculate WAC"
   - Review calculations

4. **Generate Report** (`/report`)
   - Select tax year
   - Review tax report
   - Export for accountant

## Troubleshooting

### Prisma Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# View database in GUI
npx prisma studio
```

### Import Errors

- Check CSV file format matches expected format
- Ensure no special characters in file
- Verify all required columns are present
- Check date formats (YYYY-MM-DD HH:MM:SS)

## Backup

Your database is a single file at `prisma/data/bitcoin_tax.db`. To back up, simply copy this file.
