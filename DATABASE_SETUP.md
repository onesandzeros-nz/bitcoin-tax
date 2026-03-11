# Database Setup

This application uses **SQLite** — a file-based database that requires no server setup.

## How It Works

The database is a single file stored at `prisma/data/bitcoin_tax.db`. It's created automatically when you run migrations.

## Setup

### Docker (automatic)

If using Docker Compose, the database is created automatically on first startup. Data persists in the `./data` directory.

### Manual

```bash
mkdir -p prisma/data
npx prisma migrate dev --name init
```

## Viewing Data

```bash
# GUI browser
npx prisma studio
```

## Backup

Copy the database file:
```bash
cp prisma/data/bitcoin_tax.db prisma/data/bitcoin_tax_backup.db
```

## Reset

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## Schema Changes

If you modify `prisma/schema.prisma`:

```bash
# Create a new migration
npx prisma migrate dev --name description_of_change

# Apply to production / Docker
npx prisma migrate deploy
```
