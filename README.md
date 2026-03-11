# Bitcoin Tax Calculator

A Next.js application for calculating Bitcoin capital gains/losses using the Weighted Average Cost (WAC) method for New Zealand IRD tax reporting.

## Motivation

This project lets you calculate your Bitcoin capital gains for tax purposes without revealing to your accountant how much Bitcoin you hold, have held, or what specific transactions you've made. You run the calculations yourself and provide only the final tax-relevant figures — total capital gains/losses, opening and closing cost bases — keeping your full transaction history and balances private.

## Features

- **Multi-source CSV import**: Easy Crypto, Lightning Pay, Xapo, Kraken
- **WAC calculation**: Automated Weighted Average Cost calculation
- **Tax year management**: Configure opening balances for NZ tax years (Apr 1 - Mar 31)
- **Detailed reporting**: Transaction history, calculations breakdown, and tax reports
- **Auditable**: All raw data and calculations preserved for accountant review

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended), **or** Node.js 18+ and npm
- CSV export files from your exchanges

## Quick Start with Docker (Recommended)

### Install Docker Desktop

- **Mac**: Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/). Open the `.dmg`, drag Docker to Applications, and launch it. You'll see a whale icon in the menu bar when it's running.
- **Windows**: Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/). Run the installer and restart your computer when prompted. Make sure WSL 2 is enabled (the installer will guide you). Launch Docker Desktop from the Start menu.

Once Docker Desktop is running (whale icon visible), open a terminal (Terminal on Mac, PowerShell on Windows) and continue:

### Run the app

1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd bitcoin-tax
   ```

2. **Set your password:**

   Copy `.env.example` to `.env` and change the `LOGIN_PASSWORD`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `LOGIN_PASSWORD` to something secure.

3. **Start the app:**
   ```bash
   docker compose up --build
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

That's it. The database is created automatically. Your data is stored in the `./data` directory and persists across restarts.

To stop: press `Ctrl+C` in the terminal, or run `docker compose down`

## Manual Setup (Node.js)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   ```

3. **Run database migrations:**
   ```bash
   mkdir -p prisma/data
   npx prisma migrate dev --name init
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

Or use the setup script: `bash setup.sh`

## Usage Guide

### 1. Set Up Tax Year

1. Navigate to **Tax Year** page
2. Click "Create Tax Year"
3. Enter:
   - Year (e.g., 2025 for 2025/2026 tax year)
   - Start date (April 1)
   - End date (March 31 next year)
   - Opening BTC balance (if you had BTC from previous year)
   - Opening cost basis in NZD (what you paid for that BTC)
4. The system automatically calculates opening WAC

### 2. Import CSV Data

1. Navigate to **Import** page
2. Select exchange source (Easy Crypto, Lightning, Xapo, or Kraken)
3. Choose your CSV file
4. Click "Import CSV"
5. System will parse and import all transactions

**Supported CSV formats:**

- **Easy Crypto**: Date, Order ID, Type, From symbol, To symbol, From amount, To amount, ...
- **Lightning Pay**: Date, Sent Amount, Sent Currency, Received Amount, Received Currency, Fee Amount, ...
- **Xapo**: Transaction Date/Time, Action Taken, Currency, Amount, BTC Spot/FX, USD Amount, ...
- **Kraken**: txid, time, type, price, cost, fee, vol, pair, ...

### 3. View Transactions

Navigate to **Transactions** page to see all imported transactions with:
- Date, source, type (BUY/SELL/CASHBACK/etc)
- BTC amounts, fiat amounts, prices
- Source references

### 4. Calculate WAC

1. Navigate to **Calculations** page
2. Select tax year
3. Click "Calculate WAC"
4. System processes all transactions chronologically and calculates:
   - Running BTC balance
   - Running cost basis
   - WAC price at each transaction
   - Cost basis for disposals
   - Capital gains/losses

### 5. Generate Report

Navigate to **Report** page to view:
- Opening and closing balances
- Total capital gains/losses for tax year
- Detailed disposal transactions
- Summary for IRD reporting

## WAC Calculation Method

The Weighted Average Cost method:

1. **For acquisitions (BUY, CASHBACK):**
   - Add BTC to balance
   - Add cost (including fees) to total cost basis
   - Recalculate WAC = Total Cost / Total BTC

2. **For disposals (SELL):**
   - Calculate capital gain = Proceeds - (WAC × BTC sold)
   - Reduce balance by BTC sold
   - Reduce cost basis by (WAC × BTC sold)

3. **Opening balance:**
   - If you had BTC from previous year, enter opening balance and cost
   - All transactions build upon this opening WAC

## Example

**Opening balance:** 0.5 BTC @ $100,000 NZD cost basis
- Opening WAC = $100,000 / 0.5 = $200,000 per BTC

**Transaction 1:** Buy 0.3 BTC for $75,000 NZD
- New balance = 0.8 BTC
- New cost basis = $175,000
- New WAC = $175,000 / 0.8 = $218,750 per BTC

**Transaction 2:** Sell 0.4 BTC for $100,000 NZD
- Cost basis = $218,750 × 0.4 = $87,500
- Capital gain = $100,000 - $87,500 = $12,500
- New balance = 0.4 BTC
- New cost basis = $175,000 - $87,500 = $87,500

## Database

Uses SQLite (file-based, no server needed). The database file is stored at `prisma/data/bitcoin_tax.db` (or `./data/bitcoin_tax.db` when using Docker).

**Schema:**
- **Transaction**: All imported transactions
- **WACCalculation**: Calculated WAC for each transaction
- **TaxYear**: Tax year configuration with opening balances
- **ImportBatch**: Import history
- **CurrencyRate**: USD to NZD conversion rates (for Xapo/Kraken)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Create new migration
npm run prisma:migrate
```

## Currency Conversion

Xapo and Kraken transactions are in USD and are converted to NZD using:
1. Stored rates from `CurrencyRate` table
2. Fallback to approximate historical averages (2025: 1.65, 2024: 1.62)

**To add custom rates:** Use Prisma Studio (`npx prisma studio`) to add records to the `CurrencyRate` table.

## Sample Data

Sample CSV files are in `./samples/` directory for testing.

## Important Notes

- **Backup your data** before running calculations
- **Review all calculations** with your accountant
- **Keep raw CSV files** for audit purposes
- This tool is for assistance only - consult a tax professional for IRD compliance

## License

Private use only.
