# Database Setup Instructions

## Quick Start

### 1. Ensure MySQL is Running

```bash
# Check MySQL status
sudo systemctl status mysql    # Linux
brew services list              # macOS

# Start MySQL if not running
sudo systemctl start mysql      # Linux
brew services start mysql       # macOS
```

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE bitcoin_tax CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Update .env File

Make sure your `.env` file has the correct DATABASE_URL:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/bitcoin_tax"
```

### 4. Run Prisma Migration

This will create all tables and relationships:

```bash
npx prisma migrate dev --name initial_setup
```

You should see output like:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MySQL database "bitcoin_tax" at "localhost:3306"

Applying migration `20250213_initial_setup`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250213_initial_setup/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 45ms
```

### 5. Verify Database Setup

```bash
# Open Prisma Studio to view tables
npx prisma studio
```

Or check directly in MySQL:
```bash
mysql -u root -p bitcoin_tax

SHOW TABLES;

# Should show:
# +-------------------------+
# | Tables_in_bitcoin_tax   |
# +-------------------------+
# | CurrencyRate            |
# | ImportBatch             |
# | TaxYear                 |
# | Transaction             |
# | WACCalculation          |
# | _prisma_migrations      |
# +-------------------------+
```

## Initial Data (Optional)

### Add Currency Rates

For USD to NZD conversion (needed for Xapo and Kraken imports):

```sql
USE bitcoin_tax;

INSERT INTO CurrencyRate (id, date, fromCurrency, toCurrency, rate, source, createdAt)
VALUES
  (UUID(), '2025-04-01', 'USD', 'NZD', 1.65, 'RBNZ', NOW()),
  (UUID(), '2024-04-01', 'USD', 'NZD', 1.62, 'RBNZ', NOW()),
  (UUID(), '2023-04-01', 'USD', 'NZD', 1.61, 'RBNZ', NOW());
```

**Note**: The application has fallback rates hardcoded, so this is optional. Add specific rates for better accuracy.

### Create First Tax Year (Via UI Recommended)

You can create tax years via the web UI at `/tax-year`, or directly in database:

```sql
INSERT INTO TaxYear (id, year, startDate, endDate, openingBtcBalance, openingCostBasis, openingWac, createdAt, updatedAt)
VALUES (
  UUID(),
  2025,
  '2025-04-01 00:00:00',
  '2026-03-31 23:59:59',
  0.0,        -- openingBtcBalance
  0.0,        -- openingCostBasis
  0.0,        -- openingWac
  NOW(),
  NOW()
);
```

## Troubleshooting

### Connection Refused

```bash
# Make sure MySQL is running
sudo systemctl status mysql

# Check MySQL port
sudo netstat -tlnp | grep 3306
```

### Authentication Error

```bash
# Reset MySQL root password (Ubuntu/Debian)
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
EXIT;

# Update .env with new password
```

### Permission Denied

```bash
# Create dedicated user
sudo mysql -u root -p

CREATE USER 'bitcoin_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON bitcoin_tax.* TO 'bitcoin_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Update .env
# DATABASE_URL="mysql://bitcoin_user:secure_password@localhost:3306/bitcoin_tax"
```

### Migration Failed

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or manually drop and recreate
mysql -u root -p
DROP DATABASE bitcoin_tax;
CREATE DATABASE bitcoin_tax CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Then run migration again
npx prisma migrate dev --name initial_setup
```

## Database Maintenance

### Backup Database

```bash
# Full backup
mysqldump -u root -p bitcoin_tax > bitcoin_tax_backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u root -p bitcoin_tax < bitcoin_tax_backup_20250213.sql
```

### View Data

```bash
# Use Prisma Studio (GUI)
npx prisma studio

# Or MySQL CLI
mysql -u root -p bitcoin_tax
SELECT * FROM Transaction LIMIT 10;
SELECT * FROM WACCalculation LIMIT 10;
```

### Reset All Data (Keep Schema)

```sql
USE bitcoin_tax;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE WACCalculation;
TRUNCATE TABLE Transaction;
TRUNCATE TABLE ImportBatch;
TRUNCATE TABLE TaxYear;
TRUNCATE TABLE CurrencyRate;
SET FOREIGN_KEY_CHECKS = 1;
```

## Production Considerations

For production deployment:

1. **Create dedicated MySQL user** with limited permissions
2. **Use environment variables** for sensitive data
3. **Enable SSL** for MySQL connection
4. **Regular backups** scheduled
5. **Connection pooling** configured in Prisma
6. **Monitor database** size and performance

Example production `DATABASE_URL`:
```
DATABASE_URL="mysql://bitcoin_user:${DB_PASSWORD}@db.example.com:3306/bitcoin_tax?sslmode=require&connection_limit=5"
```

## Schema Changes

If you modify `prisma/schema.prisma`:

```bash
# Create a new migration
npx prisma migrate dev --name description_of_change

# Apply to production
npx prisma migrate deploy
```

## Success Checklist

- [ ] MySQL server running
- [ ] Database `bitcoin_tax` created
- [ ] `.env` file configured with correct DATABASE_URL
- [ ] Migration completed successfully (`npx prisma migrate dev`)
- [ ] Tables visible in Prisma Studio
- [ ] Application starts without database errors
- [ ] Can create tax year via UI
- [ ] Can import sample CSV files
- [ ] Calculations run successfully

Once all items are checked, your database is ready for production use! 🎉
