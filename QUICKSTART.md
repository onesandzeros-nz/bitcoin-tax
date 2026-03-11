# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Docker Desktop installed ([Mac](https://www.docker.com/products/docker-desktop/) / [Windows](https://www.docker.com/products/docker-desktop/))
- Your CSV files ready

## Setup

```bash
# 1. Clone and enter the repo
git clone <repo-url>
cd bitcoin-tax

# 2. Configure password
cp .env.example .env
# Edit .env and set LOGIN_PASSWORD

# 3. Start the app
docker compose up --build
```

Open http://localhost:3123

## Usage (5 Steps)

### 1. Create Tax Year
- Go to `/tax-year`
- Click "Create Tax Year"
- Enter:
  - Year: `2025` (for 2025/2026)
  - Click "Use NZ Dates" for Apr 1 - Mar 31
  - Opening balance: `0` (or your actual BTC from previous year)
  - Opening cost basis: `0` (or actual cost in NZD)
- Click "Create Tax Year"

### 2. Import CSV Data
- Go to `/import`
- Select source: Easy Crypto / Lightning / Xapo / Kraken
- Choose CSV file
- Click "Import CSV"
- Repeat for each exchange

### 3. Calculate WAC
- Go to `/calculations`
- Select your tax year
- Click "Calculate WAC"
- Review the calculations

### 4. View Report
- Go to `/report`
- Select your tax year
- See your capital gains summary
- Share with accountant

### 5. Stop / Restart
- Stop: `Ctrl+C` or `docker compose down`
- Restart: `docker compose up`

## Sample Data

Test with sample files in `./samples/`:
- Easy Crypto: `Easy Crypto orders 2026-02-13.csv`
- Lightning: `transactions_from_2025-04-01_to_2026-02-13 (1).csv`
- Xapo: `BTC_account_20250401_20260213.csv`
- Kraken: `kraken_spot_trades_2025-03-31-2026-02-11.csv`

## Troubleshooting

**Import fails?**
- Check CSV format matches source type
- Ensure all required columns present
- Check for special characters

**Calculations look wrong?**
- Verify tax year dates are correct
- Check opening balance is accurate
- Ensure all transactions are imported
- Review calculations page for details

## Common Commands

```bash
# Start app
docker compose up

# Rebuild after changes
docker compose up --build

# Stop app
docker compose down

# View database (manual setup only)
npx prisma studio
```
