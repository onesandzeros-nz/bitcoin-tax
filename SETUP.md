# Quick Setup Guide

## 1. Database Setup

### Install MySQL (if not already installed)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

### Create Database

```bash
# Log into MySQL
sudo mysql -u root -p

# Create database
CREATE DATABASE bitcoin_tax;

# Create user (optional but recommended)
CREATE USER 'bitcoin_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON bitcoin_tax.* TO 'bitcoin_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 2. Configure Environment

Update `.env` file:
```bash
DATABASE_URL="mysql://bitcoin_user:your_secure_password@localhost:3306/bitcoin_tax"
```

Or if using root:
```bash
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/bitcoin_tax"
```

## 3. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all necessary tables
- Set up relationships
- Generate Prisma Client

## 4. (Optional) Add Sample Currency Rates

For Xapo and Kraken imports (USD transactions), add USD→NZD rates:

```bash
npx prisma studio
```

Then manually add records to `CurrencyRate` table:
- Date: 2025-04-01
- From Currency: USD
- To Currency: NZD
- Rate: 1.65
- Source: RBNZ

Or use SQL directly:
```sql
INSERT INTO CurrencyRate (id, date, fromCurrency, toCurrency, rate, source, createdAt)
VALUES
  (UUID(), '2025-04-01', 'USD', 'NZD', 1.65, 'RBNZ', NOW()),
  (2025-04-01', 'USD', 'NZD', 1.62, 'RBNZ', NOW()),
  (UUID(), '2024-01-01', 'USD', 'NZD', 1.61, 'RBNZ', NOW());
```

## 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Initial Setup in UI

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

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u bitcoin_user -p -h localhost bitcoin_tax

# Check if MySQL is running
sudo systemctl status mysql   # Linux
brew services list             # macOS
```

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

## Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

For production, consider:
- Using environment variables for secrets
- Setting up proper MySQL user permissions
- Regular database backups
- HTTPS configuration
- Authentication/authorization (if needed)
