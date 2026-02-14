# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ MySQL 8.0+ installed and running
- ✅ Your CSV files ready

## Setup (First Time Only)

### Option 1: Automated Setup

```bash
./setup.sh
```

Follow the prompts and you're done!

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create database
mysql -u root -p
CREATE DATABASE bitcoin_tax;
EXIT;

# 3. Configure environment
# Edit .env and update DATABASE_URL

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Start server
npm run dev
```

## Usage (5 Steps)

### 1. Open Application
```bash
npm run dev
```
Open http://localhost:3000

### 2. Create Tax Year
- Go to `/tax-year`
- Click "Create Tax Year"
- Enter:
  - Year: `2025` (for 2025/2026)
  - Click "Use NZ Dates" for Apr 1 - Mar 31
  - Opening balance: `0` (or your actual BTC from previous year)
  - Opening cost basis: `0` (or actual cost in NZD)
- Click "Create Tax Year"

### 3. Import CSV Data
- Go to `/import`
- Select source: Easy Crypto / Lightning / Xapo / Kraken
- Choose CSV file
- Click "Import CSV"
- Repeat for each exchange

### 4. Calculate WAC
- Go to `/calculations`
- Select your tax year
- Click "Calculate WAC"
- Review the calculations

### 5. View Report
- Go to `/report`
- Select your tax year
- See your capital gains summary
- Share with accountant

## That's it! 🎉

## Sample Data

Test with sample files in `./samples/`:
- Easy Crypto: `Easy Crypto orders 2026-02-13.csv`
- Lightning: `transactions_from_2025-04-01_to_2026-02-13 (1).csv`
- Xapo: `BTC_account_20250401_20260213.csv`
- Kraken: `kraken_spot_trades_2025-03-31-2026-02-11.csv`

## Troubleshooting

**Can't connect to database?**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Check .env has correct password
cat .env
```

**Import fails?**
- Check CSV format matches source type
- Ensure all required columns present
- Check for special characters

**Calculations look wrong?**
- Verify tax year dates are correct
- Check opening balance is accurate
- Ensure all transactions are imported
- Review calculations page for details

## Need Help?

- 📖 Full docs: `README.md`
- 🔧 Detailed setup: `SETUP.md`
- 💾 Database help: `DATABASE_SETUP.md`
- ✅ Feature list: `IMPLEMENTATION_SUMMARY.md`

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# View database
npx prisma studio

# Run migrations
npx prisma migrate dev

# Reset database (deletes data!)
npx prisma migrate reset
```

Happy calculating! 🚀
